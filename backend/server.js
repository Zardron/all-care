const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

// Set up server
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.json());
app.use(cookieParser());

// Set up Port Connection
app.listen(PORT, () => console.log(`Server is running on port: ${PORT}`));

// Database Connection
const connectDB = async () => {
  try {
    mongoose.set("strictQuery", false);
    mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
  } catch (error) {
    console.log(error);
    process.exit();
  }
};

connectDB();

// Setup Routes
app.use("/auth", require("./routers/userRouter")); // Route for Sign/Login & Add Account
