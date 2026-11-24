import { useState } from 'react';
import { Dropdown, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import StatusBadge from '../common/StatusBadge';
import ConfirmModal from '../common/ConfirmModal';
import { updateTaskStatus } from '../../api/taskApi';
import { TASK_STATUS_VARIANTS } from '../../constants';

const FINAL_STATUSES = ['Completed', 'Cancelled'];

/**
 * Shows the current status. The dropdown lists ONLY the valid next statuses
 * (task.nextStatuses comes from the backend). Completed / Cancelled tasks show a plain badge.
 */
const TaskStatusDropdown = ({ task, onStatusChanged }) => {
  const [updating, setUpdating] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null); // waiting for confirmation

  const nextStatuses = task.nextStatuses || [];
  if (nextStatuses.length === 0) return <StatusBadge type="task" value={task.status} />;

  const changeStatus = async (status) => {
    setUpdating(true);
    try {
      const res = await updateTaskStatus(task._id, status);
      toast.success(res.message);
      onStatusChanged?.(res.data);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(false);
      setPendingStatus(null);
    }
  };

  // Completed and Cancelled can not be undone, so ask before changing
  const handleSelect = (status) => {
    if (FINAL_STATUSES.includes(status)) setPendingStatus(status);
    else changeStatus(status);
  };

  return (
    <>
      <Dropdown onSelect={handleSelect}>
        <Dropdown.Toggle
          size="sm"
          variant={TASK_STATUS_VARIANTS[task.status]}
          className="status-toggle"
          disabled={updating}
          aria-label={`Change status of ${task.taskId}`}
        >
          {updating && <Spinner size="sm" className="me-1" />}
          {task.status}
        </Dropdown.Toggle>
        <Dropdown.Menu>
          <Dropdown.Header>Move to</Dropdown.Header>
          {nextStatuses.map((status) => (
            <Dropdown.Item key={status} eventKey={status}>
              {status}
            </Dropdown.Item>
          ))}
        </Dropdown.Menu>
      </Dropdown>

      <ConfirmModal
        show={!!pendingStatus}
        title={`Mark task as ${pendingStatus}?`}
        message={
          <>
            <strong>{task.taskId} - {task.title}</strong> will be marked as {pendingStatus}. After this the task can
            not be edited or moved to another status.
          </>
        }
        confirmText={`Yes, mark ${pendingStatus}`}
        confirmVariant={pendingStatus === 'Completed' ? 'success' : 'danger'}
        loading={updating}
        onConfirm={() => changeStatus(pendingStatus)}
        onCancel={() => setPendingStatus(null)}
      />
    </>
  );
};

export default TaskStatusDropdown;
