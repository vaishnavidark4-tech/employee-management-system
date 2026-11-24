import { useCallback } from 'react';
import { Alert, Button } from 'react-bootstrap';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import TaskForm from '../../components/tasks/TaskForm';
import NotFoundPage from '../NotFoundPage';
import useFetch from '../../hooks/useFetch';
import { getTaskById, updateTask } from '../../api/taskApi';

const TaskEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: task, loading, error, reload } = useFetch(useCallback(() => getTaskById(id), [id]));

  const handleSubmit = async (payload) => {
    const res = await updateTask(id, payload);
    toast.success(res.message);
    navigate(`/tasks/${id}`);
  };

  if (loading) return <Loader text="Loading task..." />;
  if (error?.status === 404) return <NotFoundPage title="Task not found" message="This task may have been deleted." />;
  if (error) return <ErrorState message={error.message} onRetry={reload} />;

  return (
    <>
      <PageHeader title="Edit Task" subtitle={`${task.taskId} - ${task.title}`} backTo={`/tasks/${id}`} backLabel="Back to details" />

      {task.isEditable ? (
        <div className="app-card form-card">
          <Alert variant="light" className="small border">
            Status is changed from the task list or details page, not from this form.
          </Alert>
          <TaskForm initialData={task} onSubmit={handleSubmit} submitText="Update Task" />
        </div>
      ) : (
        <Alert variant="warning" className="form-card">
          <Alert.Heading as="h6">This task can not be edited</Alert.Heading>
          <p className="mb-2">{task.status} tasks are closed and can not be changed.</p>
          <Button as={Link} to={`/tasks/${id}`} size="sm" variant="outline-dark">
            View task
          </Button>
        </Alert>
      )}
    </>
  );
};

export default TaskEditPage;
