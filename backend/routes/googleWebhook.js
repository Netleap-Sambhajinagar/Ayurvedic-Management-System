const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");

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

    // Upsert the patient data
    const [patient, created] = await Patient.upsert({
      ...req.body,
      email: email
    });

    res.status(200).json({
      message: created ? "Patient created successfully" : "Patient updated successfully",
      patient
    });
  } catch (error) {
    console.error("Error saving patient:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;
