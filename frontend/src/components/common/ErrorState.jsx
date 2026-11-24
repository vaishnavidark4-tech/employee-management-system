import { Alert, Button } from 'react-bootstrap';
import { FiRefreshCw } from 'react-icons/fi';

// Shown when a page could not load its data
const ErrorState = ({ message, onRetry }) => (
  <Alert variant="danger" className="d-flex flex-wrap align-items-center justify-content-between gap-2">
    <span>{message || 'Something went wrong while loading data.'}</span>
    {onRetry && (
      <Button size="sm" variant="outline-danger" onClick={onRetry}>
        <FiRefreshCw className="me-1" /> Try again
      </Button>
    )}
  </Alert>
);

export default ErrorState;
