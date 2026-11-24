// Frontend validation (same rules as the backend).
// It gives quick feedback to the user, but the backend still checks everything again.

import { DEPARTMENTS, EMPLOYEE_STATUSES, TASK_PRIORITIES } from '../constants';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const EMPLOYEE_ID_REGEX = /^[A-Z0-9-]{3,20}$/;
const NAME_REGEX = /^[A-Za-z][A-Za-z .'-]*$/;

export const validateEmployeeForm = (values) => {
  const errors = {};
  const employeeId = values.employeeId.trim().toUpperCase();
  const fullName = values.fullName.trim();
  const role = values.role.trim();

  if (!employeeId) errors.employeeId = 'Employee ID is required';
  else if (!EMPLOYEE_ID_REGEX.test(employeeId)) {
    errors.employeeId = 'Use 3-20 characters: letters, numbers or - (e.g. EMP001)';
  }

  if (!fullName) errors.fullName = 'Full name is required';
  else if (fullName.length < 2 || fullName.length > 60) errors.fullName = 'Full name must be 2-60 characters';
  else if (!NAME_REGEX.test(fullName)) errors.fullName = 'Only letters, spaces, dot, apostrophe and hyphen allowed';

  if (!values.email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_REGEX.test(values.email.trim())) errors.email = 'Please enter a valid email';

  if (!values.phone.trim()) errors.phone = 'Phone number is required';
  else if (!PHONE_REGEX.test(values.phone.trim())) errors.phone = 'Enter a valid 10 digit mobile number';

  if (!values.department) errors.department = 'Please select a department';
  else if (!DEPARTMENTS.includes(values.department)) errors.department = 'Invalid department';

  if (!role) errors.role = 'Role is required';
  else if (role.length < 2 || role.length > 50) errors.role = 'Role must be 2-50 characters';

  if (!values.joiningDate) errors.joiningDate = 'Joining date is required';

  if (!EMPLOYEE_STATUSES.includes(values.status)) errors.status = 'Please select a status';

  const skills = values.skills.split(',').map((s) => s.trim()).filter(Boolean);
  if (skills.length > 20) errors.skills = 'You can add maximum 20 skills';
  else if (skills.some((s) => s.length > 30)) errors.skills = 'Each skill can be maximum 30 characters';

  if (values.status === 'On Leave') {
    if (!values.leaveStart) errors.leaveStart = 'Leave start date is required';
    if (!values.leaveEnd) errors.leaveEnd = 'Leave end date is required';
    if (values.leaveStart && values.leaveEnd && values.leaveEnd < values.leaveStart) {
      errors.leaveEnd = 'Leave end can not be before leave start';
    }
  }

  return errors;
};

export const validateTaskForm = (values) => {
  const errors = {};
  const title = values.title.trim();

  if (!title) errors.title = 'Title is required';
  else if (title.length < 3 || title.length > 100) errors.title = 'Title must be 3-100 characters';

  if (values.description.trim().length > 1000) errors.description = 'Description can be maximum 1000 characters';

  if (!values.assignedEmployee) errors.assignedEmployee = 'Please select an employee';

  if (!values.priority) errors.priority = 'Please select a priority';
  else if (!TASK_PRIORITIES.includes(values.priority)) errors.priority = 'Invalid priority';

  if (!values.department) errors.department = 'Please select a department';
  else if (!DEPARTMENTS.includes(values.department)) errors.department = 'Invalid department';

  if (!values.startDate) errors.startDate = 'Start date is required';
  if (!values.dueDate) errors.dueDate = 'Due date is required';
  if (values.startDate && values.dueDate && values.dueDate < values.startDate) {
    errors.dueDate = 'Due date can not be earlier than start date';
  }

  return errors;
};
