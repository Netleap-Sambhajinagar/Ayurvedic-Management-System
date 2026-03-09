const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");

// GET all patients
router.get("/", async (req, res) => {
    try {
        const patients = await Patient.findAll({
            order: [["createdAt", "DESC"]]
        });
        res.json(patients);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch patients" });
    }
});

// GET patient by ID
router.get("/:id", async (req, res) => {
    try {
        const patient = await Patient.findByPk(req.params.id);
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
        const [updatedRowsCount, [updatedPatient]] = await Patient.update(req.body, {
            where: { id: req.params.id },
            returning: true, // Only works in Postgres, for MySQL we need a separate find
        });

        // For MySQL:
        await Patient.update(req.body, { where: { id: req.params.id } });
        const patient = await Patient.findByPk(req.params.id);

        if (!patient) return res.status(404).json({ error: "Patient not found" });
        res.json(patient);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to update patient" });
    }
});

module.exports = router;
