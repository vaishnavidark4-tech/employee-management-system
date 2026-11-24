import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFoundPage = ({ title = 'Page not found', message = 'The page you are looking for does not exist.' }) => (
  <div className="not-found">
    <h1 className="not-found-code">404</h1>
    <h5>{title}</h5>
    <p className="text-muted">{message}</p>
    <Button as={Link} to="/" variant="brand">
      Go to Dashboard
    </Button>
  </div>
);

export default NotFoundPage;
