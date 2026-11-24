import { useState } from 'react';
import { Alert, Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import FormField from '../common/FormField';
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../../constants';
import { toInputDate } from '../../utils/date';
import { validateEmployeeForm } from '../../utils/validation';

const EMPTY_EMPLOYEE = {
  employeeId: '',
  fullName: '',
  email: '',
  phone: '',
  department: '',
  role: '',
  joiningDate: '',
  status: 'Active',
  skills: '',
  leaveStart: '',
  leaveEnd: '',
};

// Converts an employee from the API into form values
const toFormValues = (employee) => {
  if (!employee) return EMPTY_EMPLOYEE;
  return {
    employeeId: employee.employeeId,
    fullName: employee.fullName,
    email: employee.email,
    phone: employee.phone,
    department: employee.department,
    role: employee.role,
    joiningDate: toInputDate(employee.joiningDate),
    status: employee.status,
    skills: (employee.skills || []).join(', '),
    leaveStart: toInputDate(employee.leaveStart),
    leaveEnd: toInputDate(employee.leaveEnd),
  };
};

/**
 * Used by both Add and Edit employee pages.
 * onSubmit(payload) must return a promise. If it fails, the server error is shown in the form.
 */
const EmployeeForm = ({ initialData, onSubmit, submitText = 'Submit' }) => {
  const [values, setValues] = useState(() => toFormValues(initialData));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const isOnLeave = values.status === 'On Leave';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // clear the error of this field when the user starts typing again
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validateEmployeeForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    const payload = {
      employeeId: values.employeeId.trim().toUpperCase(),
      fullName: values.fullName.trim(),
      email: values.email.trim().toLowerCase(),
      phone: values.phone.trim(),
      department: values.department,
      role: values.role.trim(),
      joiningDate: values.joiningDate,
      status: values.status,
      skills: values.skills.split(',').map((s) => s.trim()).filter(Boolean),
      leaveStart: isOnLeave ? values.leaveStart : null,
      leaveEnd: isOnLeave ? values.leaveEnd : null,
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
      // show the backend business-rule / validation error inside the form
      setServerError(err.message);
      if (err.errors) setErrors(err.errors);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Form noValidate onSubmit={handleSubmit}>
      <Row>
        <Col md={6}>
          <FormField
            label="Employee ID"
            name="employeeId"
            value={values.employeeId}
            onChange={handleChange}
            error={errors.employeeId}
            placeholder="e.g. EMP001"
            maxLength={20}
            required
          />
        </Col>
        <Col md={6}>
          <FormField
            label="Full Name"
            name="fullName"
            value={values.fullName}
            onChange={handleChange}
            error={errors.fullName}
            placeholder="Enter full name"
            maxLength={60}
            required
          />
        </Col>
        <Col md={6}>
          <FormField
            label="Email"
            name="email"
            type="email"
            value={values.email}
            onChange={handleChange}
            error={errors.email}
            placeholder="name@company.com"
            required
          />
        </Col>
        <Col md={6}>
          <FormField
            label="Phone"
            name="phone"
            type="tel"
            value={values.phone}
            onChange={handleChange}
            error={errors.phone}
            placeholder="10 digit mobile number"
            maxLength={10}
            inputMode="numeric"
            required
          />
        </Col>
        <Col md={6}>
          <FormField
            as="select"
            label="Department"
            name="department"
            value={values.department}
            onChange={handleChange}
            error={errors.department}
            options={DEPARTMENTS}
            required
          />
        </Col>
        <Col md={6}>
          <FormField
            label="Role"
            name="role"
            value={values.role}
            onChange={handleChange}
            error={errors.role}
            placeholder="e.g. Frontend Developer"
            maxLength={50}
            required
          />
        </Col>
        <Col md={6}>
          <FormField
            label="Joining Date"
            name="joiningDate"
            type="date"
            value={values.joiningDate}
            onChange={handleChange}
            error={errors.joiningDate}
            required
          />
        </Col>
        <Col md={6}>
          <FormField
            as="select"
            label="Status"
            name="status"
            value={values.status}
            onChange={handleChange}
            error={errors.status}
            options={EMPLOYEE_STATUSES}
            required
          />
        </Col>
      </Row>

      {isOnLeave && (
        <div className="leave-box">
          <Row>
            <Col md={6}>
              <FormField
                label="Leave Start"
                name="leaveStart"
                type="date"
                value={values.leaveStart}
                onChange={handleChange}
                error={errors.leaveStart}
                required
              />
            </Col>
            <Col md={6}>
              <FormField
                label="Leave End"
                name="leaveEnd"
                type="date"
                value={values.leaveEnd}
                onChange={handleChange}
                error={errors.leaveEnd}
                min={values.leaveStart || undefined}
                required
              />
            </Col>
          </Row>
        </div>
      )}

      <FormField
        label="Skills"
        name="skills"
        value={values.skills}
        onChange={handleChange}
        error={errors.skills}
        placeholder="e.g. React, Node.js, MongoDB"
        helpText="Separate skills with a comma"
      />

      {serverError && <Alert variant="danger">{serverError}</Alert>}

      <Button type="submit" variant="brand" className="w-100" disabled={submitting}>
        {submitting && <Spinner size="sm" className="me-2" />}
        {submitting ? 'Saving...' : submitText}
      </Button>
    </Form>
  );
};

export default EmployeeForm;
