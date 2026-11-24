import { useCallback, useState } from 'react';
import { Alert, Button, Col, Row } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiEdit2, FiMail, FiTrash2, FiUser } from 'react-icons/fi';

import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import ConfirmModal from '../../components/common/ConfirmModal';
import DetailItem from '../../components/common/DetailItem';
import StatusBadge, { OverdueBadge } from '../../components/common/StatusBadge';
import TaskStatusDropdown from '../../components/tasks/TaskStatusDropdown';
import TaskTimeline from '../../components/tasks/TaskTimeline';
import NotFoundPage from '../NotFoundPage';
import useFetch from '../../hooks/useFetch';
import { deleteTask, getTaskById } from '../../api/taskApi';
import { formatDate, formatDateTime } from '../../utils/date';

const TaskDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: task, setData: setTask, loading, error, reload } = useFetch(
    useCallback(() => getTaskById(id), [id])
  );

  const [showDelete, setShowDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await deleteTask(id);
      toast.success(res.message);
      navigate('/tasks');
    } catch (err) {
      toast.error(err.message);
      setDeleting(false);
      setShowDelete(false);
    }
  };

  if (loading) return <Loader text="Loading task..." />;
  if (error?.status === 404) return <NotFoundPage title="Task not found" message="This task may have been deleted." />;
  if (error) return <ErrorState message={error.message} onRetry={reload} />;

  const employee = task.employeeSnapshot;

  return (
    <>
      <PageHeader title={task.title} subtitle={`Task ${task.taskId}`} backTo="/tasks" backLabel="Back to tasks">
        {task.isEditable && (
          <Button as={Link} to={`/tasks/${id}/edit`} variant="outline-brand">
            <FiEdit2 className="me-1" /> Edit
          </Button>
        )}
        <Button variant="outline-danger" onClick={() => setShowDelete(true)}>
          <FiTrash2 className="me-1" /> Delete
        </Button>
      </PageHeader>

      {task.isOverdue && (
        <Alert variant="danger">
          This task is <strong>overdue</strong>. It was due on {formatDate(task.dueDate)} and is still {task.status}.
        </Alert>
      )}

      <Row>
        <Col lg={8}>
          <div className="app-card">
            <div className="d-flex flex-wrap align-items-center gap-2 mb-3">
              <TaskStatusDropdown task={task} onStatusChanged={setTask} />
              <StatusBadge type="priority" value={task.priority} />
              {task.isOverdue && <OverdueBadge />}
            </div>

            <h6 className="card-title-sm mb-2">Description</h6>
            <p className="task-description">{task.description || 'No description added.'}</p>

            <hr />

            <Row>
              <Col xs={6} md={4}><DetailItem label="Task ID">{task.taskId}</DetailItem></Col>
              <Col xs={6} md={4}><DetailItem label="Department">{task.department}</DetailItem></Col>
              <Col xs={6} md={4}><DetailItem label="Priority">{task.priority}</DetailItem></Col>
              <Col xs={6} md={4}><DetailItem label="Status">{task.status}</DetailItem></Col>
              <Col xs={6} md={4}><DetailItem label="Start Date">{formatDate(task.startDate)}</DetailItem></Col>
              <Col xs={6} md={4}>
                <DetailItem label="Due Date">
                  <span className={task.isOverdue ? 'overdue-text' : ''}>
                    {formatDate(task.dueDate)} {task.isOverdue && '(Overdue)'}
                  </span>
                </DetailItem>
              </Col>
              <Col xs={6} md={4}><DetailItem label="Created Date">{formatDateTime(task.createdAt)}</DetailItem></Col>
              <Col xs={6} md={4}><DetailItem label="Completed Date">{formatDateTime(task.completedDate)}</DetailItem></Col>
              <Col xs={6} md={4}><DetailItem label="Last Updated">{formatDateTime(task.updatedAt)}</DetailItem></Col>
            </Row>

            {task.nextStatuses.length > 0 ? (
              <p className="small text-muted mb-0">Next possible status: {task.nextStatuses.join(' or ')}</p>
            ) : (
              <p className="small text-muted mb-0">This task is closed and can not be edited.</p>
            )}
          </div>
        </Col>

        <Col lg={4}>
          <div className="app-card">
            <h6 className="card-title-sm">Assigned Employee</h6>
            <div className="d-flex align-items-center gap-2 mb-2">
              <FiUser />
              {task.employeeDeleted ? (
                <span className="fw-semibold">{employee.fullName}</span>
              ) : (
                <Link to={`/employees/${task.assignedEmployee}`} className="table-link fw-semibold">
                  {employee.fullName}
                </Link>
              )}
            </div>
            <div className="small text-muted mb-1">{employee.employeeId} · {employee.department}</div>
            <div className="small text-muted d-flex align-items-center gap-1">
              <FiMail /> {employee.email}
            </div>
            {task.employeeDeleted && (
              <Alert variant="secondary" className="small mt-3 mb-0">
                This employee has been deleted. The details above were saved with the task.
              </Alert>
            )}
          </div>

          <div className="app-card">
            <h6 className="card-title-sm">Timeline</h6>
            <TaskTimeline task={task} />
          </div>
        </Col>
      </Row>

      <ConfirmModal
        show={showDelete}
        title="Delete task"
        message={<>Are you sure you want to delete <strong>{task.taskId} - {task.title}</strong>?</>}
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </>
  );
};

export default TaskDetailsPage;
