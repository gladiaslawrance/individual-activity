const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/ratelimit_db';
    
    const isAtlas = mongoUri.includes('mongodb+srv://') || mongoUri.includes('.mongodb.net');
    if (isAtlas) {
      console.log('[MongoDB Atlas] Detected Atlas Cloud URI. Connecting with TLS...');
    }

    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 10000, // 10s selection timeout
    });

    console.log(`[MongoDB Connected] Host: ${conn.connection.host}, DB: ${conn.connection.name}`);
    return conn;
  } catch (error) {
    console.error(`[MongoDB Connection Error] ${error.message}`);
    if (error.message.includes('bad auth') || error.message.includes('Authentication failed')) {
      console.error('[MongoDB Atlas] Authentication failed: Please check your Atlas username and password.');
    } else if (error.message.includes('querySrv') || error.message.includes('ETIMEOUT') || error.message.includes('ENOTFOUND')) {
      console.error('[MongoDB Atlas] Network/DNS error: Ensure 0.0.0.0/0 is permitted in Atlas "Network Access".');
    }
    process.exit(1);
  }
};

module.exports = connectDB;
