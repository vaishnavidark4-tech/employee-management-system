const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { createToken } = require('../utils/token');

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const toPublicUser = (user) => ({ _id: user._id, name: user.name, email: user.email });

// POST /api/auth/login   body: { email, password }
const login = async (req, res) => {
  const email = typeof req.body?.email === 'string' ? req.body.email.trim().toLowerCase() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';

  const errors = {};
  if (!email) errors.email = 'Email is required';
  else if (!EMAIL_REGEX.test(email)) errors.email = 'Please enter a valid email';
  if (!password) errors.password = 'Password is required';
  if (Object.keys(errors).length > 0) {
    throw ApiError.badRequest('Please enter your email and password', errors);
  }

  const user = await User.findOne({ email }).select('+password');

  // Same message for "no user" and "wrong password", so nobody can find out which emails exist
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  res.json({
    success: true,
    message: `Welcome back, ${user.name}!`,
    data: { token: createToken(user._id), user: toPublicUser(user) },
  });
};

// GET /api/auth/me  (protected) - used by the frontend to check if the saved token is still valid
const getMe = async (req, res) => {
  res.json({ success: true, data: toPublicUser(req.user) });
};

module.exports = { login, getMe };
