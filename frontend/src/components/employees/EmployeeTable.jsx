import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import ActionMenu from '../common/ActionMenu';
import { MAX_ACTIVE_TASKS } from '../../constants';
import { formatDate } from '../../utils/date';

const EmployeeTable = ({ employees, onDelete }) => (
  <Table hover responsive className="data-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Full Name</th>
        <th>Email</th>
        <th>Phone</th>
        <th>Department</th>
        <th>Role</th>
        <th>Status</th>
        <th className="text-center">Active Tasks</th>
        <th className="text-center">Action</th>
      </tr>
    </thead>
    <tbody>
      {employees.map((employee) => (
        <tr key={employee._id}>
          <td className="fw-semibold">{employee.employeeId}</td>
          <td className="text-nowrap">
            <Link to={`/employees/${employee._id}`} className="table-link">
              {employee.fullName}
            </Link>
          </td>
          <td>{employee.email}</td>
          <td>{employee.phone}</td>
          <td>{employee.department}</td>
          <td>{employee.role}</td>
          <td>
            <StatusBadge type="employee" value={employee.status} />
            {employee.status === 'On Leave' && employee.leaveEnd && (
              <div className="small text-muted text-nowrap">till {formatDate(employee.leaveEnd)}</div>
            )}
          </td>
          <td className="text-center">
            <span className={employee.activeTaskCount >= MAX_ACTIVE_TASKS ? 'text-danger fw-bold' : ''}>
              {employee.activeTaskCount}/{MAX_ACTIVE_TASKS}
            </span>
          </td>
          <td className="text-center">
            <ActionMenu
              viewLink={`/employees/${employee._id}`}
              editLink={`/employees/${employee._id}/edit`}
              onDelete={() => onDelete(employee)}
            />
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);

export default EmployeeTable;
