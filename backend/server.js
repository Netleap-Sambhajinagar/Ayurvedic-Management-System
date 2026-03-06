const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/docterRoutes");
const patientRoutes = require("./routes/patientRoutes"); // ✅ Added

const app = express(); // ✅ must declare BEFORE using

// Middlewares
app.use(cors());
app.use(express.json()); // parse JSON body

// Start background cron jobs
require("./services/syncPatient");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", doctorRoutes);
app.use("/api/patients", patientRoutes); // ✅ Added

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
