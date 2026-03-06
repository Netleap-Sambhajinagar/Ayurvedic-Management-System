// routes/authRoutes.js
const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register Doctor
router.post("/register", async (req, res) => {
  try {
    const { name, email, specialization, password } = req.body;

    // 1️⃣ Check all fields
    if (!name || !email || !specialization || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // 2️⃣ Check if email already exists
    const existing = await Doctor.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // 3️⃣ Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4️⃣ Create Doctor
    const doctor = new Doctor({
      name,
      email,
      specialization,
      password: hashedPassword,
    });

    await doctor.save();

    res.status(201).json({ message: "Doctor registered successfully" });
  } catch (error) {
    console.error("Register Error:", error); // <-- Very important for debugging
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

module.exports = router;

// ================= LOGIN =================
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // 0️⃣ Validate request
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // 1️⃣ Find doctor
    const doctor = await Doctor.findOne({ email });
    if (!doctor)
      return res.status(400).json({ message: "Invalid email or password" });

    // 2️⃣ Check password
    const isMatch = await bcrypt.compare(password, doctor.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid email or password" });

    // 3️⃣ Generate JWT
    const token = jwt.sign({ id: doctor._id }, process.env.JWT_SECRET, {
      expiresIn: "1d",
    });

    // 4️⃣ Return token + doctor info
    res.json({
      token,
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        specialization: doctor.specialization,
      },
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
});

module.exports = router;
