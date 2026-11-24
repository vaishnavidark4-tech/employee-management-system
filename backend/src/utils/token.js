const jwt = require('jsonwebtoken');

const getSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not defined. Please add it in the .env file.');
  }
  return process.env.JWT_SECRET;
};

// Creates a signed token that contains only the user id
const createToken = (userId) =>
  jwt.sign({ id: userId }, getSecret(), { expiresIn: process.env.JWT_EXPIRES_IN || '1d' });

// Returns the token payload, or throws if the token is invalid / expired
const verifyToken = (token) => jwt.verify(token, getSecret());

module.exports = { createToken, verifyToken, getSecret };
