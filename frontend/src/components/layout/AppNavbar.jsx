import { useState } from 'react';
import { Container, Nav, NavDropdown, Navbar } from 'react-bootstrap';
import { NavLink, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiCheckSquare, FiGrid, FiLogOut, FiUsers } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/employees', label: 'Employees', icon: FiUsers },
  { to: '/tasks', label: 'Tasks', icon: FiCheckSquare },
];

// "Vaishnavi Darkunde" -> "VD"
const getInitials = (name = '') =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

const AppNavbar = () => {
  const [expanded, setExpanded] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    setExpanded(false);
    toast.info('You have been logged out');
    navigate('/login', { replace: true });
  };

  const userToggle = (
    <span className="user-toggle">
      <span className="user-avatar">{getInitials(user?.name)}</span>
      <span className="user-name">{user?.name}</span>
    </span>
  );

  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="md" sticky="top" expanded={expanded} onToggle={setExpanded}>
      <Container fluid="lg">
        <Navbar.Brand as={NavLink} to="/" className="app-brand" onClick={() => setExpanded(false)}>
          <span className="app-brand-logo">ET</span>
          Employee &amp; Task Manager
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-auto align-items-md-center">
            {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
              <Nav.Link key={to} as={NavLink} to={to} end={end} onClick={() => setExpanded(false)}>
                <Icon className="me-1" />
                {label}
              </Nav.Link>
            ))}
            {user && (
              <NavDropdown title={userToggle} id="user-menu" align="end" className="user-menu">
                <NavDropdown.Header>
                  <div className="fw-semibold text-body-emphasis">{user.name}</div>
                  <div className="small">{user.email}</div>
                </NavDropdown.Header>
                <NavDropdown.Divider />
                <NavDropdown.Item as="button" onClick={handleLogout} className="text-danger">
                  <FiLogOut className="me-2" /> Logout
                </NavDropdown.Item>
              </NavDropdown>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
