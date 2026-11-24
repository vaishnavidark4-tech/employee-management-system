// Fixed values used in dropdowns and badges (same values as the backend)

export const DEPARTMENTS = ['Development', 'Design', 'QA', 'HR', 'Sales'];

export const EMPLOYEE_STATUSES = ['Active', 'Inactive', 'On Leave'];

export const TASK_STATUSES = ['Todo', 'In Progress', 'Completed', 'Cancelled'];

// "Overdue" is not a real status, it is calculated on the backend.
// It is added only in the status filter of the task list.
export const OVERDUE_FILTER = 'Overdue';

export const TASK_PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

export const MAX_ACTIVE_TASKS = 3;

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

// value = "sortBy:order" -> stored in the URL as two params
export const TASK_SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'dueDate:asc', label: 'Due date (soonest)' },
  { value: 'dueDate:desc', label: 'Due date (latest)' },
  { value: 'priority:desc', label: 'Priority (highest first)' },
  { value: 'priority:asc', label: 'Priority (lowest first)' },
  { value: 'title:asc', label: 'Title (A-Z)' },
  { value: 'title:desc', label: 'Title (Z-A)' },
];

export const EMPLOYEE_SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'fullName:asc', label: 'Name (A-Z)' },
  { value: 'fullName:desc', label: 'Name (Z-A)' },
  { value: 'employeeId:asc', label: 'Employee ID' },
  { value: 'joiningDate:desc', label: 'Recently joined' },
];

// Bootstrap colour names used by the badges
export const TASK_STATUS_VARIANTS = {
  Todo: 'secondary',
  'In Progress': 'primary',
  Completed: 'success',
  Cancelled: 'cancelled',
};

export const EMPLOYEE_STATUS_VARIANTS = {
  Active: 'success',
  Inactive: 'secondary',
  'On Leave': 'warning',
};

export const PRIORITY_VARIANTS = {
  Low: 'low',
  Medium: 'medium',
  High: 'high',
  Critical: 'critical',
};
