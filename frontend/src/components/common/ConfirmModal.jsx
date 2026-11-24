import { Button, Modal, Spinner } from 'react-bootstrap';

const ConfirmModal = ({
  show,
  title = 'Are you sure?',
  message,
  confirmText = 'Confirm',
  confirmVariant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}) => (
  <Modal show={show} onHide={loading ? undefined : onCancel} centered>
    <Modal.Header closeButton={!loading}>
      <Modal.Title as="h5">{title}</Modal.Title>
    </Modal.Header>
    <Modal.Body>{message}</Modal.Body>
    <Modal.Footer>
      <Button variant="outline-secondary" onClick={onCancel} disabled={loading}>
        Cancel
      </Button>
      <Button variant={confirmVariant} onClick={onConfirm} disabled={loading}>
        {loading && <Spinner size="sm" className="me-2" />}
        {confirmText}
      </Button>
    </Modal.Footer>
  </Modal>
);

export default ConfirmModal;
