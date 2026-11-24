import { useState } from 'react';
import { Button, Dropdown, Form } from 'react-bootstrap';
import { formatDate } from '../../utils/date';

// "Due: from - to" filter. Dates are applied only when the user clicks Apply.
const DueDateRangeFilter = ({ dueFrom, dueTo, onApply }) => {
  const [show, setShow] = useState(false);
  const [from, setFrom] = useState(dueFrom);
  const [to, setTo] = useState(dueTo);
  const [error, setError] = useState('');

  // when the menu opens, start from the values that are in the URL
  const handleToggle = (nextShow) => {
    if (nextShow) {
      setFrom(dueFrom);
      setTo(dueTo);
      setError('');
    }
    setShow(nextShow);
  };

  const handleApply = () => {
    if (from && to && to < from) {
      setError('"To" date can not be before "From" date');
      return;
    }
    setError('');
    onApply({ dueFrom: from, dueTo: to });
    setShow(false);
  };

  const handleClear = () => {
    setFrom('');
    setTo('');
    setError('');
    onApply({ dueFrom: '', dueTo: '' });
    setShow(false);
  };

  let label = 'Due: from - to';
  if (dueFrom && dueTo) label = `Due: ${formatDate(dueFrom)} - ${formatDate(dueTo)}`;
  else if (dueFrom) label = `Due from ${formatDate(dueFrom)}`;
  else if (dueTo) label = `Due till ${formatDate(dueTo)}`;

  return (
    <Dropdown show={show} onToggle={handleToggle} autoClose="outside">
      <Dropdown.Toggle variant="outline-secondary" className="w-100 text-start text-truncate bg-white text-dark">
        {label}
      </Dropdown.Toggle>
      <Dropdown.Menu className="date-range-menu">
        <Form.Group className="mb-2" controlId="dueFrom">
          <Form.Label className="small mb-1">From</Form.Label>
          <Form.Control type="date" size="sm" value={from} onChange={(e) => setFrom(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-2" controlId="dueTo">
          <Form.Label className="small mb-1">To</Form.Label>
          <Form.Control
            type="date"
            size="sm"
            value={to}
            min={from || undefined}
            onChange={(e) => setTo(e.target.value)}
          />
        </Form.Group>
        {error && <div className="text-danger small mb-2">{error}</div>}
        <div className="d-flex gap-2">
          <Button size="sm" variant="outline-secondary" className="flex-fill" onClick={handleClear}>
            Clear
          </Button>
          <Button size="sm" variant="brand" className="flex-fill" onClick={handleApply}>
            Apply
          </Button>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default DueDateRangeFilter;
