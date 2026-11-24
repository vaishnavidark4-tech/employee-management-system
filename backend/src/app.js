const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const employeeRoutes = require('./routes/employeeRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// CLIENT_URL can have one or more comma separated URLs (local + deployed frontend)
const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''));

app.use(
  cors({
    origin: allowedOrigins,
    exposedHeaders: ['Content-Disposition'], // so the frontend can read the CSV file name
  })
);
app.use(express.json({ limit: '100kb' }));
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

// Base URL: small info message instead of "Route not found"
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Employee & Task Management API. All endpoints are under /api',
    endpoints: ['/api/health', '/api/dashboard', '/api/employees', '/api/tasks', '/api/tasks/export/csv'],
  });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'API is running' });
});

app.use('/api/employees', employeeRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Note: Express 5 automatically sends errors from async route handlers to errorHandler
app.use(notFound);
app.use(errorHandler);

module.exports = app;
