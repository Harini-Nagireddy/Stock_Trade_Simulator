const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");

dotenv.config();

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
}));
app.use(express.json());

// Fail fast with a clear message if the DB isn't connected yet, instead of
// letting requests hang for ~10s on Mongoose's internal buffering timeout.
app.use("/api", (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database not connected. Check your MongoDB Atlas connection (IP whitelist, cluster status, or network).",
    });
  }
  next();
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/trade", require("./routes/tradeRoutes"));
app.use("/api/wallet", require("./routes/walletRoutes"));

// Health check
app.get("/", (req, res) => {
  res.json({ message: "TradeSim API is running 🚀" });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
