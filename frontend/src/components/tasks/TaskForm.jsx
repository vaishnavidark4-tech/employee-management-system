import { useEffect, useMemo, useState } from 'react';
import { Alert, Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import FormField from '../common/FormField';
import { getEmployeeOptions } from '../../api/employeeApi';
import { DEPARTMENTS, MAX_ACTIVE_TASKS, TASK_PRIORITIES } from '../../constants';
import { formatDate, toInputDate, todayInputDate } from '../../utils/date';
import { validateTaskForm } from '../../utils/validation';

const toFormValues = (task, defaultEmployeeId) => {
  if (!task) {
    return {
      title: '',
      description: '',
      assignedEmployee: defaultEmployeeId || '',
      priority: '',
      department: '',
      startDate: todayInputDate(),
      dueDate: '',
    };
  }
  return {
    title: task.title,
    description: task.description || '',
    assignedEmployee: task.assignedEmployee,
    priority: task.priority,
    department: task.department,
    startDate: toInputDate(task.startDate),
    dueDate: toInputDate(task.dueDate),
  };
};

// Text shown in the employee dropdown, e.g. "Rahul Sharma (EMP001) - Development - 2/3 tasks"
const buildEmployeeLabel = (emp) => {
  let label = `${emp.fullName} (${emp.employeeId}) - ${emp.department} - ${emp.activeTaskCount}/${MAX_ACTIVE_TASKS} tasks`;
  if (emp.status === 'Inactive') label += ' - Inactive';
  if (emp.status === 'On Leave') label += ` - On Leave (${formatDate(emp.leaveStart)} to ${formatDate(emp.leaveEnd)})`;
  return label;
};

/**
 * Used by both Add and Edit task pages.
 * The frontend shows hints (inactive / on leave / full capacity), but the final decision
 * is always taken by the backend and its error message is shown below the form.
 */
const TaskForm = ({ initialData, defaultEmployeeId, onSubmit, submitText = 'Submit' }) => {
  const [values, setValues] = useState(() => toFormValues(initialData, defaultEmployeeId));
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const [employees, setEmployees] = useState([]);
  const [loadingEmployees, setLoadingEmployees] = useState(true);

  useEffect(() => {
    getEmployeeOptions()
      .then((list) => {
        setEmployees(list);
        // employee pre-selected from the URL (/tasks/new?employee=...) -> fill department too
        setValues((prev) => {
          if (prev.department || !prev.assignedEmployee) return prev;
          const emp = list.find((item) => item._id === prev.assignedEmployee);
          return emp ? { ...prev, department: emp.department } : prev;
        });
      })
      .catch((err) => toast.error(`Could not load employees: ${err.message}`))
      .finally(() => setLoadingEmployees(false));
  }, []);

  const selectedEmployee = employees.find((emp) => emp._id === values.assignedEmployee);

  // Inactive employees can not be selected (backend also rejects them)
  const employeeOptions = useMemo(
    () =>
      employees.map((emp) => ({
        value: emp._id,
        label: buildEmployeeLabel(emp),
        disabled: emp.status === 'Inactive' && emp._id !== initialData?.assignedEmployee,
      })),
    [employees, initialData]
  );

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => {
      const next = { ...prev, [name]: value };
      // selecting an employee also fills the department (the user can still change it)
      if (name === 'assignedEmployee') {
        const emp = employees.find((item) => item._id === value);
        if (emp) next.department = emp.department;
      }
      return next;
    });
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  // Helpful warning under the employee dropdown (hidden when the field already shows an error)
  const getEmployeeHint = () => {
    if (!selectedEmployee || errors.assignedEmployee) return null;
    const isSameEmployee = selectedEmployee._id === initialData?.assignedEmployee;

    if (selectedEmployee.status === 'On Leave') {
      return (
        <div className="employee-hint text-warning-emphasis">
          On leave from {formatDate(selectedEmployee.leaveStart)} to {formatDate(selectedEmployee.leaveEnd)}. Start
          date must be outside this period.
        </div>
      );
    }
    if (!isSameEmployee && selectedEmployee.activeTaskCount >= MAX_ACTIVE_TASKS) {
      return (
        <div className="employee-hint text-danger">
          This employee already has {MAX_ACTIVE_TASKS} active tasks.
        </div>
      );
    }
    return null;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');

    const validationErrors = validateTaskForm(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) {
      toast.error('Please fix the highlighted fields');
      return;
    }

    const payload = {
      ...values,
      title: values.title.trim(),
      description: values.description.trim(),
    };

    setSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (err) {
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
            label="Title"
            name="title"
            value={values.title}
            onChange={handleChange}
            error={errors.title}
            placeholder="Enter Title"
            maxLength={100}
            required
          />
        </Col>
        <Col md={6}>
          <FormField
            as="select"
            label="Assigned Employee"
            name="assignedEmployee"
            value={values.assignedEmployee}
            onChange={handleChange}
            error={errors.assignedEmployee}
            options={employeeOptions}
            placeholder={loadingEmployees ? 'Loading employees...' : 'Select...'}
            disabled={loadingEmployees}
            required
          />
          {getEmployeeHint()}
        </Col>
        <Col md={6}>
          <FormField
            as="select"
            label="Priority"
            name="priority"
            value={values.priority}
            onChange={handleChange}
            error={errors.priority}
            options={TASK_PRIORITIES}
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
            label="Start Date"
            name="startDate"
            type="date"
            value={values.startDate}
            onChange={handleChange}
            error={errors.startDate}
            required
          />
        </Col>
        <Col md={6}>
          <FormField
            label="Due Date"
            name="dueDate"
            type="date"
            value={values.dueDate}
            onChange={handleChange}
            error={errors.dueDate}
            min={values.startDate || undefined}
            required
          />
        </Col>
      </Row>

      <FormField
        as="textarea"
        label="Description"
        name="description"
        value={values.description}
        onChange={handleChange}
        error={errors.description}
        placeholder="Enter Description"
        rows={3}
        maxLength={1000}
        helpText={`${values.description.length}/1000 characters`}
      />

      {serverError && <Alert variant="danger">{serverError}</Alert>}

      <Button type="submit" variant="brand" className="w-100" disabled={submitting || loadingEmployees}>
        {submitting && <Spinner size="sm" className="me-2" />}
        {submitting ? 'Saving...' : submitText}
      </Button>
    </Form>
  );
};

export default TaskForm;
