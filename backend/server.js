const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");
const webhookRoutes = require("./routes/googleWebhook");

require("./models/Patient");
require("./models/PatientVisit");

const app = express();

app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
}));
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));

require("./services/syncPatient");

app.use("/api/auth", authRoutes);
app.use("/api", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/webhooks", webhookRoutes);

// Only use alter:true in development — never in production
const syncOptions = process.env.NODE_ENV === "production"
  ? {}
  : { alter: true };

sequelize
  .sync(syncOptions)
  .then(() => console.log("✅ MySQL connected and synced"))
  .catch((err) => console.error("❌ MySQL connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
