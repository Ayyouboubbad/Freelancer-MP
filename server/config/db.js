const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  const MAX_RETRIES = 5;
  let attempt = 0;

  while (attempt < MAX_RETRIES) {
    try {
      const conn = await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 5000,
      });
      logger.info(`MongoDB connected: ${conn.connection.host}`);
      return;
    } catch (err) {
      attempt++;
      logger.error(`MongoDB connection attempt ${attempt} failed: ${err.message}`);
      if (attempt >= MAX_RETRIES) {
        logger.error('Max retries reached. Exiting process.');
        process.exit(1);
      }
      // Exponential back-off
      await new Promise((r) => setTimeout(r, 1000 * 2 ** attempt));
    }
  }
};

module.exports = connectDB;
