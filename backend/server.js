const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database"); // ✅ Use Sequelize
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/docterRoutes");
const patientRoutes = require("./routes/patientRoutes");
const webhookRoutes = require("./routes/googleWebhook");

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Start background cron jobs
require("./services/syncPatient");

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/webhooks", webhookRoutes);

// Connect and Sync MySQL
sequelize
  .sync() // creates tables if they don't exist
  .then(() => console.log("MySQL connected and synced"))
  .catch((err) => console.error("MySQL connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
