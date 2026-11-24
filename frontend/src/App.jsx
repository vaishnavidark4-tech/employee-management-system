import { Route, Routes } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';

import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import EmployeeListPage from './pages/employees/EmployeeListPage';
import EmployeeCreatePage from './pages/employees/EmployeeCreatePage';
import EmployeeEditPage from './pages/employees/EmployeeEditPage';
import EmployeeDetailsPage from './pages/employees/EmployeeDetailsPage';
import TaskListPage from './pages/tasks/TaskListPage';
import TaskCreatePage from './pages/tasks/TaskCreatePage';
import TaskEditPage from './pages/tasks/TaskEditPage';
import TaskDetailsPage from './pages/tasks/TaskDetailsPage';
import NotFoundPage from './pages/NotFoundPage';

const App = () => (
  <>
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<DashboardPage />} />

        <Route path="/employees" element={<EmployeeListPage />} />
        <Route path="/employees/new" element={<EmployeeCreatePage />} />
        <Route path="/employees/:id" element={<EmployeeDetailsPage />} />
        <Route path="/employees/:id/edit" element={<EmployeeEditPage />} />

        <Route path="/tasks" element={<TaskListPage />} />
        <Route path="/tasks/new" element={<TaskCreatePage />} />
        <Route path="/tasks/:id" element={<TaskDetailsPage />} />
        <Route path="/tasks/:id/edit" element={<TaskEditPage />} />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>

    <ToastContainer position="top-right" autoClose={3500} newestOnTop theme="colored" />
  </>
);

export default App;
