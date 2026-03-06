const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");

router.post("/google-form-webhook", async (req, res) => {
  try {
    const secret = req.headers["x-secret-key"];

    if (secret !== process.env.WEBHOOK_SECRET) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    // Duplicate check by email
    const existing = await Patient.findOne({ email: req.body.email });

    if (existing) {
      return res.status(400).json({ message: "Patient already exists" });
    }

    const patient = new Patient(req.body);
    await patient.save();

    res.status(200).json({ message: "Patient saved successfully" });
  } catch (error) {
    console.error("Error saving patient:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
