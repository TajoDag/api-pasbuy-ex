const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL);
    console.log('MongoDB Connected');
  } catch (err) {
    console.error('MongoDB Connection Failed', err.message);
    // Exit process with failure
    process.exit(1);
  }
};

module.exports = connectDB;
