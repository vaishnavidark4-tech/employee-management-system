import { Link } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';

// Page title with optional back link and action buttons on the right
const PageHeader = ({ title, subtitle, backTo, backLabel = 'Back', children }) => (
  <div className="page-header">
    <div>
      {backTo && (
        <Link to={backTo} className="back-link">
          <FiArrowLeft /> {backLabel}
        </Link>
      )}
      <h1 className="page-title">{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </div>
    {children && <div className="page-actions">{children}</div>}
  </div>
);

export default PageHeader;
