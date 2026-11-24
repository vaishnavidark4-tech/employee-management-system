const mongoose = require('mongoose');
const Employee = require('../models/Employee');
const Task = require('../models/Task');
const ApiError = require('../utils/ApiError');
const { validateEmployee } = require('../validators/employeeValidator');
const { getPagination, buildPaginationMeta, escapeRegex } = require('../utils/queryHelpers');
const { getActiveTaskCounts, getEmployeeTaskStats } = require('../services/taskService');
const { DEPARTMENTS, EMPLOYEE_STATUS, ACTIVE_TASK_STATUSES } = require('../constants');

const SORT_FIELDS = {
  createdAt: 'createdAt',
  fullName: 'fullName',
  employeeId: 'employeeId',
  joiningDate: 'joiningDate',
};

// Throws 409 if another employee already uses this Employee ID or email
const checkDuplicate = async (data, excludeId = null) => {
  const filter = { $or: [{ employeeId: data.employeeId }, { email: data.email }] };
  if (excludeId) filter._id = { $ne: excludeId };

  const existing = await Employee.findOne(filter).lean();
  if (!existing) return;

  if (existing.employeeId === data.employeeId) {
    throw new ApiError(409, `Employee ID "${data.employeeId}" already exists`, {
      employeeId: 'This Employee ID is already used',
    });
  }
  throw new ApiError(409, `Email "${data.email}" is already registered`, {
    email: 'This email is already used by another employee',
  });
};

const findEmployeeOr404 = async (id) => {
  if (!mongoose.isValidObjectId(id)) throw ApiError.notFound('Employee not found');
  const employee = await Employee.findById(id);
  if (!employee) throw ApiError.notFound('Employee not found');
  return employee;
};

// GET /api/employees?search=&department=&status=&sortBy=&order=&page=&limit=
const getEmployees = async (req, res) => {
  const { search, department, status, sortBy = 'createdAt', order = 'desc' } = req.query;
  const { page, limit, skip } = getPagination(req.query);

  const filter = {};
  if (search && search.trim()) {
    const regex = new RegExp(escapeRegex(search.trim()), 'i');
    filter.$or = [{ fullName: regex }, { email: regex }, { employeeId: regex }];
  }
  if (department) {
    if (!DEPARTMENTS.includes(department)) throw ApiError.badRequest('Invalid department filter');
    filter.department = department;
  }
  if (status) {
    if (!Object.values(EMPLOYEE_STATUS).includes(status)) throw ApiError.badRequest('Invalid status filter');
    filter.status = status;
  }

  const sortField = SORT_FIELDS[sortBy] || 'createdAt';
  const sortOrder = order === 'asc' ? 1 : -1;

  const [employees, total] = await Promise.all([
    Employee.find(filter)
      .collation({ locale: 'en', strength: 2 }) // case-insensitive sorting for names
      .sort({ [sortField]: sortOrder, _id: sortOrder })
      .skip(skip)
      .limit(limit)
      .lean(),
    Employee.countDocuments(filter),
  ]);

  // add the number of active tasks for each employee on this page
  const counts = await getActiveTaskCounts(employees.map((emp) => emp._id));
  const data = employees.map((emp) => ({ ...emp, activeTaskCount: counts[emp._id.toString()] || 0 }));

  res.json({ success: true, data, pagination: buildPaginationMeta(page, limit, total) });
};

// GET /api/employees/options
// Small list (only the needed fields) used for the "Assigned Employee" dropdown in the task form
const getEmployeeOptions = async (req, res) => {
  const employees = await Employee.find({}, 'employeeId fullName department status leaveStart leaveEnd')
    .collation({ locale: 'en', strength: 2 })
    .sort({ fullName: 1 })
    .lean();

  const counts = await getActiveTaskCounts(employees.map((emp) => emp._id));
  const data = employees.map((emp) => ({ ...emp, activeTaskCount: counts[emp._id.toString()] || 0 }));

  res.json({ success: true, data });
};

// GET /api/employees/:id
const getEmployeeById = async (req, res) => {
  const employee = await findEmployeeOr404(req.params.id);
  const taskStats = await getEmployeeTaskStats(employee._id);

  res.json({ success: true, data: { ...employee.toObject(), taskStats } });
};

// POST /api/employees
const createEmployee = async (req, res) => {
  const data = validateEmployee(req.body);
  await checkDuplicate(data);

  const employee = await Employee.create(data);
  res.status(201).json({ success: true, message: 'Employee added successfully', data: employee });
};

// PUT /api/employees/:id
const updateEmployee = async (req, res) => {
  const employee = await findEmployeeOr404(req.params.id);
  const data = validateEmployee(req.body);
  await checkDuplicate(data, employee._id);

  employee.set(data);
  await employee.save();

  // Keep the employee details stored inside tasks up to date
  await Task.updateMany(
    { assignedEmployee: employee._id },
    {
      $set: {
        employeeSnapshot: {
          employeeId: employee.employeeId,
          fullName: employee.fullName,
          email: employee.email,
          department: employee.department,
        },
      },
    }
  );

  res.json({ success: true, message: 'Employee updated successfully', data: employee });
};

// DELETE /api/employees/:id
// Not allowed while the employee has Todo / In Progress tasks.
// Old (Completed / Cancelled) tasks are kept and still show the employee details from the snapshot.
const deleteEmployee = async (req, res) => {
  const employee = await findEmployeeOr404(req.params.id);

  const activeTasks = await Task.countDocuments({
    assignedEmployee: employee._id,
    status: { $in: ACTIVE_TASK_STATUSES },
  });

  if (activeTasks > 0) {
    throw ApiError.badRequest(
      `Can not delete ${employee.fullName}. They still have ${activeTasks} active task(s) (Todo / In Progress). ` +
        'Please complete, cancel or reassign them first.'
    );
  }

  await Task.updateMany({ assignedEmployee: employee._id }, { $set: { employeeDeleted: true } });
  await employee.deleteOne();

  res.json({ success: true, message: 'Employee deleted successfully' });
};

module.exports = {
  getEmployees,
  getEmployeeOptions,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
