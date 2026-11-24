const mongoose = require('mongoose');
const Task = require('../models/Task');
const Counter = require('../models/Counter');
const ApiError = require('../utils/ApiError');
const { toCsv } = require('../utils/csv');
const { formatDate } = require('../utils/dateUtils');
const { getPagination, buildPaginationMeta } = require('../utils/queryHelpers');
const { validateTask, validateStatusBody } = require('../validators/taskValidator');
const {
  formatTask,
  checkEmployeeCanTakeTask,
  buildEmployeeSnapshot,
  checkStatusTransition,
  buildTaskQuery,
} = require('../services/taskService');
const { TASK_STATUS, CLOSED_TASK_STATUSES } = require('../constants');

// case-insensitive sorting (so "api" and "Api" are sorted together when sorting by title)
const COLLATION = { locale: 'en', strength: 2 };

const findTaskOr404 = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw ApiError.notFound('Task not found');
  const task = await Task.findById(id);
  if (!task) throw ApiError.notFound('Task not found');
  return task;
};

const generateTaskId = async () => {
  const seq = await Counter.getNextSequence('task');
  return `TSK-${String(seq).padStart(3, '0')}`;
};

// GET /api/tasks?search=&department=&priority=&status=&dueFrom=&dueTo=&employee=&sortBy=&order=&page=&limit=
const getTasks = async (req, res) => {
  const { filter, sort } = buildTaskQuery(req.query);
  const { page, limit, skip } = getPagination(req.query);

  const [tasks, total] = await Promise.all([
    Task.find(filter).collation(COLLATION).sort(sort).skip(skip).limit(limit).lean(),
    Task.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: tasks.map(formatTask),
    pagination: buildPaginationMeta(page, limit, total),
  });
};

// GET /api/tasks/:id
const getTaskById = async (req, res) => {
  const task = await findTaskOr404(req.params.id);
  res.json({ success: true, data: formatTask(task) });
};

// POST /api/tasks
const createTask = async (req, res) => {
  const data = validateTask(req.body);
  const employee = await checkEmployeeCanTakeTask(data.assignedEmployee, data.startDate);

  const task = await Task.create({
    ...data,
    taskId: await generateTaskId(),
    employeeSnapshot: buildEmployeeSnapshot(employee),
    status: TASK_STATUS.TODO, // new tasks always start as Todo
  });

  res.status(201).json({ success: true, message: `Task ${task.taskId} created successfully`, data: formatTask(task) });
};

// PUT /api/tasks/:id
// Edits task details only. Status is NOT changed here (see updateTaskStatus).
const updateTask = async (req, res) => {
  const task = await findTaskOr404(req.params.id);

  if (CLOSED_TASK_STATUSES.includes(task.status)) {
    throw ApiError.badRequest(`${task.status} tasks can not be edited`);
  }

  const data = validateTask(req.body);

  // Re-check assignment rules only if the employee or the start date is changed
  const employeeChanged = task.assignedEmployee.toString() !== data.assignedEmployee;
  const startDateChanged = task.startDate.getTime() !== data.startDate.getTime();

  if (employeeChanged || startDateChanged) {
    const employee = await checkEmployeeCanTakeTask(data.assignedEmployee, data.startDate, task._id);
    task.employeeSnapshot = buildEmployeeSnapshot(employee);
  }

  task.set(data);
  await task.save();

  res.json({ success: true, message: 'Task updated successfully', data: formatTask(task) });
};

// PUT /api/tasks/:id/status   body: { status: 'In Progress' }
const updateTaskStatus = async (req, res) => {
  const task = await findTaskOr404(req.params.id);
  const newStatus = validateStatusBody(req.body);

  checkStatusTransition(task.status, newStatus);

  task.status = newStatus;
  // Completed Date always comes from the server clock, never from the client
  if (newStatus === TASK_STATUS.COMPLETED) task.completedDate = new Date();

  await task.save();

  res.json({ success: true, message: `Task ${task.taskId} moved to ${newStatus}`, data: formatTask(task) });
};

// DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  const task = await findTaskOr404(req.params.id);
  await task.deleteOne();
  res.json({ success: true, message: `Task ${task.taskId} deleted successfully` });
};

// GET /api/tasks/export/csv  (same filters as the list, but all matching rows, no pagination)
const exportTasksCsv = async (req, res) => {
  const { filter, sort } = buildTaskQuery(req.query);
  const tasks = (await Task.find(filter).collation(COLLATION).sort(sort).lean()).map(formatTask);

  const columns = [
    { header: 'Task ID', value: (t) => t.taskId },
    { header: 'Title', value: (t) => t.title },
    { header: 'Description', value: (t) => t.description },
    { header: 'Employee ID', value: (t) => t.employeeSnapshot.employeeId },
    { header: 'Employee Name', value: (t) => t.employeeSnapshot.fullName },
    { header: 'Employee Email', value: (t) => t.employeeSnapshot.email },
    { header: 'Employee Deleted', value: (t) => (t.employeeDeleted ? 'Yes' : 'No') },
    { header: 'Department', value: (t) => t.department },
    { header: 'Priority', value: (t) => t.priority },
    { header: 'Status', value: (t) => t.status },
    { header: 'Overdue', value: (t) => (t.isOverdue ? 'Yes' : 'No') },
    { header: 'Start Date', value: (t) => formatDate(t.startDate) },
    { header: 'Due Date', value: (t) => formatDate(t.dueDate) },
    { header: 'Created Date', value: (t) => formatDate(t.createdAt) },
    { header: 'Completed Date', value: (t) => formatDate(t.completedDate) },
  ];

  const fileName = `tasks-${formatDate(new Date())}.csv`;
  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.send(toCsv(tasks, columns));
};

module.exports = {
  getTasks,
  getTaskById,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
  exportTasksCsv,
};
