/**
 * Creates (or updates) a login user.
 * The email and password are passed on the command line, so they are never saved in the code:
 *
 *   npm run create-user -- --name "Vaishnavi Darkunde" --email you@example.com --password yourPassword
 *
 * If the email already exists, the name and password are updated.
 */
require('dotenv').config({ quiet: true });

const mongoose = require('mongoose');
const connectDB = require('../src/config/db');
const User = require('../src/models/User');

// Reads "--key value" pairs from the command line
const getArg = (key) => {
  const index = process.argv.indexOf(`--${key}`);
  return index !== -1 ? process.argv[index + 1] : undefined;
};

const createUser = async () => {
  const name = getArg('name') || 'Admin';
  const email = getArg('email');
  const password = getArg('password');

  if (!email || !password) {
    console.log('Usage: npm run create-user -- --name "Your Name" --email you@example.com --password yourPassword');
    process.exit(1);
  }

  await connectDB(process.env.MONGO_URI);

  let user = await User.findOne({ email: email.toLowerCase() });
  if (user) {
    user.name = name;
    user.password = password; // hashed by the pre-save hook
    await user.save();
    console.log(`User updated: ${user.email}`);
  } else {
    user = await User.create({ name, email, password });
    console.log(`User created: ${user.email}`);
  }

  await mongoose.disconnect();
};

createUser().catch(async (error) => {
  console.error('Could not create user:', error.message);
  await mongoose.disconnect();
  process.exit(1);
});
