import { Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import StatusBadge from '../common/StatusBadge';
import ActionMenu from '../common/ActionMenu';
import TaskStatusDropdown from './TaskStatusDropdown';
import EmployeeName from './EmployeeName';
import { formatShortDate } from '../../utils/date';

const TaskTable = ({ tasks, onStatusChanged, onDelete, showEmployee = true }) => (
  <Table hover responsive className="data-table">
    <thead>
      <tr>
        <th>ID</th>
        <th>Title</th>
        {showEmployee && <th>Employee</th>}
        <th>Department</th>
        <th>Priority</th>
        <th>Status</th>
        <th>Due Date</th>
        <th className="text-center">Action</th>
      </tr>
    </thead>
    <tbody>
      {tasks.map((task) => (
        <tr key={task._id}>
          <td className="fw-semibold text-nowrap">{task.taskId}</td>
          <td className="cell-title">
            <Link to={`/tasks/${task._id}`} className="table-link">
              {task.title}
            </Link>
          </td>
          {showEmployee && (
            <td className="text-nowrap">
              <EmployeeName task={task} />
            </td>
          )}
          <td>{task.department}</td>
          <td>
            <StatusBadge type="priority" value={task.priority} />
          </td>
          <td>
            <TaskStatusDropdown task={task} onStatusChanged={onStatusChanged} />
          </td>
          <td className="text-nowrap">
            {task.isOverdue ? (
              <span className="overdue-text">{formatShortDate(task.dueDate)} (Overdue)</span>
            ) : (
              formatShortDate(task.dueDate)
            )}
          </td>
          <td className="text-center">
            <ActionMenu
              viewLink={`/tasks/${task._id}`}
              editLink={`/tasks/${task._id}/edit`}
              canEdit={task.isEditable}
              editDisabledText={`${task.status} tasks can not be edited`}
              onDelete={() => onDelete(task)}
            />
          </td>
        </tr>
      ))}
    </tbody>
  </Table>
);

export default TaskTable;
