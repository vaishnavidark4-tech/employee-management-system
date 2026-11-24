import { useState } from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import { FiCheckSquare, FiGrid, FiUsers } from 'react-icons/fi';

const NAV_LINKS = [
  { to: '/', label: 'Dashboard', icon: FiGrid, end: true },
  { to: '/employees', label: 'Employees', icon: FiUsers },
  { to: '/tasks', label: 'Tasks', icon: FiCheckSquare },
];

const AppNavbar = () => {
  const [expanded, setExpanded] = useState(false);

  return (
    <Navbar bg="dark" data-bs-theme="dark" expand="md" sticky="top" expanded={expanded} onToggle={setExpanded}>
      <Container fluid="lg">
        <Navbar.Brand as={NavLink} to="/" className="app-brand" onClick={() => setExpanded(false)}>
          <span className="app-brand-logo">ET</span>
          Employee &amp; Task Manager
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar" />
        <Navbar.Collapse id="main-navbar">
          <Nav className="ms-auto">
            {NAV_LINKS.map(({ to, label, icon: Icon, end }) => (
              <Nav.Link key={to} as={NavLink} to={to} end={end} onClick={() => setExpanded(false)}>
                <Icon className="me-1" />
                {label}
              </Nav.Link>
            ))}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default AppNavbar;
