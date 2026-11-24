import { Button, Col, Row } from 'react-bootstrap';
import { FiRefreshCw } from 'react-icons/fi';
import PageHeader from '../components/common/PageHeader';
import Loader from '../components/common/Loader';
import ErrorState from '../components/common/ErrorState';
import EmptyState from '../components/common/EmptyState';
import StatCard from '../components/dashboard/StatCard';
import WorkloadTable from '../components/dashboard/WorkloadTable';
import useFetch from '../hooks/useFetch';
import { getDashboard } from '../api/dashboardApi';

// All numbers on this page are calculated by the backend (GET /api/dashboard)
const DashboardPage = () => {
  const { data, loading, error, reload } = useFetch(getDashboard);

  if (loading && !data) return <Loader text="Loading dashboard..." />;
  if (error) return <ErrorState message={error.message} onRetry={reload} />;

  const { employees, tasks, workload, maxActiveTasks } = data;

  const employeeCards = [
    { label: 'Total Employees', value: employees.total, color: 'stat-dark', to: '/employees' },
    { label: 'Active', value: employees.active, color: 'stat-green', to: '/employees?status=Active' },
    { label: 'Inactive', value: employees.inactive, color: 'stat-grey', to: '/employees?status=Inactive' },
    { label: 'On Leave', value: employees.onLeave, color: 'stat-orange', to: '/employees?status=On%20Leave' },
  ];

  const taskCards = [
    { label: 'Total Tasks', value: tasks.total, color: 'stat-dark', to: '/tasks' },
    { label: 'Todo', value: tasks.todo, color: 'stat-grey', to: '/tasks?status=Todo' },
    { label: 'In Progress', value: tasks.inProgress, color: 'stat-blue', to: '/tasks?status=In%20Progress' },
    { label: 'Completed', value: tasks.completed, color: 'stat-green', to: '/tasks?status=Completed' },
    { label: 'Cancelled', value: tasks.cancelled, color: 'stat-brown', to: '/tasks?status=Cancelled' },
    { label: 'Overdue', value: tasks.overdue, color: 'stat-red', to: '/tasks?status=Overdue' },
  ];

  return (
    <>
      <PageHeader title="Dashboard" subtitle="Overview of employees and tasks">
        <Button variant="outline-secondary" onClick={reload} disabled={loading}>
          <FiRefreshCw className="me-1" /> Refresh
        </Button>
      </PageHeader>

      <Row className="g-3 mb-3">
        {employeeCards.map((card) => (
          <Col key={card.label} xs={6} md={3}>
            <StatCard {...card} />
          </Col>
        ))}
      </Row>

      <Row className="g-3">
        {taskCards.map((card) => (
          <Col key={card.label} xs={6} md={4} lg={2}>
            <StatCard {...card} />
          </Col>
        ))}
      </Row>

      <h2 className="section-title">Employee Workload</h2>
      <p className="text-muted small">
        Active tasks = Todo + In Progress. One employee can have at most {maxActiveTasks} active tasks.
      </p>
      <div className="table-wrapper">
        {workload.length > 0 ? (
          <WorkloadTable workload={workload} maxActiveTasks={maxActiveTasks} />
        ) : (
          <EmptyState title="No employees yet" message="Add employees to see their workload." />
        )}
      </div>
    </>
  );
};

export default DashboardPage;
