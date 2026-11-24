// All fixed values used across the backend are kept here in one place.

const DEPARTMENTS = ['Development', 'Design', 'QA', 'HR', 'Sales'];

const EMPLOYEE_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  ON_LEAVE: 'On Leave',
};

const TASK_STATUS = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

// Used to sort by "priority by importance" instead of alphabetical order
const PRIORITY_RANK = {
  Low: 1,
  Medium: 2,
  High: 3,
  Critical: 4,
};

// Allowed status changes. Any change not listed here is rejected.
const STATUS_TRANSITIONS = {
  [TASK_STATUS.TODO]: [TASK_STATUS.IN_PROGRESS, TASK_STATUS.CANCELLED],
  [TASK_STATUS.IN_PROGRESS]: [TASK_STATUS.COMPLETED, TASK_STATUS.CANCELLED],
  [TASK_STATUS.COMPLETED]: [],
  [TASK_STATUS.CANCELLED]: [],
};

// "Active" tasks count towards the employee capacity limit
const ACTIVE_TASK_STATUSES = [TASK_STATUS.TODO, TASK_STATUS.IN_PROGRESS];

// Completed / Cancelled tasks are closed and can not be edited
const CLOSED_TASK_STATUSES = [TASK_STATUS.COMPLETED, TASK_STATUS.CANCELLED];

const MAX_ACTIVE_TASKS_PER_EMPLOYEE = 3;

const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
};

module.exports = {
  DEPARTMENTS,
  EMPLOYEE_STATUS,
  TASK_STATUS,
  TASK_PRIORITIES,
  PRIORITY_RANK,
  STATUS_TRANSITIONS,
  ACTIVE_TASK_STATUSES,
  CLOSED_TASK_STATUSES,
  MAX_ACTIVE_TASKS_PER_EMPLOYEE,
  PAGINATION,
};
