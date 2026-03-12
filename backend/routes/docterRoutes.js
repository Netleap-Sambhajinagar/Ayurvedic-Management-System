const express = require("express");
const router  = express.Router();
const Doctor  = require("../models/Doctor");
const bcrypt  = require("bcryptjs");

// ── GET doctor by email ───────────────────────────────────────────────────────
router.get("/doctor", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const doctor = await Doctor.findOne({ where: { email } });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    // Never send password hash to frontend
    const { password: _, ...safe } = doctor.toJSON();
    res.json(safe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── PUT update profile (name, email, specialization, avatar) ─────────────────
router.put("/doctor", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const { name, email: newEmail, specialization, avatar } = req.body;

    // Avatar size guard: base64 of 1 MB ≈ ~1.37 MB string → cap at 1.5 MB chars
    if (avatar && avatar.length > 1_500_000) {
      return res.status(400).json({ error: "Profile photo must be under 1 MB." });
    }

    const updatePayload = {};
    if (name)           updatePayload.name           = name;
    if (newEmail)       updatePayload.email           = newEmail;
    if (specialization) updatePayload.specialization  = specialization;
    if (avatar !== undefined) updatePayload.avatar    = avatar; // allow null to clear

    await Doctor.update(updatePayload, { where: { email } });

    const updatedDoctor = await Doctor.findOne({ where: { email: newEmail || email } });
    if (!updatedDoctor) return res.status(404).json({ error: "Doctor not found" });

    const { password: _, ...safe } = updatedDoctor.toJSON();
    res.json(safe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update doctor" });
  }
});

// ── PATCH change password ─────────────────────────────────────────────────────
router.patch("/doctor/change-password", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: "Both current and new password are required." });
    if (newPassword.length < 6)
      return res.status(400).json({ error: "New password must be at least 6 characters." });

    const doctor = await Doctor.findOne({ where: { email } });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const isMatch = await bcrypt.compare(currentPassword, doctor.password);
    if (!isMatch)
      return res.status(401).json({ error: "Current password is incorrect." });

    const hashed = await bcrypt.hash(newPassword, 10);
    await Doctor.update({ password: hashed }, { where: { email } });

    res.json({ message: "Password changed successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to change password." });
  }
});

module.exports = router;
