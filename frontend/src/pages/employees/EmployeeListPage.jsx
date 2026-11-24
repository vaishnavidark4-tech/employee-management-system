import { useCallback, useState } from 'react';
import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiPlus } from 'react-icons/fi';

import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import PaginationBar from '../../components/common/PaginationBar';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmployeeFilters from '../../components/employees/EmployeeFilters';
import EmployeeTable from '../../components/employees/EmployeeTable';
import useUrlFilters from '../../hooks/useUrlFilters';
import useFetch from '../../hooks/useFetch';
import { deleteEmployee, getEmployees } from '../../api/employeeApi';

// Default values of the filters (kept in the URL)
const DEFAULT_FILTERS = {
  search: '',
  department: '',
  status: '',
  sortBy: 'createdAt',
  order: 'desc',
  page: '1',
  limit: '10',
};

const EmployeeListPage = () => {
  const { filters, apiParams, updateFilters, clearFilters, hasActiveFilters } = useUrlFilters(DEFAULT_FILTERS);
  const { data, loading, error, reload } = useFetch(useCallback(() => getEmployees(apiParams), [apiParams]));

  const [employeeToDelete, setEmployeeToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await deleteEmployee(employeeToDelete._id);
      toast.success(res.message);
      setEmployeeToDelete(null);
      // if the last item of a page was deleted, go one page back
      if (data.data.length === 1 && Number(filters.page) > 1) updateFilters({ page: Number(filters.page) - 1 });
      else reload();
    } catch (err) {
      toast.error(err.message);
      setEmployeeToDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const renderContent = () => {
    if (loading) return <Loader text="Loading employees..." />;
    if (error) return <div className="p-3"><ErrorState message={error.message} onRetry={reload} /></div>;
    if (!data?.data.length) {
      return (
        <EmptyState
          title="No employees found"
          message={hasActiveFilters ? 'Try changing or clearing the filters.' : 'Start by adding your first employee.'}
        >
          {hasActiveFilters && <Button variant="outline-brand" size="sm" onClick={clearFilters}>Clear filters</Button>}
        </EmptyState>
      );
    }
    return <EmployeeTable employees={data.data} onDelete={setEmployeeToDelete} />;
  };

  return (
    <>
      <PageHeader title="Employees" subtitle="Manage your team members">
        <Button as={Link} to="/employees/new" variant="brand">
          <FiPlus className="me-1" /> Add Employee
        </Button>
      </PageHeader>

      <EmployeeFilters
        filters={filters}
        onChange={updateFilters}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      <div className="table-wrapper">
        {renderContent()}
        {!loading && !error && (
          <PaginationBar
            pagination={data?.pagination}
            itemName="employees"
            onPageChange={(page) => updateFilters({ page })}
            onLimitChange={(limit) => updateFilters({ limit })}
          />
        )}
      </div>

      <ConfirmModal
        show={!!employeeToDelete}
        title="Delete employee"
        message={
          <>
            Are you sure you want to delete <strong>{employeeToDelete?.fullName}</strong>? Their old tasks will
            still show their details.
          </>
        }
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setEmployeeToDelete(null)}
      />
    </>
  );
};

export default EmployeeListPage;
