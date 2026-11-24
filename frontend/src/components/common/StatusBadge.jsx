import { Badge } from 'react-bootstrap';
import { EMPLOYEE_STATUS_VARIANTS, PRIORITY_VARIANTS, TASK_STATUS_VARIANTS } from '../../constants';

// One badge component for task status, employee status and priority
const BADGE_TYPES = {
  task: TASK_STATUS_VARIANTS,
  employee: EMPLOYEE_STATUS_VARIANTS,
  priority: PRIORITY_VARIANTS,
};

const StatusBadge = ({ type = 'task', value, className = '' }) => {
  const variant = BADGE_TYPES[type]?.[value] || 'secondary';
  return <Badge bg={variant} className={`status-badge ${className}`}>{value}</Badge>;
};

export const OverdueBadge = () => (
  <Badge bg="danger" className="status-badge">Overdue</Badge>
);

export default StatusBadge;
