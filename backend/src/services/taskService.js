// All task business rules live here, so controllers stay small
// and the same rule is used everywhere (list, details, dashboard, CSV).

const mongoose = require('mongoose');
const Task = require('../models/Task');
const Employee = require('../models/Employee');
const ApiError = require('../utils/ApiError');
const { getToday, formatDate, isValidDateString, toDateOnly } = require('../utils/dateUtils');
const { escapeRegex } = require('../utils/queryHelpers');
const {
  EMPLOYEE_STATUS,
  TASK_STATUS,
  STATUS_TRANSITIONS,
  ACTIVE_TASK_STATUSES,
  CLOSED_TASK_STATUSES,
  MAX_ACTIVE_TASKS_PER_EMPLOYEE,
  DEPARTMENTS,
  TASK_PRIORITIES,
} = require('../constants');

const OVERDUE_FILTER_VALUE = 'Overdue';

/* ------------------------------------------------------------------ */
/* Overdue                                                             */
/* ------------------------------------------------------------------ */

// Mongo filter for overdue tasks: today is later than due date AND task is still open
const overdueCondition = () => ({
  status: { $in: ACTIVE_TASK_STATUSES },
  dueDate: { $lt: getToday() },
});

const isTaskOverdue = (task) =>
  ACTIVE_TASK_STATUSES.includes(task.status) && new Date(task.dueDate) < getToday();

// Adds calculated fields to a task before sending it to the frontend
const formatTask = (task) => {
  const plain = typeof task.toObject === 'function' ? task.toObject() : task;
  return {
    ...plain,
    isOverdue: isTaskOverdue(plain),
    nextStatuses: STATUS_TRANSITIONS[plain.status] || [],
    isEditable: !CLOSED_TASK_STATUSES.includes(plain.status),
  };
};

/* ------------------------------------------------------------------ */
/* Assignment rules                                                    */
/* ------------------------------------------------------------------ */

/**
 * Checks if the employee can be assigned a task starting on startDate.
 * - Inactive employee: always rejected
 * - On Leave employee: rejected only if startDate is inside the leave period (both dates inclusive)
 * - Capacity: max 3 active (Todo + In Progress) tasks per employee
 * Returns the employee document if everything is OK.
 */
const checkEmployeeCanTakeTask = async (employeeId, startDate, excludeTaskId = null) => {
  const employee = await Employee.findById(employeeId);
  if (!employee) {
    throw ApiError.badRequest('Selected employee does not exist', {
      assignedEmployee: 'Selected employee does not exist',
    });
  }

  if (employee.status === EMPLOYEE_STATUS.INACTIVE) {
    throw ApiError.badRequest(`${employee.fullName} is Inactive. Tasks can only be assigned to active employees.`, {
      assignedEmployee: 'Employee is inactive',
    });
  }

  if (employee.status === EMPLOYEE_STATUS.ON_LEAVE) {
    const leaveStart = employee.leaveStart;
    const leaveEnd = employee.leaveEnd;
    const startsDuringLeave = leaveStart && leaveEnd && startDate >= leaveStart && startDate <= leaveEnd;

    if (startsDuringLeave) {
      throw ApiError.badRequest(
        `${employee.fullName} is on leave from ${formatDate(leaveStart)} to ${formatDate(leaveEnd)}. ` +
          'Please choose a start date outside the leave period or another employee.',
        { startDate: 'Start date falls inside the employee leave period' }
      );
    }
  }

  const activeFilter = { assignedEmployee: employee._id, status: { $in: ACTIVE_TASK_STATUSES } };
  if (excludeTaskId) activeFilter._id = { $ne: excludeTaskId }; // while editing, don't count the same task

  const activeCount = await Task.countDocuments(activeFilter);
  if (activeCount >= MAX_ACTIVE_TASKS_PER_EMPLOYEE) {
    throw ApiError.badRequest(
      `Employee already has ${MAX_ACTIVE_TASKS_PER_EMPLOYEE} active tasks. Please choose another employee.`,
      { assignedEmployee: `Employee already has ${MAX_ACTIVE_TASKS_PER_EMPLOYEE} active tasks` }
    );
  }

  return employee;
};

const buildEmployeeSnapshot = (employee) => ({
  employeeId: employee.employeeId,
  fullName: employee.fullName,
  email: employee.email,
  department: employee.department,
});

/* ------------------------------------------------------------------ */
/* Status flow                                                         */
/* ------------------------------------------------------------------ */

const checkStatusTransition = (currentStatus, newStatus) => {
  if (currentStatus === newStatus) {
    throw ApiError.badRequest(`Task is already ${currentStatus}`);
  }
  const allowed = STATUS_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(newStatus)) {
    const allowedText = allowed.length ? allowed.join(' or ') : 'nothing (it is closed)';
    throw ApiError.badRequest(
      `Status can not be changed from "${currentStatus}" to "${newStatus}". Allowed: ${allowedText}.`
    );
  }
};

