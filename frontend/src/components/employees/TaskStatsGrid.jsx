import { Col, Row } from 'react-bootstrap';

// Small boxes with the task counts of one employee
const TaskStatsGrid = ({ stats }) => {
  const items = [
    { label: 'Total', value: stats.total, className: 'stat-dark' },
    { label: 'Todo', value: stats.todo, className: 'stat-grey' },
    { label: 'In Progress', value: stats.inProgress, className: 'stat-blue' },
    { label: 'Completed', value: stats.completed, className: 'stat-green' },
    { label: 'Cancelled', value: stats.cancelled, className: 'stat-brown' },
    { label: 'Overdue', value: stats.overdue, className: 'stat-red' },
  ];

  return (
    <Row className="g-2">
      {items.map((item) => (
        <Col key={item.label} xs={4} md={2}>
          <div className="mini-stat">
            <div className={`mini-stat-value ${item.className}`}>{item.value}</div>
            <div className="mini-stat-label">{item.label}</div>
          </div>
        </Col>
      ))}
    </Row>
  );
};

export default TaskStatsGrid;
