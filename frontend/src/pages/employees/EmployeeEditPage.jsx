import { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import ErrorState from '../../components/common/ErrorState';
import EmployeeForm from '../../components/employees/EmployeeForm';
import NotFoundPage from '../NotFoundPage';
import useFetch from '../../hooks/useFetch';
import { getEmployeeById, updateEmployee } from '../../api/employeeApi';

const EmployeeEditPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: employee, loading, error, reload } = useFetch(useCallback(() => getEmployeeById(id), [id]));

  const handleSubmit = async (payload) => {
    const res = await updateEmployee(id, payload);
    toast.success(res.message);
    navigate(`/employees/${id}`);
  };

  if (loading) return <Loader text="Loading employee..." />;
  if (error?.status === 404) return <NotFoundPage title="Employee not found" message="This employee may have been deleted." />;
  if (error) return <ErrorState message={error.message} onRetry={reload} />;

  return (
    <>
      <PageHeader
        title="Edit Employee"
        subtitle={`${employee.fullName} (${employee.employeeId})`}
        backTo={`/employees/${id}`}
        backLabel="Back to details"
      />
      <div className="app-card form-card">
        <EmployeeForm initialData={employee} onSubmit={handleSubmit} submitText="Update Employee" />
      </div>
    </>
  );
};

export default EmployeeEditPage;