/* ------------------------------------------------------------------ */
/* Search / filter / sort (shared by list API and CSV export)          */
/* ------------------------------------------------------------------ */

const SORT_FIELDS = {
  createdAt: 'createdAt',
  dueDate: 'dueDate',
  priority: 'priorityRank', // by importance, not alphabetical
  title: 'title',
};

const buildTaskQuery = (query) => {
  const { search, department, priority, status, employee, dueFrom, dueTo } = query;
  const filter = {};

  if (search && search.trim()) {
    const regex = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ title: regex }, { 'employeeSnapshot.fullName': regex }, { taskId: regex }];
  }

  if (department) {
    if (!DEPARTMENTS.includes(department)) throw ApiError.badRequest('Invalid department filter');
    filter.department = department;
  }

  if (priority) {
    if (!TASK_PRIORITIES.includes(priority)) throw ApiError.badRequest('Invalid priority filter');
    filter.priority = priority;
  }

  if (status) {
    if (status === OVERDUE_FILTER_VALUE) {
      Object.assign(filter, overdueCondition());
    } else if (Object.values(TASK_STATUS).includes(status)) {
      filter.status = status;
    } else {
      throw ApiError.badRequest('Invalid status filter');
    }
  }

  if (employee) {
    if (!mongoose.isValidObjectId(employee)) throw ApiError.badRequest('Invalid employee filter');
    filter.assignedEmployee = employee;
  }

  // Due date range filter (both dates inclusive).
  // If the Overdue filter already added { $lt: today }, the range is simply added next to it.
  if (dueFrom || dueTo) {
    const dueRange = { ...(filter.dueDate || {}) };
    if (dueFrom) {
      if (!isValidDateString(dueFrom)) throw ApiError.badRequest('Invalid "due from" date');
      dueRange.$gte = toDateOnly(dueFrom);
    }
    if (dueTo) {
      if (!isValidDateString(dueTo)) throw ApiError.badRequest('Invalid "due to" date');
      dueRange.$lte = toDateOnly(dueTo);
    }
    if (dueRange.$gte && dueRange.$lte && dueRange.$gte > dueRange.$lte) {
      throw ApiError.badRequest('"Due from" date can not be after "Due to" date');
    }
    filter.dueDate = dueRange;
  }

  const sortField = SORT_FIELDS[query.sortBy] || 'createdAt';
  const sortOrder = query.order === 'asc' ? 1 : -1;
  const sort = { [sortField]: sortOrder, _id: sortOrder }; // _id keeps the order stable between pages

  return { filter, sort };
};

/* ------------------------------------------------------------------ */
/* Counts used by employee pages                                       */
/* ------------------------------------------------------------------ */

// Returns { employeeObjectId: activeTaskCount } for the given employees
const getActiveTaskCounts = async (employeeIds) => {
  if (!employeeIds.length) return {};
  const rows = await Task.aggregate([
    { $match: { assignedEmployee: { $in: employeeIds }, status: { $in: ACTIVE_TASK_STATUSES } } },
    { $group: { _id: '$assignedEmployee', count: { $sum: 1 } } },
  ]);
  return rows.reduce((acc, row) => ({ ...acc, [row._id.toString()]: row.count }), {});
};

// Task counts for one employee (used on the Employee View page)
const getEmployeeTaskStats = async (employeeId) => {
  const [byStatus, overdue] = await Promise.all([
    Task.aggregate([
      { $match: { assignedEmployee: employeeId } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Task.countDocuments({ assignedEmployee: employeeId, ...overdueCondition() }),
  ]);

  const stats = { total: 0, todo: 0, inProgress: 0, completed: 0, cancelled: 0, overdue };
  const keyMap = {
    [TASK_STATUS.TODO]: 'todo',
    [TASK_STATUS.IN_PROGRESS]: 'inProgress',
    [TASK_STATUS.COMPLETED]: 'completed',
    [TASK_STATUS.CANCELLED]: 'cancelled',
  };
  byStatus.forEach((row) => {
    stats[keyMap[row._id]] = row.count;
    stats.total += row.count;
  });
  stats.active = stats.todo + stats.inProgress;
  stats.capacityLeft = Math.max(MAX_ACTIVE_TASKS_PER_EMPLOYEE - stats.active, 0);
  return stats;
};

module.exports = {
  overdueCondition,
  isTaskOverdue,
  formatTask,
  checkEmployeeCanTakeTask,
  buildEmployeeSnapshot,
  checkStatusTransition,
  buildTaskQuery,
  getActiveTaskCounts,
  getEmployeeTaskStats,
};
