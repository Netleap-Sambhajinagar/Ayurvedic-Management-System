const express = require("express");
const router  = express.Router();
const Doctor  = require("../models/Doctor");
const bcrypt  = require("bcryptjs");
const authMiddleware = require("../middleware/authMiddleware");

// Apply auth to ALL routes
router.use(authMiddleware);

// ── GET doctor by email ───────────────────────────────────────────────────────
router.get("/doctor", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required" });
    const doctor = await Doctor.findOne({ where: { email } });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });
    const { password: _, ...safe } = doctor.toJSON();
    res.json(safe);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ── PUT update profile — only allows own profile (ownership check via JWT) ────
router.put("/doctor", async (req, res) => {
  try {
    // Use doctorId from JWT (set by authMiddleware) to look up the real email
    const currentDoctor = await Doctor.findByPk(req.doctorId);
    if (!currentDoctor) return res.status(404).json({ error: "Doctor not found" });

    const currentEmail = currentDoctor.email;
    const { name, email: newEmail, specialization, avatar } = req.body;

    // Avatar size guard: base64 of 1 MB ≈ ~1.37 MB string → cap at 1.5 MB chars
    if (avatar && avatar.length > 1_500_000) {
      return res.status(400).json({ error: "Profile photo must be under 1 MB." });
    }

    const updatePayload = {};
    if (name)           updatePayload.name           = name;
    if (newEmail)       updatePayload.email           = newEmail;
    if (specialization) updatePayload.specialization  = specialization;
    if (avatar !== undefined) updatePayload.avatar    = avatar;

    await Doctor.update(updatePayload, { where: { email: currentEmail } });

    const updatedDoctor = await Doctor.findOne({ where: { email: newEmail || currentEmail } });
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
    const doctor = await Doctor.findByPk(req.doctorId);
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ error: "Both current and new password are required." });
    if (newPassword.length < 6)
      return res.status(400).json({ error: "New password must be at least 6 characters." });

    const isMatch = await bcrypt.compare(currentPassword, doctor.password);
    if (!isMatch)
      return res.status(401).json({ error: "Current password is incorrect." });

    const hashed = await bcrypt.hash(newPassword, 10);
    await Doctor.update({ password: hashed }, { where: { id: req.doctorId } });

    res.json({ message: "Password changed successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to change password." });
  }
});

module.exports = router;
