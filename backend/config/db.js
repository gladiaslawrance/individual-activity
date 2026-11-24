const mongoose = require('mongoose');

const connectDB = async () => {
  const primaryUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ratelimit_db';
  const localFallbackUri = 'mongodb://127.0.0.1:27017/ratelimit_db';
  
  const isAtlas = primaryUri.includes('mongodb+srv://') || primaryUri.includes('.mongodb.net');
  if (isAtlas) {
    console.log('[MongoDB Atlas] Attempting connection to Atlas Cloud cluster...');
  }

  try {
    const conn = await mongoose.connect(primaryUri, {
      serverSelectionTimeoutMS: 5000,
    });
    console.log(`[MongoDB Connected] Host: ${conn.connection.host}, DB: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    if (isAtlas) {
      console.warn(`[MongoDB Atlas Notice] Atlas connection attempt: ${error.message}`);
      console.log(`[MongoDB Fallback] Connecting to local MongoDB instance at ${localFallbackUri}...`);
      try {
        const localConn = await mongoose.connect(localFallbackUri, {
          serverSelectionTimeoutMS: 5000,
        });
        console.log(`[MongoDB Connected Locally] Host: ${localConn.connection.host}, DB: ${localConn.connection.name}`);
        return localConn;
      } catch (localError) {
        console.error(`[MongoDB Local Connection Error] ${localError.message}`);
        process.exit(1);
      }
    } else {
      console.error(`[MongoDB Connection Error] ${error.message}`);
      process.exit(1);
    }
  }
};

module.exports = connectDB;
