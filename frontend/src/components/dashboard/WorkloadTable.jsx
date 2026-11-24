import { ProgressBar, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';

const getBarVariant = (active, max) => {
  if (active >= max) return 'danger';
  if (active === max - 1) return 'warning';
  return 'success';
};

const WorkloadTable = ({ workload, maxActiveTasks }) => (
  <Table hover responsive className="data-table">
    <thead>
      <tr>
        <th>Employee</th>
        <th>Department</th>
        <th>Status</th>
        <th className="text-center">Todo</th>
        <th className="text-center">In Progress</th>
        <th className="text-center">Active Tasks</th>
        <th>Capacity</th>
      </tr>
    </thead>
    <tbody>
      {workload.map((row) => (
        <tr key={row._id}>
          <td className="text-nowrap">
            <Link to={`/employees/${row._id}`} className="table-link">{row.fullName}</Link>
            <div className="small text-muted">{row.employeeId}</div>
          </td>
          <td>{row.department}</td>
          <td><StatusBadge type="employee" value={row.status} /></td>
          <td className="text-center">{row.todo}</td>
          <td className="text-center">{row.inProgress}</td>
          <td className="text-center fw-bold">{row.activeTasks}</td>
          <td>
            <ProgressBar
              className="workload-bar"
              now={(row.activeTasks / maxActiveTasks) * 100}
              variant={getBarVariant(row.activeTasks, maxActiveTasks)}
              aria-label={`${row.activeTasks} of ${maxActiveTasks} tasks`}
            />
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);

export default WorkloadTable;
