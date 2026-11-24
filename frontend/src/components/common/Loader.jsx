import { Spinner } from 'react-bootstrap';

const Loader = ({ text = 'Loading...' }) => (
  <div className="loader-box" role="status">
    <Spinner animation="border" variant="secondary" />
    <span className="text-muted">{text}</span>
  </div>
);

export default Loader;
