const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");

// GET all patients
router.get("/", async (req, res) => {
    try {
        const patients = await Patient.find().sort({ createdAt: -1 });
        res.json(patients);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch patients" });
    }
});

// GET patient by ID
router.get("/:id", async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ error: "Patient not found" });
        res.json(patient);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch patient details" });
    }
});

// PUT update patient by ID
router.put("/:id", async (req, res) => {
    try {
        const updatedPatient = await Patient.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );
        if (!updatedPatient) return res.status(404).json({ error: "Patient not found" });
        res.json(updatedPatient);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update patient" });
    }
});

module.exports = router;
