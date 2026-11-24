import { Navigate, Outlet, useLocation } from 'react-router-dom';
import Loader from '../common/Loader';
import { useAuth } from '../../context/AuthContext';

// Shows the page only to logged-in users, others are sent to /login
// (the current page is remembered, so the user comes back here after logging in)
const ProtectedRoute = () => {
  const { user, checking } = useAuth();
  const location = useLocation();

  if (checking) return <Loader text="Checking your session..." />;
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;

  return <Outlet />;
};

export default ProtectedRoute;
