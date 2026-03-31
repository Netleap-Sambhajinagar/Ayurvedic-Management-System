const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");

router.post("/google-form-webhook", async (req, res) => {
  try {
    const secret = req.headers["x-secret-key"];

    if (secret !== process.env.WEBHOOK_SECRET) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const email = req.body.email?.toLowerCase().trim();
    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // Resolve doctorId from doctor email or name provided in the form
    let doctorId = req.body.doctorId || null;
    if (!doctorId && req.body.doctorEmail) {
      const doc = await Doctor.findOne({ where: { email: req.body.doctorEmail.toLowerCase().trim() } });
      if (doc) doctorId = doc.id;
    }
    if (!doctorId && req.body.doctorName) {
      const doc = await Doctor.findOne({ where: { name: req.body.doctorName.trim() } });
      if (doc) doctorId = doc.id;
    }

    const { doctorEmail, doctorName, ...patientBody } = req.body;

    // Upsert the patient data
    const [patient, created] = await Patient.upsert({
      ...patientBody,
      email,
      doctorId,
    });

    res.status(200).json({
      message: created ? "Patient created successfully" : "Patient updated successfully",
      patient,
    });
  } catch (error) {
    console.error("Error saving patient:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
