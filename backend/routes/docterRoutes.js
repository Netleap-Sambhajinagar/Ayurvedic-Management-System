// const express = require("express");
// const router = express.Router();
// const Doctor = require("../models/Doctor");

// // GET doctor by ID
// router.get("/doctor/:id", async (req, res) => {
//   try {
//     const doctor = await Doctor.findById(req.params.id);
//     if (!doctor) return res.status(404).json({ error: "Doctor not found" });
//     res.json(doctor);
//   } catch (err) {
//     res.status(500).json({ error: "Server error" });
//   }
// });

// // PUT doctor by ID
// router.put("/doctor/:id", async (req, res) => {
//   try {
//     const updatedDoctor = await Doctor.findByIdAndUpdate(
//       req.params.id,
//       req.body,
//       { new: true },
//     );
//     res.json(updatedDoctor);
//   } catch (err) {
//     res.status(500).json({ error: "Failed to update doctor" });
//   }
// });

// module.exports = router;

const express = require("express");
const router = express.Router();
const Doctor = require("../models/Doctor");

// GET doctor by email
router.get("/doctor", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const doctor = await Doctor.findOne({ where: { email } });
    if (!doctor) return res.status(404).json({ error: "Doctor not found" });

    res.json(doctor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// PUT doctor by email
router.put("/doctor", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: "Email is required" });

    await Doctor.update(req.body, { where: { email } });
    const updatedDoctor = await Doctor.findOne({ where: { email } });

    if (!updatedDoctor)
      return res.status(404).json({ error: "Doctor not found" });

    res.json(updatedDoctor);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update doctor" });
  }
});

module.exports = router;
