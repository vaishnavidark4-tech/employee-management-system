import { Link } from 'react-router-dom';

// Number card on the dashboard. Clicking it opens the list with the matching filter.
const StatCard = ({ label, value, color = 'stat-dark', to }) => {
  const content = (
    <>
      <div className="stat-label">{label}</div>
      <div className={`stat-value ${color}`}>{value}</div>
    </>
  );

  if (!to) return <div className="stat-card">{content}</div>;

  return (
    <Link to={to} className="stat-card" title={`View ${label.toLowerCase()}`}>
      {content}
    </Link>
  );
};

export default StatCard;
