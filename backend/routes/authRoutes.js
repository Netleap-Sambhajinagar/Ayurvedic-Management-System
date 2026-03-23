const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { sendPasswordResetEmail } = require("../services/emailService");

// ── REGISTER ──────────────────────────────────────────────────────────────────
router.post("/register", async (req, res) => {
  try {
    const { name, email, specialization, password } = req.body;
    if (!name || !email || !specialization || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existing = await Doctor.findOne({ where: { email } });
    if (existing)
      return res.status(400).json({ message: "Email already registered" });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    await Doctor.create({ name, email, specialization, password: hashedPassword });
    res.status(201).json({ message: "Doctor registered successfully" });
  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// ── LOGIN ─────────────────────────────────────────────────────────────────────
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const doctor = await Doctor.findOne({ where: { email } });
    if (!doctor)
      return res.status(400).json({ message: "Invalid email or password" });

    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    const token = jwt.sign({ id: doctor.id }, process.env.JWT_SECRET, { expiresIn: "1d" });
    res.json({
      token,
      doctor: { id: doctor.id, name: doctor.name, email: doctor.email, specialization: doctor.specialization },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

// ── FORGOT PASSWORD — sends a reset link to the doctor's email ────────────────
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    const doctor = await Doctor.findOne({ where: { email } });
    // Always return success to prevent email enumeration attacks
    if (!doctor) return res.json({ message: "If that email exists, a reset link has been sent." });

    // Short-lived reset token (15 min)
    const resetToken = jwt.sign({ id: doctor.id, purpose: "reset" }, process.env.JWT_SECRET, { expiresIn: "15m" });
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    await sendPasswordResetEmail(doctor, resetLink);
    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// ── RESET PASSWORD — verifies token and sets new password ─────────────────────
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword)
      return res.status(400).json({ message: "Token and new password are required" });
    if (newPassword.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters" });

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
      return res.status(400).json({ message: "Reset link is invalid or has expired" });
    }

    if (decoded.purpose !== "reset")
      return res.status(400).json({ message: "Invalid reset token" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await Doctor.update({ password: hashed }, { where: { id: decoded.id } });
    res.json({ message: "Password reset successfully. You can now log in." });
  } catch (err) {
    console.error("Reset password error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
