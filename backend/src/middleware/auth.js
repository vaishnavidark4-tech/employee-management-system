const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { verifyToken } = require('../utils/token');

// Protects a route: the request must have "Authorization: Bearer <token>"
const protect = async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    throw new ApiError(401, 'Please log in to continue');
  }

  let payload;
  try {
    payload = verifyToken(token);
  } catch {
    throw new ApiError(401, 'Your session has expired. Please log in again.');
  }

  const user = await User.findById(payload.id);
  if (!user) {
    throw new ApiError(401, 'User no longer exists. Please log in again.');
  }

  req.user = user;
  next();
};

module.exports = { protect };
