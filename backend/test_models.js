require('dotenv').config();
const connectDB = require('./config/db');
const User = require('./models/User');
const Group = require('./models/Group');
const Expense = require('./models/Expense');

const test = async () => {
  await connectDB();
  console.log("Models loaded successfully");
  process.exit(0);
}

test();
