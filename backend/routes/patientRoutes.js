const express = require("express");
const router = express.Router();
const Patient = require("../models/Patient");
const PatientVisit = require("../models/PatientVisit");
const { Op } = require("sequelize");
const { sendReportEmail } = require("../services/emailService");
const authMiddleware = require("../middleware/authMiddleware");

// Apply auth to ALL routes in this router
router.use(authMiddleware);

// Whitelisted fields for basic patient edit
const BASIC_EDIT_FIELDS = ["name", "email", "age", "height", "weight", "contactNo"];
const HEALTH_EDIT_FIELDS = [
  "bodyBuild", "skinType", "digestion", "hungerPattern",
  "sleepPattern", "bowelMovements", "stressResponse", "energyLevel",
  "severity", "vikritiType",
];

// Followup duration map — data-driven
const FOLLOWUP_DAYS = { "7 Days": 7, "15 Days": 15, "1 Month": 30 };

// ─────────────────────────────────────────────────────────────────────────────
// VISIT ROUTES — must come BEFORE /:id routes to avoid param collision
// ─────────────────────────────────────────────────────────────────────────────

router.patch("/visits/:visitId/cancel", async (req, res) => {
  try {
    const visit = await PatientVisit.findByPk(req.params.visitId);
    if (!visit) return res.status(404).json({ error: "Visit not found" });
    if (visit.status === "completed")
      return res.status(400).json({ error: "Cannot cancel a completed visit" });
    await visit.update({ status: "missed" });
    if (visit.visitType === "followup")
      await Patient.update({ isFollowup: "no", followupDuration: "No", followupDate: null }, { where: { id: visit.patientId } });
    if (visit.visitType === "appointment")
      await Patient.update({ isAppointed: "no" }, { where: { id: visit.patientId } });
    res.json({ visit, message: "Visit cancelled successfully" });
  } catch (err) { console.error(err); res.status(500).json({ error: "Failed to cancel visit" }); }
});

router.delete("/visits", async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.length === 0)
      return res.status(400).json({ error: "No visit IDs provided" });
    const count = await PatientVisit.destroy({ where: { id: ids } });
    res.json({ message: `${count} visit record(s) deleted successfully`, count });
  } catch (err) { console.error(err); res.status(500).json({ error: "Failed to bulk delete visits" }); }
});

router.delete("/visits/:visitId", async (req, res) => {
  try {
    const visit = await PatientVisit.findByPk(req.params.visitId);
    if (!visit) return res.status(404).json({ error: "Visit not found" });
    await visit.destroy();
    res.json({ message: "Visit record deleted successfully" });
  } catch (err) { console.error(err); res.status(500).json({ error: "Failed to delete visit record" }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// PATIENT LIST ROUTES
// ─────────────────────────────────────────────────────────────────────────────

router.get("/", async (req, res) => {
  try {
    const patients = await Patient.findAll({ where: { doctorId: req.doctorId }, order: [["createdAt", "DESC"]] });
    res.json(patients);
  } catch (err) { res.status(500).json({ error: "Failed to fetch patients" }); }
});

router.get("/appointments", async (req, res) => {
  try {
    const patients = await Patient.findAll({ where: { isOpd: "no", doctorId: req.doctorId }, order: [["createdAt", "DESC"]] });
    res.json(patients);
  } catch (err) { res.status(500).json({ error: "Failed to fetch appointments" }); }
});

router.get("/followups", async (req, res) => {
  try {
    const patients = await Patient.findAll({ where: { isFollowup: "yes", doctorId: req.doctorId }, order: [["followupDate", "ASC"]] });
    res.json(patients);
  } catch (err) { res.status(500).json({ error: "Failed to fetch followups" }); }
});

router.get("/opd", async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const visits = await PatientVisit.findAll({
      where: { visitDate: today, status: "completed" },
      include: [{ model: Patient, as: "patient", where: { doctorId: req.doctorId } }],
      order: [["updatedAt", "DESC"]],
    });
    const patients = visits.map((v) => ({ ...v.patient.toJSON(), visitId: v.id }));
    res.json(patients);
  } catch (err) { res.status(500).json({ error: "Failed to fetch OPD" }); }
});

router.get("/history", async (req, res) => {
  try {
    const visits = await PatientVisit.findAll({
      include: [{ model: Patient, as: "patient", where: { doctorId: req.doctorId } }],
      order: [["visitDate", "DESC"], ["createdAt", "DESC"]],
    });
    res.json(visits);
  } catch (err) { console.error(err); res.status(500).json({ error: "Failed to fetch history" }); }
});

// ─────────────────────────────────────────────────────────────────────────────
// SINGLE PATIENT ROUTES (/:id — keep these LAST)
// ─────────────────────────────────────────────────────────────────────────────

router.get("/:id", async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err) { res.status(500).json({ error: "Failed to fetch patient details" }); }
});

router.get("/:id/visits", async (req, res) => {
  try {
    const visits = await PatientVisit.findAll({
      where: { patientId: req.params.id },
      order: [["visitDate", "DESC"]],
    });
    res.json(visits);
  } catch (err) { res.status(500).json({ error: "Failed to fetch visit history" }); }
});

