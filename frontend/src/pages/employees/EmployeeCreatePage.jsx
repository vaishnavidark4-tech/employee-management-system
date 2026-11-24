import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import PageHeader from '../../components/common/PageHeader';
import EmployeeForm from '../../components/employees/EmployeeForm';
import { createEmployee } from '../../api/employeeApi';

const EmployeeCreatePage = () => {
  const navigate = useNavigate();

  const handleSubmit = async (payload) => {
    const res = await createEmployee(payload);
    toast.success(res.message);
    navigate(`/employees/${res.data._id}`);
  };

  return (
    <>
      <PageHeader title="Add Employee" backTo="/employees" backLabel="Back to employees" />
      <div className="app-card form-card">
        <EmployeeForm onSubmit={handleSubmit} submitText="Add Employee" />
      </div>
    </>
  );
};

export default EmployeeCreatePage;
