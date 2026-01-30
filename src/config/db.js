const mongoose = require("mongoose");
require("dotenv").config();

// Prevent MongoDB operator injection in filters
mongoose.set("sanitizeFilter", true);

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DB_URL, {
      dbName: process.env.DB_NAME,
      user: process.env.DB_USER,
      pass: process.env.DB_PASSWORD,
    });
    console.log(`Mongo connected on:${process.env.DB_URL}`);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

module.exports = connectDB;
