const mongoose = require('mongoose');

// connect to mongo
async function connectDB() {
  let conn = await mongoose.connect(process.env.MONGODB_URI);
  return conn;
}

module.exports = connectDB;
