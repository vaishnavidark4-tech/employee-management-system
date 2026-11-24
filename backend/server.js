require('dotenv').config({ quiet: true });

const app = require('./src/app');
const connectDB = require('./src/config/db');
const { getSecret } = require('./src/utils/token');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    getSecret(); // stop early with a clear message if JWT_SECRET is missing
    await connectDB(process.env.MONGO_URI);
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();
