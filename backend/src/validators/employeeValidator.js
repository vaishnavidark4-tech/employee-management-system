const { DEPARTMENTS, EMPLOYEE_STATUS } = require('../constants');
const { isValidDateString, toDateOnly } = require('../utils/dateUtils');
const ApiError = require('../utils/ApiError');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;
const EMPLOYEE_ID_REGEX = /^[A-Z0-9-]{3,20}$/;
const NAME_REGEX = /^[A-Za-z][A-Za-z .'-]*$/;

const toText = (value) => (typeof value === 'string' ? value.trim() : '');

// Skills can come as an array ["React", "Node"] or a comma separated string "React, Node"
const parseSkills = (skills) => {
  let list = [];
  if (Array.isArray(skills)) list = skills;
  else if (typeof skills === 'string') list = skills.split(',');

  const cleaned = list.map((skill) => String(skill).trim()).filter(Boolean);
  // remove duplicates (case-insensitive)
  return cleaned.filter(
    (skill, index) => cleaned.findIndex((s) => s.toLowerCase() === skill.toLowerCase()) === index
  );
};

/**
 * Validates the request body for create / update employee.
 * Only the allowed fields are picked, so extra fields sent by the client are ignored.
 * Throws a 400 ApiError with field-wise messages if something is wrong.
 * Returns clean, normalized data ready to be saved.
 */
const validateEmployee = (body = {}) => {
  const errors = {};

  const data = {
    employeeId: toText(body.employeeId).toUpperCase(),
    fullName: toText(body.fullName).replace(/\s+/g, ' '),
    email: toText(body.email).toLowerCase(),
    phone: toText(body.phone),
    department: toText(body.department),
    role: toText(body.role),
    status: toText(body.status) || EMPLOYEE_STATUS.ACTIVE,
    skills: parseSkills(body.skills),
    leaveStart: null,
    leaveEnd: null,
  };

  if (!data.employeeId) errors.employeeId = 'Employee ID is required';
  else if (!EMPLOYEE_ID_REGEX.test(data.employeeId)) {
    errors.employeeId = 'Employee ID must be 3-20 characters (letters, numbers, -)';
  }

  if (!data.fullName) errors.fullName = 'Full name is required';
  else if (data.fullName.length < 2 || data.fullName.length > 60) {
    errors.fullName = 'Full name must be between 2 and 60 characters';
  } else if (!NAME_REGEX.test(data.fullName)) {
    errors.fullName = 'Full name can contain only letters, spaces, dot, apostrophe and hyphen';
  }

  if (!data.email) errors.email = 'Email is required';
  else if (!EMAIL_REGEX.test(data.email)) errors.email = 'Please enter a valid email';

  if (!data.phone) errors.phone = 'Phone number is required';
  else if (!PHONE_REGEX.test(data.phone)) errors.phone = 'Phone must be a valid 10 digit mobile number';

  if (!data.department) errors.department = 'Department is required';
  else if (!DEPARTMENTS.includes(data.department)) errors.department = 'Invalid department';

  if (!data.role) errors.role = 'Role is required';
  else if (data.role.length < 2 || data.role.length > 50) {
    errors.role = 'Role must be between 2 and 50 characters';
  }

  if (!body.joiningDate) errors.joiningDate = 'Joining date is required';
  else if (!isValidDateString(body.joiningDate)) errors.joiningDate = 'Joining date must be in YYYY-MM-DD format';
  else data.joiningDate = toDateOnly(body.joiningDate);

  if (!Object.values(EMPLOYEE_STATUS).includes(data.status)) errors.status = 'Invalid status';

  if (data.skills.length > 20) errors.skills = 'You can add maximum 20 skills';
  else if (data.skills.some((skill) => skill.length > 30)) errors.skills = 'Each skill can be maximum 30 characters';

  // Leave dates are required only when the employee is On Leave
  if (data.status === EMPLOYEE_STATUS.ON_LEAVE) {
    if (!body.leaveStart) errors.leaveStart = 'Leave start date is required when status is On Leave';
    else if (!isValidDateString(body.leaveStart)) errors.leaveStart = 'Leave start must be in YYYY-MM-DD format';
    else data.leaveStart = toDateOnly(body.leaveStart);

    if (!body.leaveEnd) errors.leaveEnd = 'Leave end date is required when status is On Leave';
    else if (!isValidDateString(body.leaveEnd)) errors.leaveEnd = 'Leave end must be in YYYY-MM-DD format';
    else data.leaveEnd = toDateOnly(body.leaveEnd);

    if (data.leaveStart && data.leaveEnd && data.leaveEnd < data.leaveStart) {
      errors.leaveEnd = 'Leave end date can not be earlier than leave start date';
    }
  }

  if (Object.keys(errors).length > 0) {
    throw ApiError.badRequest('Please correct the highlighted fields', errors);
  }

  return data;
};

module.exports = { validateEmployee };