router.put("/:id", async (req, res) => {
  try {
    const updates = {};
    BASIC_EDIT_FIELDS.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    if (Object.keys(updates).length === 0)
      return res.status(400).json({ error: "No valid fields to update" });
    await Patient.update(updates, { where: { id: req.params.id } });
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err) { res.status(500).json({ error: "Failed to update patient" }); }
});

router.put("/:id/health", async (req, res) => {
  try {
    const updates = {};
    HEALTH_EDIT_FIELDS.forEach((f) => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    if (Object.keys(updates).length === 0)
      return res.status(400).json({ error: "No valid health fields to update" });
    await Patient.update(updates, { where: { id: req.params.id } });
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    res.json(patient);
  } catch (err) { res.status(500).json({ error: "Failed to update health details" }); }
});

router.patch("/:id/appointed", async (req, res) => {
  const { isAppointed } = req.body;
  try {
    await Patient.update({ isAppointed }, { where: { id: req.params.id } });
    if (isAppointed === "yes") {
      const today = new Date().toISOString().slice(0, 10);
      await PatientVisit.findOrCreate({
        where: { patientId: req.params.id, visitDate: today, visitType: "appointment" },
        defaults: { status: "pending" },
      });
    }
    const patient = await Patient.findByPk(req.params.id);
    res.json(patient);
  } catch (err) { res.status(500).json({ error: "Failed to update appointment status" }); }
});

router.patch("/:id/cancel-appointment", async (req, res) => {
  try {
    await PatientVisit.update(
      { status: "missed" },
      { where: { patientId: req.params.id, visitType: "appointment", status: "pending" } },
    );
    await Patient.update({ isAppointed: "no" }, { where: { id: req.params.id } });
    const patient = await Patient.findByPk(req.params.id);
    res.json({ patient, message: "Appointment cancelled successfully" });
  } catch (err) { console.error(err); res.status(500).json({ error: "Failed to cancel appointment" }); }
});

router.patch("/:id/cancel-followup", async (req, res) => {
  try {
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });
    if (patient.followupDate) {
      await PatientVisit.update(
        { status: "missed" },
        { where: { patientId: req.params.id, visitType: "followup", visitDate: patient.followupDate, status: "pending" } },
      );
    }
    await Patient.update(
      { isFollowup: "no", followupDuration: "No", followupDate: null },
      { where: { id: req.params.id } },
    );
    const updated = await Patient.findByPk(req.params.id);
    res.json({ patient: updated, message: "Follow-up cancelled successfully" });
  } catch (err) { console.error(err); res.status(500).json({ error: "Failed to cancel follow-up" }); }
});

router.patch("/:id/followup-date", async (req, res) => {
  try {
    const { followupDate } = req.body;
    if (!followupDate) return res.status(400).json({ error: "followupDate is required" });
    const patient = await Patient.findByPk(req.params.id);
    if (!patient) return res.status(404).json({ error: "Patient not found" });

    if (patient.followupDate) {
      await PatientVisit.update(
        { visitDate: followupDate },
        { where: { patientId: req.params.id, visitType: "followup", visitDate: patient.followupDate, status: "pending" } }
      );
    } else {
      await PatientVisit.findOrCreate({
        where: { patientId: req.params.id, visitType: "followup", visitDate: followupDate },
        defaults: { status: "pending" },
      });
    }
    await Patient.update({ followupDate, isFollowup: "yes" }, { where: { id: req.params.id } });
    const updated = await Patient.findByPk(req.params.id);
    res.json(updated);
  } catch (err) { console.error(err); res.status(500).json({ error: "Failed to update followup date" }); }
});

router.patch("/:id/export", async (req, res) => {
  const { followupDuration, aiReport, treatmentApproved, customFollowupDate } = req.body;
  try {
    const isFollowup = followupDuration !== "No" ? "yes" : "no";
    let followupDate = null;

    if (followupDuration === "Custom Date" && customFollowupDate) {
      followupDate = customFollowupDate;
    } else if (followupDuration && FOLLOWUP_DAYS[followupDuration]) {
      const d = new Date();
      d.setDate(d.getDate() + FOLLOWUP_DAYS[followupDuration]);
      followupDate = d.toISOString().slice(0, 10);
    }

    if (isFollowup === "yes" && !followupDate)
      return res.status(400).json({ error: `Unknown followup duration: ${followupDuration}` });

    const durationLabel = followupDuration === "Custom Date" ? `Custom: ${followupDate}` : followupDuration;

    await Patient.update(
      { isOpd: "yes", isFollowup, followupDuration: durationLabel, followupDate, aiReport, treatmentApproved },
      { where: { id: req.params.id } },
    );
    const today = new Date().toISOString().slice(0, 10);
    await PatientVisit.update(
      { status: "completed", report: aiReport },
      { where: { patientId: req.params.id, visitDate: today, visitType: "appointment" } },
    );
    if (followupDate) {
      await PatientVisit.findOrCreate({
        where: { patientId: req.params.id, visitDate: followupDate, visitType: "followup" },
        defaults: { status: "pending" },
      });
    }
    const patient = await Patient.findByPk(req.params.id);
    const visits = await PatientVisit.findAll({
      where: { patientId: req.params.id },
      order: [["visitDate", "DESC"]],
    });
    sendReportEmail(patient, visits).catch((err) => console.error("Email send failed:", err));
    res.json(patient);
  } catch (err) { console.error(err); res.status(500).json({ error: "Failed to export report" }); }
});

module.exports = router;
