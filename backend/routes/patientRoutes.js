const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const PatientVisit = require("../models/PatientVisit");
const { Op } = require("sequelize");
const { sendReportEmail } = require("../services/emailService");

// ── GET all patients ──────────────────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const patients = await Patient.findAll({ order: [["createdAt", "DESC"]] });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch patients" });
  }
});

// ── GET appointments ──────────────────────────────────────────────────────────
router.get("/appointments", async (req, res) => {
  try {
    const patients = await Patient.findAll({
      where: { isOpd: "no" },
      order: [["createdAt", "DESC"]],
    });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch appointments" });
  }
});

// ── GET follow-ups ────────────────────────────────────────────────────────────
router.get("/followups", async (req, res) => {
  try {
    const patients = await Patient.findAll({
      where: { isFollowup: "yes" },
      order: [["followupDate", "ASC"]],
    });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch followups" });
  }
});

// ── GET OPD ───────────────────────────────────────────────────────────────────
router.get("/opd", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const visits = await PatientVisit.findAll({
      where: { visitDate: today, status: "completed" },
      include: [{ model: Patient, as: "patient" }],
      order: [["updatedAt", "DESC"]],
    });
    const patients = visits.map((v) => ({
      ...v.patient.toJSON(),
      visitId: v.id,
    }));
    res.json(patients);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch OPD" });
  }
});

// ── GET all visits history (all patients, all visits) ─────────────────────────
router.get("/history", async (req, res) => {
  try {
    const visits = await PatientVisit.findAll({
      include: [{ model: Patient, as: "patient" }],
      order: [
        ["visitDate", "DESC"],
        ["createdAt", "DESC"],
      ],
    });
    res.json(visits);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
});

// ── GET single patient ────────────────────────────────────────────────────────
router.get("/:id", async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch patient details" });
  }
});

// ── GET patient visits ────────────────────────────────────────────────────────
router.get("/:id/visits", async (req, res) => {
  try {
    const visits = await PatientVisit.findAll({
      where: { patientId: req.params.id },
      order: [["visitDate", "DESC"]],
    });
    res.json(visits);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch visit history" });
  }
});

// ── PUT update patient ────────────────────────────────────────────────────────
router.put("/:id", async (req, res) => {
  try {
    await Patient.update(req.body, { where: { id: req.params.id } });
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: "Failed to update patient" });
  }
});

// ── PATCH mark isAppointed ────────────────────────────────────────────────────
router.patch("/:id/appointed", async (req, res) => {
  const { isAppointed } = req.body;
  try {
    await Patient.update({ isAppointed }, { where: { id: req.params.id } });
    if (isAppointed === "yes") {
      const today = new Date().toISOString().slice(0, 10);
      await PatientVisit.findOrCreate({
        where: {
          patientId: req.params.id,
          visitDate: today,
          visitType: "appointment",
        },
        defaults: { status: "pending" },
      });
    }
    const patient = await Patient.findByPk(req.params.id);
    res.json(patient);
  } catch (err) {
    res.status(500).json({ error: "Failed to update appointment status" });
  }
});

// ── PATCH cancel appointment ──────────────────────────────────────────────────
router.patch("/:id/cancel-appointment", async (req, res) => {
  try {
    await PatientVisit.update(
      { status: "missed" },
      {
        where: {
          patientId: req.params.id,
          visitType: "appointment",
          status: "pending",
        },
      },
    );
    await Patient.update(
      { isAppointed: "no" },
      { where: { id: req.params.id } },
    );
    const patient = await Patient.findByPk(req.params.id);
    res.json({ patient, message: "Appointment cancelled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to cancel appointment" });
  }
});

// ── PATCH cancel follow-up ────────────────────────────────────────────────────
router.patch("/:id/cancel-followup", async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    if (patient.followupDate) {
      await PatientVisit.update(
        { status: "missed" },
        {
          where: {
            patientId: req.params.id,
            visitType: "followup",
            visitDate: patient.followupDate,
            status: "pending",
          },
        },
      );
    }

    await Patient.update(
      { isFollowup: "no", followupDuration: "No", followupDate: null },
      { where: { id: req.params.id } },
    );

    const updated = await Patient.findByPk(req.params.id);
    res.json({ patient: updated, message: "Follow-up cancelled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to cancel follow-up" });
  }
});

// ── PATCH cancel a specific visit by visitId ──────────────────────────────────
router.patch("/visits/:visitId/cancel", async (req, res) => {
  try {
    const visit = await PatientVisit.findByPk(req.params.visitId);
    if (!visit) return res.status(404).json({ error: "Visit not found" });
    if (visit.status === "completed")
      return res.status(400).json({ error: "Cannot cancel a completed visit" });

    await visit.update({ status: "missed" });

    if (visit.visitType === "followup") {
      await Patient.update(
        { isFollowup: "no", followupDuration: "No", followupDate: null },
        { where: { id: visit.patientId } },
      );
    }
    if (visit.visitType === "appointment") {
      await Patient.update(
        { isAppointed: "no" },
        { where: { id: visit.patientId } },
      );
    }

    res.json({ visit, message: "Visit cancelled successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to cancel visit" });
  }
});

// ── DELETE a specific visit record (appointment only, not patient) ────────────
router.delete("/visits/:visitId", async (req, res) => {
  try {
    const visit = await PatientVisit.findByPk(req.params.visitId);
    if (!visit) return res.status(404).json({ error: "Visit not found" });

    await visit.destroy();
    res.json({ message: "Visit record deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete visit record" });
  }
});

// ── PATCH export report ───────────────────────────────────────────────────────
router.patch("/:id/export", async (req, res) => {
  const { followupDuration, aiReport, treatmentApproved } = req.body;
  try {
    const isFollowup = followupDuration !== "No" ? "yes" : "no";
    let followupDate = null;
    if (followupDuration === "7 Days") {
      const d = new Date();
      d.setDate(d.getDate() + 7);
      followupDate = d.toISOString().slice(0, 10);
    } else if (followupDuration === "15 Days") {
      const d = new Date();
      d.setDate(d.getDate() + 15);
      followupDate = d.toISOString().slice(0, 10);
    }

    await Patient.update(
      {
        isOpd: "yes",
        isFollowup,
        followupDuration,
        followupDate,
        aiReport,
        treatmentApproved,
      },
      { where: { id: req.params.id } },
    );

    const today = new Date().toISOString().slice(0, 10);
    await PatientVisit.update(
      { status: "completed", report: aiReport },
      {
        where: {
          patientId: req.params.id,
          visitDate: today,
          visitType: "appointment",
        },
      },
    );

    if (followupDate) {
      await PatientVisit.findOrCreate({
        where: {
          patientId: req.params.id,
          visitDate: followupDate,
          visitType: "followup",
        },
        defaults: { status: "pending" },
      });
    }

    // Fetch updated patient and all visits for the email
    const patient = await Patient.findByPk(req.params.id);
    const visits = await PatientVisit.findAll({
      where: { patientId: req.params.id },
      order: [["visitDate", "DESC"]],
    });

    // Send email report — fire and forget (won't block the response if email fails)
    sendReportEmail(patient, visits).catch((err) =>
      console.error("❌ Email send failed:", err),
    );

    res.json(patient);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to export report" });
  }
});

module.exports = router;
