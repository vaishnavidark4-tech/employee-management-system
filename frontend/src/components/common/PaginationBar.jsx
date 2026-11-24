import { Form, Pagination } from 'react-bootstrap';
import { PAGE_SIZE_OPTIONS } from '../../constants';

// Returns page numbers to show, e.g. [1, '...', 4, 5, 6, '...', 10]
const getPageNumbers = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) pages.push('start-dots');
  for (let i = start; i <= end; i += 1) pages.push(i);
  if (end < total - 1) pages.push('end-dots');
  pages.push(total);
  return pages;
};

const PaginationBar = ({ pagination, itemName = 'records', onPageChange, onLimitChange }) => {
  if (!pagination || pagination.total === 0) return null;

  const { page, limit, total, totalPages } = pagination;
  const from = (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  return (
    <div className="pagination-bar">
      <div className="d-flex align-items-center gap-2 text-muted small">
        <span>
          Showing {from}-{to} of {total} {itemName}
        </span>
        {onLimitChange && (
          <Form.Select
            size="sm"
            className="page-size-select"
            value={limit}
            onChange={(e) => onLimitChange(e.target.value)}
            aria-label="Rows per page"
          >
            {PAGE_SIZE_OPTIONS.map((size) => (
              <option key={size} value={size}>
                {size} / page
              </option>
            ))}
          </Form.Select>
        )}
      </div>

      {totalPages > 1 && (
        <Pagination size="sm" className="mb-0">
          <Pagination.Prev disabled={page <= 1} onClick={() => onPageChange(page - 1)} />
          {getPageNumbers(page, totalPages).map((item) =>
            typeof item === 'number' ? (
              <Pagination.Item key={item} active={item === page} onClick={() => onPageChange(item)}>
                {item}
              </Pagination.Item>
            ) : (
              <Pagination.Ellipsis key={item} disabled />
            )
          )}
          <Pagination.Next disabled={page >= totalPages} onClick={() => onPageChange(page + 1)} />
        </Pagination>
      )}
    </div>
  );
};

export default PaginationBar;
