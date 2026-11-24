import { useState } from 'react';
import { Alert, Button, Form, InputGroup, Spinner } from 'react-bootstrap';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { FiBarChart2, FiCheckSquare, FiEye, FiEyeOff, FiLock, FiMail, FiShield, FiUsers } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const FEATURES = [
  { icon: FiUsers, title: 'Employee records', text: 'Departments, roles, status and leave in one place.' },
  { icon: FiCheckSquare, title: 'Smart task assignment', text: 'Capacity, leave and status rules checked by the server.' },
  { icon: FiBarChart2, title: 'Live dashboard', text: 'Workload, overdue and progress at a glance.' },
];

const validate = (values) => {
  const errors = {};
  if (!values.email.trim()) errors.email = 'Email is required';
  else if (!EMAIL_REGEX.test(values.email.trim())) errors.email = 'Please enter a valid email';
  if (!values.password) errors.password = 'Password is required';
  else if (values.password.length < 6) errors.password = 'Password must be at least 6 characters';
  return errors;
};

const LoginPage = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [values, setValues] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // page the user wanted before being sent to login
  const redirectTo = location.state?.from?.pathname
    ? `${location.state.from.pathname}${location.state.from.search || ''}`
    : '/';

  // already logged in -> no need to see the login page
  if (user) return <Navigate to={redirectTo} replace />;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }));
    if (serverError) setServerError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate(values);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setSubmitting(true);
    try {
      const res = await login(values.email.trim(), values.password);
      toast.success(res.message);
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setServerError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      {/* Left side: brand panel (hidden on small screens) */}
      <aside className="login-brand">
        <div className="login-brand-top">
          <span className="app-brand-logo login-logo">ET</span>
          <span className="login-brand-name">Employee &amp; Task Manager</span>
        </div>

        <div className="login-brand-content">
          <h1 className="login-headline">
            Manage your team and their work, <span>all in one place.</span>
          </h1>
          <ul className="login-features">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title}>
                <span className="login-feature-icon">
                  <Icon />
                </span>
                <div>
                  <div className="login-feature-title">{title}</div>
                  <div className="login-feature-text">{text}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="login-brand-footer">MERN Stack · React · Node.js · Express · MongoDB</div>
      </aside>

      {/* Right side: login form */}
      <main className="login-form-side">
        <div className="login-card">
          <div className="login-mobile-brand">
            <span className="app-brand-logo">ET</span>
            <span>Employee &amp; Task Manager</span>
          </div>

          <h2 className="login-title">Welcome back</h2>
          <p className="login-subtitle">Sign in to continue to your dashboard</p>

          {serverError && (
            <Alert variant="danger" className="py-2 small">
              {serverError}
            </Alert>
          )}

          <Form noValidate onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="login-email">
              <Form.Label>Email address</Form.Label>
              <InputGroup hasValidation className="login-input-group">
                <InputGroup.Text>
                  <FiMail />
                </InputGroup.Text>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="you@company.com"
                  value={values.email}
                  onChange={handleChange}
                  isInvalid={!!errors.email}
                  autoComplete="username"
                  autoFocus
                />
                <Form.Control.Feedback type="invalid">{errors.email}</Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <Form.Group className="mb-4" controlId="login-password">
              <Form.Label>Password</Form.Label>
              <InputGroup hasValidation className="login-input-group">
                <InputGroup.Text>
                  <FiLock />
                </InputGroup.Text>
                <Form.Control
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={values.password}
                  onChange={handleChange}
                  isInvalid={!!errors.password}
                  autoComplete="current-password"
                />
                <Button
                  variant="light"
                  className="password-toggle"
                  onClick={() => setShowPassword((show) => !show)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </Button>
                <Form.Control.Feedback type="invalid">{errors.password}</Form.Control.Feedback>
              </InputGroup>
            </Form.Group>

            <Button type="submit" variant="brand" size="lg" className="w-100 login-submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Spinner size="sm" className="me-2" /> Signing in...
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </Form>

          {submitting && (
            <p className="login-wakeup-note">
              The free server may take up to a minute to wake up on the first request.
            </p>
          )}

          <div className="login-secure-note">
            <FiShield /> Secure login · Passwords are stored encrypted
          </div>
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
