const express = require("express");
const cors = require("cors");
const sequelize = require("./config/database");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const doctorRoutes = require("./routes/docterRoutes");
const patientRoutes = require("./routes/patientRoutes");
const webhookRoutes = require("./routes/googleWebhook");

// Ensure models are loaded so Sequelize knows about them
require("./models/Patient");
require("./models/PatientVisit");

const app = express();
app.use(cors());
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ limit: "5mb", extended: true }));
require("./services/syncPatient");

app.use("/api/auth", authRoutes);
app.use("/api", doctorRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/webhooks", webhookRoutes);

// Sync all models (alter:true adds new columns without dropping data)
sequelize
  .sync({ alter: true })
  .then(() => console.log("✅ MySQL connected and synced"))
  .catch((err) => console.error("❌ MySQL connection error:", err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
