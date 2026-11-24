import { useCallback, useState } from 'react';
import { Alert, Button, Col, ProgressBar, Row } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiEdit2, FiPlus, FiTrash2 } from 'react-icons/fi';

import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/common/ConfirmModal';
import DetailItem from '../../components/common/DetailItem';
import StatusBadge from '../../components/common/StatusBadge';
import TaskTable from '../../components/tasks/TaskTable';
import TaskStatsGrid from '../../components/employees/TaskStatsGrid';
import NotFoundPage from '../NotFoundPage';
import useFetch from '../../hooks/useFetch';
import { deleteEmployee, getEmployeeById } from '../../api/employeeApi';
import { deleteTask, getTasks } from '../../api/taskApi';
import { MAX_ACTIVE_TASKS } from '../../constants';
import { formatDate } from '../../utils/date';

const RECENT_TASKS_LIMIT = 5;

// "Rahul Sharma" -> "RS"
const getInitials = (name) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const EmployeeDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const employeeState = useFetch(useCallback(() => getEmployeeById(id), [id]));
  const tasksState = useFetch(
    useCallback(() => getTasks({ employee: id, limit: RECENT_TASKS_LIMIT, sortBy: 'createdAt', order: 'desc' }), [id])
  );

  const [deleteTarget, setDeleteTarget] = useState(null); // { type: 'employee' } or { type: 'task', task }
  const [deleting, setDeleting] = useState(false);

  // after a task changes, both the stats and the task list need fresh data
  const refreshAll = () => {
    employeeState.reload();
    tasksState.reload();
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      if (deleteTarget.type === 'employee') {
        const res = await deleteEmployee(id);
        toast.success(res.message);
        navigate('/employees');
        return;
      }
      const res = await deleteTask(deleteTarget.task._id);
      toast.success(res.message);
      refreshAll();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const { data: employee, loading, error } = employeeState;

  if (loading && !employee) return <Loader text="Loading employee..." />;
  if (error?.status === 404) {
    return <NotFoundPage title="Employee not found" message="This employee may have been deleted." />;
  }
  if (error) return <ErrorState message={error.message} onRetry={employeeState.reload} />;

  const stats = employee.taskStats;
  const capacityPercent = Math.min((stats.active / MAX_ACTIVE_TASKS) * 100, 100);
  const canAssign = employee.status !== 'Inactive' && stats.active < MAX_ACTIVE_TASKS;

  return (
    <>
      <PageHeader title="Employee Details" backTo="/employees" backLabel="Back to employees">
        {canAssign && (
          <Button as={Link} to={`/tasks/new?employee=${id}`} variant="brand">
            <FiPlus className="me-1" /> Assign Task
          </Button>
        )}
        <Button as={Link} to={`/employees/${id}/edit`} variant="outline-brand">
          <FiEdit2 className="me-1" /> Edit
        </Button>
        <Button variant="outline-danger" onClick={() => setDeleteTarget({ type: 'employee' })}>
          <FiTrash2 className="me-1" /> Delete
        </Button>
      </PageHeader>

      <Row>
        <Col lg={5}>
          <div className="app-card">
            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="profile-avatar">{getInitials(employee.fullName)}</div>
              <div>
                <h5 className="mb-1">{employee.fullName}</h5>
                <div className="text-muted small mb-1">
                  {employee.role} · {employee.department}
                </div>
                <StatusBadge type="employee" value={employee.status} />
              </div>
            </div>

            {employee.status === 'On Leave' && (
              <Alert variant="warning" className="small py-2">
                On leave from <strong>{formatDate(employee.leaveStart)}</strong> to{' '}
                <strong>{formatDate(employee.leaveEnd)}</strong>
              </Alert>
            )}

            <Row>
              <Col xs={6}><DetailItem label="Employee ID">{employee.employeeId}</DetailItem></Col>
              <Col xs={6}><DetailItem label="Joining Date">{formatDate(employee.joiningDate)}</DetailItem></Col>
              <Col xs={12}><DetailItem label="Email">{employee.email}</DetailItem></Col>
              <Col xs={6}><DetailItem label="Phone">{employee.phone}</DetailItem></Col>
              <Col xs={6}><DetailItem label="Department">{employee.department}</DetailItem></Col>
            </Row>

            <DetailItem label="Skills">
              {employee.skills.length > 0
                ? employee.skills.map((skill) => <span key={skill} className="skill-chip">{skill}</span>)
                : 'No skills added'}
            </DetailItem>
          </div>
        </Col>

        <Col lg={7}>
          <div className="app-card">
            <h6 className="card-title-sm">Workload</h6>
            <div className="d-flex justify-content-between small mb-1">
              <span>Active tasks (Todo + In Progress)</span>
              <strong>{stats.active} / {MAX_ACTIVE_TASKS}</strong>
            </div>
            <ProgressBar
              now={capacityPercent}
              variant={stats.active >= MAX_ACTIVE_TASKS ? 'danger' : 'success'}
              className="mb-3"
            />
            <TaskStatsGrid stats={stats} />
          </div>
        </Col>
      </Row>

      <div className="d-flex justify-content-between align-items-center">
        <h2 className="section-title">Recent Tasks</h2>
        {stats.total > 0 && (
          <Link to={`/tasks?employee=${id}`} className="small">
            View all {stats.total} tasks
          </Link>
        )}
      </div>

      <div className="table-wrapper">
        {tasksState.loading && <Loader text="Loading tasks..." />}
        {!tasksState.loading && tasksState.error && (
          <div className="p-3"><ErrorState message={tasksState.error.message} onRetry={tasksState.reload} /></div>
        )}
        {!tasksState.loading && !tasksState.error && tasksState.data?.data.length === 0 && (
          <EmptyState title="No tasks yet" message="This employee has not been assigned any task." />
        )}
        {!tasksState.loading && tasksState.data?.data.length > 0 && (
          <TaskTable
            tasks={tasksState.data.data}
            showEmployee={false}
            onStatusChanged={refreshAll}
            onDelete={(task) => setDeleteTarget({ type: 'task', task })}
          />
        )}
      </div>

      <ConfirmModal
        show={!!deleteTarget}
        title={deleteTarget?.type === 'employee' ? 'Delete employee' : 'Delete task'}
        message={
          deleteTarget?.type === 'employee' ? (
            <>
              Delete <strong>{employee.fullName}</strong>? This is not allowed while they have Todo / In Progress
              tasks. Their old tasks will still show their details.
            </>
          ) : (
            <>
              Delete task <strong>{deleteTarget?.task?.taskId} - {deleteTarget?.task?.title}</strong>?
            </>
          )
        }
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default EmployeeDetailsPage;
