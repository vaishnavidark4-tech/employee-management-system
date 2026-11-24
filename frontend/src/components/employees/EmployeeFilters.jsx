import { Button, Col, Form, Row } from 'react-bootstrap';
import { FiFilter } from 'react-icons/fi';
import SearchBox from '../common/SearchBox';
import { DEPARTMENTS, EMPLOYEE_SORT_OPTIONS, EMPLOYEE_STATUSES } from '../../constants';

const EmployeeFilters = ({ filters, onChange, onClear, hasActiveFilters }) => {
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
        placeholder="Search name, email or employee ID"
      />

      <Row className="g-2 mt-1 align-items-center">
        <Col xs={6} md={3}>
          <Form.Select
            value={filters.department}
            onChange={(e) => onChange({ department: e.target.value })}
            aria-label="Filter by department"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={6} md={3}>
          <Form.Select
            value={filters.status}
            onChange={(e) => onChange({ status: e.target.value })}
            aria-label="Filter by status"
          >
            <option value="">All Statuses</option>
            {EMPLOYEE_STATUSES.map((status) => (
              <option key={status} value={status}>{status}</option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={12} md={3}>
          <Form.Select value={sortValue} onChange={handleSortChange} aria-label="Sort employees">
            {EMPLOYEE_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>Sort: {option.label}</option>
            ))}
          </Form.Select>
        </Col>
        <Col xs={12} md={3} className="text-md-end">
          {hasActiveFilters && (
            <Button variant="link" className="text-decoration-none p-0" onClick={onClear}>
              <FiFilter className="me-1" />
              Clear filters
            </Button>
          )}
        </Col>
      </Row>
    </div>
  );
};

export default EmployeeFilters;
