import { Button, Col, Form, Row } from 'react-bootstrap';
import { FiFilter } from 'react-icons/fi';
import SearchBox from '../common/SearchBox';
import DueDateRangeFilter from './DueDateRangeFilter';
import { DEPARTMENTS, OVERDUE_FILTER, TASK_PRIORITIES, TASK_SORT_OPTIONS, TASK_STATUSES } from '../../constants';

const TaskFilters = ({ filters, onChange, onClear, hasActiveFilters }) => {
  const sortValue = `${filters.sortBy}:${filters.order}`;

  const handleSortChange = (e) => {
    const [sortBy, order] = e.target.value.split(':');
    onChange({ sortBy, order });
  };

  return (
    <div className="app-card filter-card">
      <SearchBox
        key={filters.search}
        value={filters.search}
        onSearch={(search) => onChange({ search })}
        placeholder="Search title or employee"
      />

      <Row className="g-2 mt-1 align-items-center">
        <Col xs={6} md={4} lg={2}>
          <Form.Select
            value={filters.department}
            onChange={(e) => onChange({ department: e.target.value })}
            aria-label="Filter by department"
          >
            <option value="">Department</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={6} md={4} lg={2}>
          <Form.Select
            value={filters.priority}
            onChange={(e) => onChange({ priority: e.target.value })}
            aria-label="Filter by priority"
          >
            <option value="">Priority</option>
            {TASK_PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>{priority}</option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={6} md={4} lg={2}>
          <Form.Select
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value })}
            aria-label="Filter by status"
          >
            <option value="">Status</option>
            {TASK_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
            <option value={OVERDUE_FILTER}>Overdue</option>
          </Form.Select>
        </Col>
        <Col xs={6} md={4} lg={2}>
          <DueDateRangeFilter dueFrom={filters.dueFrom} dueTo={filters.dueTo} onApply={onChange} />
        </Col>
        <Col xs={12} md={4} lg={3}>
          <Form.Select value={sortValue} onChange={handleSortChange} aria-label="Sort tasks">
            {TASK_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>Sort: {option.label}</option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={12} md={4} lg={1} className="text-lg-end">
          {hasActiveFilters && (
            <Button variant="link" className="text-decoration-none p-0 text-nowrap" onClick={onClear}>
              <FiFilter className="me-1" />
              Clear
            </Button>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default TaskFilters;
