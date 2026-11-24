const mongoose = require('mongoose');
const { DEPARTMENTS, TASK_PRIORITIES, TASK_STATUS } = require('../constants');
const { isValidDateString, toDateOnly } = require('../utils/dateUtils');
const ApiError = require('../utils/ApiError');

const toText = (value) => (typeof value === 'string' ? value.trim() : '');

/**
 * Validates the body for create / update task.
 * NOTE: status and completedDate are NOT read from the body on purpose.
 * Status can only be changed through PUT /api/tasks/:id/status
 * and completedDate is always set by the backend.
 */
const validateTask = (body = {}) => {
  const errors = {};

  const data = {
    title: toText(body.title).replace(/\s+/g, ' '),
    description: toText(body.description),
    assignedEmployee: toText(body.assignedEmployee),
    department: toText(body.department),
    priority: toText(body.priority),
  };

  if (!data.title) errors.title = 'Title is required';
  else if (data.title.length < 3 || data.title.length > 100) {
    errors.title = 'Title must be between 3 and 100 characters';
  }

  if (data.description.length > 1000) errors.description = 'Description can not be more than 1000 characters';

  if (!data.assignedEmployee) errors.assignedEmployee = 'Please select an employee';
  else if (!mongoose.isValidObjectId(data.assignedEmployee)) errors.assignedEmployee = 'Invalid employee selected';

  if (!data.department) errors.department = 'Department is required';
  else if (!DEPARTMENTS.includes(data.department)) errors.department = 'Invalid department';

  if (!data.priority) errors.priority = 'Priority is required';
  else if (!TASK_PRIORITIES.includes(data.priority)) errors.priority = 'Invalid priority';

  if (!body.startDate) errors.startDate = 'Start date is required';
  else if (!isValidDateString(body.startDate)) errors.startDate = 'Start date must be in YYYY-MM-DD format';
  else data.startDate = toDateOnly(body.startDate);

  if (!body.dueDate) errors.dueDate = 'Due date is required';
  else if (!isValidDateString(body.dueDate)) errors.dueDate = 'Due date must be in YYYY-MM-DD format';
  else data.dueDate = toDateOnly(body.dueDate);

  // Business rule: Due Date can not be earlier than Start Date
  if (data.startDate && data.dueDate && data.dueDate < data.startDate) {
    errors.dueDate = 'Due date can not be earlier than start date';
  }

  if (Object.keys(errors).length > 0) {
    throw ApiError.badRequest('Please correct the highlighted fields', errors);
  }

  return data;
};

const validateStatusBody = (body = {}) => {
  const status = toText(body.status);
  if (!status) throw ApiError.badRequest('Status is required', { status: 'Status is required' });
  if (!Object.values(TASK_STATUS).includes(status)) {
    throw ApiError.badRequest(`Invalid status "${status}"`, { status: 'Invalid status' });
  }
  return status;
};

module.exports = { validateTask, validateStatusBody };
