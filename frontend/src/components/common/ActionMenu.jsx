import { Dropdown } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FiEdit2, FiEye, FiMoreVertical, FiTrash2 } from 'react-icons/fi';

// Three-dots menu with View / Edit / Delete (used in employee and task tables)
const ActionMenu = ({ viewLink, editLink, canEdit = true, editDisabledText, onDelete }) => (
  <Dropdown align="end">
    <Dropdown.Toggle variant="link" className="action-toggle" aria-label="Actions">
      <FiMoreVertical />
    </Dropdown.Toggle>
    <Dropdown.Menu>
      <Dropdown.Item as={Link} to={viewLink} className="text-success">
        <FiEye className="me-2" /> View
      </Dropdown.Item>
      <Dropdown.Item as={Link} to={editLink} disabled={!canEdit} className="text-primary" title={canEdit ? '' : editDisabledText}>
        <FiEdit2 className="me-2" /> Edit
      </Dropdown.Item>
      <Dropdown.Divider />
      <Dropdown.Item as="button" onClick={onDelete} className="text-danger">
        <FiTrash2 className="me-2" /> Delete
      </Dropdown.Item>
    </Dropdown.Menu>
  </Dropdown>
);

export default ActionMenu;
