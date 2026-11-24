import { FiInbox } from 'react-icons/fi';

const EmptyState = ({ title = 'No records found', message, children }) => (
  <div className="empty-state">
    <FiInbox className="empty-state-icon" />
    <h6>{title}</h6>
    {message && <p className="text-muted mb-2">{message}</p>}
    {children}
  </div>
);

export default EmptyState;
