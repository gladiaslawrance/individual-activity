
require('dotenv').config();

const mongoose = require('mongoose');
const readline = require('readline');
const Admin = require('./models/Admin');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const ask = (question) =>
  new Promise((resolve) => rl.question(question, resolve));

async function main() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing');
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    const email = (await ask('Admin email: ')).trim().toLowerCase();
    const username = (await ask('Admin username: ')).trim();
    const password = await ask('New admin password: ');

    const existing = await Admin.findOne({ email });

    if (existing) {
      console.log('Admin already exists. No changes made.');
      return;
    }

    if (!username || password.length < 6) {
      throw new Error('Username required; password must be at least 6 characters');
    }

    const admin = await Admin.create({
      username,
      email,
      password,
      role: 'superadmin',
    });

    console.log('Admin created:', admin.email);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    rl.close();
    await mongoose.disconnect();
  }
}

main();
