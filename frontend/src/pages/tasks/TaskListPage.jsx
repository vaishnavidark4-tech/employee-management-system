import { useCallback, useState } from 'react';
import { Badge, Button, CloseButton, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiDownload, FiPlus } from 'react-icons/fi';

import PageHeader from '../../components/common/PageHeader';
import Loader from '../../components/common/Loader';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import PaginationBar from '../../components/common/PaginationBar';
import ConfirmModal from '../../components/common/ConfirmModal';
import TaskFilters from '../../components/tasks/TaskFilters';
import TaskTable from '../../components/tasks/TaskTable';
import useUrlFilters from '../../hooks/useUrlFilters';
import useFetch from '../../hooks/useFetch';
import { deleteTask, exportTasksCsv, getTasks } from '../../api/taskApi';
import downloadFile from '../../utils/downloadFile';

// Default values of the filters (kept in the URL)
const DEFAULT_FILTERS = {
  search: '',
  department: '',
  priority: '',
  status: '',
  dueFrom: '',
  dueTo: '',
  employee: '',
  sortBy: 'createdAt',
  order: 'desc',
  page: '1',
  limit: '10',
};

const TaskListPage = () => {
  const { filters, apiParams, updateFilters, clearFilters, hasActiveFilters } = useUrlFilters(DEFAULT_FILTERS);
  const { data, loading, error, reload } = useFetch(useCallback(() => getTasks(apiParams), [apiParams]));

  const [taskToDelete, setTaskToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Export ALL tasks that match the current filters (not only this page)
  const handleExport = async () => {
    setExporting(true);
    try {
      const exportParams = { ...apiParams };
      delete exportParams.page;
      delete exportParams.limit;
      const { blob, fileName } = await exportTasksCsv(exportParams);
      downloadFile(blob, fileName);
      toast.success('CSV downloaded');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await deleteTask(taskToDelete._id);
      toast.success(res.message);
      setTaskToDelete(null);
      if (data.data.length === 1 && Number(filters.page) > 1) updateFilters({ page: Number(filters.page) - 1 });
      else reload();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(false);
    }
  };

  const employeeName = filters.employee && data?.data[0]?.employeeSnapshot.fullName;

  const renderContent = () => {
    if (loading) return <Loader text="Loading tasks..." />;
    if (error) return <div className="p-3"><ErrorState message={error.message} onRetry={reload} /></div>;
    if (!data?.data.length) {
      return (
        <EmptyState
          title="No tasks found"
          message={hasActiveFilters ? 'Try changing or clearing the filters.' : 'Create a task to get started.'}
        >
          {hasActiveFilters && <Button variant="outline-brand" size="sm" onClick={clearFilters}>Clear filters</Button>}
        </EmptyState>
      );
    }
    return <TaskTable tasks={data.data} onStatusChanged={reload} onDelete={setTaskToDelete} />;
  };

  return (
    <>
      <PageHeader title="Tasks" subtitle="Assign and track work across the team">
        <Button as={Link} to="/tasks/new" variant="brand">
          <FiPlus className="me-1" /> Add Task
        </Button>
        <Button variant="outline-brand" onClick={handleExport} disabled={exporting || !data?.pagination.total}>
          {exporting ? <Spinner size="sm" className="me-1" /> : <FiDownload className="me-1" />}
          Export To CSV
        </Button>
      </PageHeader>

      <TaskFilters
        filters={filters}
        onChange={updateFilters}
        onClear={clearFilters}
        hasActiveFilters={hasActiveFilters}
      />

      {filters.employee && (
        <Badge bg="light" text="dark" className="mb-3 p-2 border d-inline-flex align-items-center gap-2">
          Showing tasks of: {employeeName || 'selected employee'}
          <CloseButton aria-label="Remove employee filter" onClick={() => updateFilters({ employee: '' })} />
        </Badge>
      )}

      <div className="table-wrapper">
        {renderContent()}
        {!loading && !error && (
          <PaginationBar
            pagination={data?.pagination}
            itemName="tasks"
            onPageChange={(page) => updateFilters({ page })}
            onLimitChange={(limit) => updateFilters({ limit })}
          />
        )}
      </div>

      <ConfirmModal
        show={!!taskToDelete}
        title="Delete task"
        message={
          <>
            Are you sure you want to delete <strong>{taskToDelete?.taskId} - {taskToDelete?.title}</strong>? This can
            not be undone.
          </>
        }
        confirmText="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setTaskToDelete(null)}
      />
    </>
  );
};

export default TaskListPage;
