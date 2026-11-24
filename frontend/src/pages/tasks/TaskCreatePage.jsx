import { useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import TaskForm from '../../components/tasks/TaskForm';
import { createTask } from '../../api/taskApi';

const TaskCreatePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  // "Assign Task" button on the employee page opens /tasks/new?employee=<id>
  const defaultEmployeeId = searchParams.get('employee') || '';

  const handleSubmit = async (payload) => {
    const res = await createTask(payload);
    toast.success(res.message);
    navigate(`/tasks/${res.data._id}`);
  };

  return (
    <>
      <PageHeader title="Add Task" backTo="/tasks" backLabel="Back to tasks" />
      <div className="app-card form-card">
        <TaskForm defaultEmployeeId={defaultEmployeeId} onSubmit={handleSubmit} submitText="Submit" />
      </div>
    </>
  );
};

export default TaskCreatePage;
