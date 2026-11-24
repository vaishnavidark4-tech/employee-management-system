import { Link } from 'react-router-dom';

// Shows the assigned employee of a task.
// If the employee was deleted, the saved name is shown without a link.
const EmployeeName = ({ task }) => {
  const { employeeSnapshot, employeeDeleted, assignedEmployee } = task;

  if (employeeDeleted) {
    return (
      <span className="text-muted" title="This employee has been deleted">
        {employeeSnapshot.fullName} <small>(deleted)</small>
      </span>
    );
  }

  return (
    <Link to={`/employees/${assignedEmployee}`} className="table-link">
      {employeeSnapshot.fullName}
    </Link>
  );
};

export default EmployeeName;
