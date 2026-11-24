// Label / value pair used on the View pages
const DetailItem = ({ label, children }) => (
  <div className="detail-item">
    <div className="detail-label">{label}</div>
    <div className="detail-value">{children ?? '-'}</div>
  </div>
);

export default DetailItem;
