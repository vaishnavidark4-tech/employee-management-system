import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import AppNavbar from './AppNavbar';

const AppLayout = () => (
  <div className="app-wrapper">
    <AppNavbar />
    <main className="app-main">
      <Container fluid="lg">
        <Outlet />
      </Container>
    </main>
    <footer className="app-footer">Employee &amp; Task Management System · MERN Stack</footer>
  </div>
);

export default AppLayout;
