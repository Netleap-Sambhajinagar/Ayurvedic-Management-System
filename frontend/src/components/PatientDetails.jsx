import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import Toast from "./Toast";
import { PATIENTS_API } from "../config";

// ── Enum options (must match Sequelize model) ─────────────────────────────────
const ENUM_OPTS = {
  bodyBuild:      ["Thin, difficulty gaining weight", "Medium build, muscular", "Broad, easily gains weight"],
  skinType:       ["Dry, rough, cold", "Warm, sensitive, prone to redness/acne", "Soft, thick, oily"],
  digestion:      ["Irregular, bloating/gas common", "Strong but prone to acidity", "Slow, heavy after meals"],
  hungerPattern:  ["Variable, sometimes forget to eat", "Strong and sharp, get irritated if hungry", "Mild and stable"],
  sleepPattern:   ["Light, easily disturbed", "Moderate, may wake once", "Deep and long"],
  bowelMovements: ["Dry, hard, constipated", "Loose or frequent", "Regular but slow"],
  stressResponse: ["Feel anxious or fearful", "Become irritable or angry", "Withdraw or feel dull"],
  energyLevel:    ["Fluctuating, comes in bursts", "Strong but can burn out", "Stable but slow"],
  severity:       ["Sthula", "Madhyama", "Sukshma"],
};

const HEALTH_FIELDS = [
  { label: "Body Build",      key: "bodyBuild" },
  { label: "Skin Type",       key: "skinType" },
  { label: "Digestion",       key: "digestion" },
  { label: "Hunger Pattern",  key: "hungerPattern" },
  { label: "Sleep Pattern",   key: "sleepPattern" },
  { label: "Bowel Movements", key: "bowelMovements" },
  { label: "Stress Response", key: "stressResponse" },
  { label: "Energy Level",    key: "energyLevel" },
];

const Badge = ({ label, color = "green" }) => {
  const map = {
    green: "bg-green-100 text-green-700",
    amber: "bg-amber-100 text-amber-700",
    gray:  "bg-gray-100 text-gray-500",
    red:   "bg-red-100 text-red-600",
  };
  return <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${map[color]}`}>{label}</span>;
};

// ── Visit History Row ─────────────────────────────────────────────────────────
const VisitRow = ({ visit, index, onCancel }) => {
  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";
  const typeColors   = { appointment: "green", followup: "amber", opd: "gray" };
  const statusColors = { completed: "green", pending: "amber", missed: "red" };
  const canCancel    = visit.status === "pending";
  return (
    <tr className="border-b border-gray-50 hover:bg-gray-50 transition">
      <td className="py-2.5 px-4 text-xs text-gray-400">{index + 1}</td>
      <td className="py-2.5 px-4"><Badge label={visit.visitType} color={typeColors[visit.visitType] || "gray"} /></td>
      <td className="py-2.5 px-4 text-sm text-gray-700">{fmt(visit.visitDate)}</td>
      <td className="py-2.5 px-4"><Badge label={visit.status} color={statusColors[visit.status] || "gray"} /></td>
      <td className="py-2.5 px-4 text-xs text-gray-500 max-w-[160px] truncate">{visit.report || visit.notes || "—"}</td>
      <td className="py-2.5 px-4">
        {canCancel && (
          <button onClick={() => onCancel(visit)}
            className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition font-medium border border-red-100">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
            Cancel
          </button>
        )}
      </td>
    </tr>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const PatientDetails = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [patientData,   setPatientData]   = useState(null);
  const [visits,        setVisits]        = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [toast,         setToast]         = useState(null);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editSection,   setEditSection]   = useState("basic");
  const [editForm,      setEditForm]      = useState({});
  const [saving,        setSaving]        = useState(false);

  // Cancel visit
  const [cancelVisit,   setCancelVisit]   = useState(null);
  const [cancellingV,   setCancellingV]   = useState(false);

  // Report section
  const [approved,      setApproved]      = useState(true);
  const [modifyMode,    setModifyMode]     = useState(false);
  const [reportText,    setReportText]     = useState("");
  const [followUp,      setFollowUp]       = useState("No");
  const [exporting,     setExporting]      = useState(false);
  const [exported,      setExported]       = useState(false);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  // ── Fetch ─────────────────────────────────────────────────────────────────
  const fetchPatient = useCallback(async () => {
    try {
      const res = await axios.get(`${PATIENTS_API}/${id}`);
      setPatientData(res.data);
      setReportText(
        res.data.aiReport ||
          "The patient's vital signs are within normal limits. Body temperature and blood pressure are stable. Sleep duration is adequate, and digestion appears normal. No critical concerns detected at this time. Routine monitoring and healthy lifestyle maintenance are recommended.",
      );
      setFollowUp(res.data.followupDuration || "No");
      setApproved(res.data.treatmentApproved ?? true);
    } catch (err) {
      console.error("Failed to load patient", err);
    }
  }, [id]);

  const fetchVisits = useCallback(async () => {
    try {
      const res = await axios.get(`${PATIENTS_API}/${id}/visits`);
      setVisits(res.data);
    } catch (err) {
      console.error("Failed to load visits", err);
    }
  }, [id]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchPatient(), fetchVisits()]);
      setLoading(false);
    };
    init();
  }, [fetchPatient, fetchVisits]);

  // ── Edit modal ────────────────────────────────────────────────────────────
  const openEditModal = (section) => {
    setEditSection(section);
    setEditForm({ ...patientData });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put(`${PATIENTS_API}/${id}`, editForm);
      setPatientData(res.data);
      setShowEditModal(false);
      showToast("Patient details updated successfully.");
    } catch (err) {
      showToast(err?.response?.data?.error || "Failed to save changes.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Cancel a single visit ─────────────────────────────────────────────────
  const handleCancelVisit = async () => {
    if (!cancelVisit) return;
    setCancellingV(true);
    try {
      await axios.patch(`${PATIENTS_API}/visits/${cancelVisit.id}/cancel`);
      setCancelVisit(null);
      showToast("Visit cancelled successfully.");
      await Promise.all([fetchPatient(), fetchVisits()]);
    } catch (err) {
      showToast(err?.response?.data?.error || "Failed to cancel visit.", "error");
    } finally {
      setCancellingV(false);
    }
  };

  // ── Export report ─────────────────────────────────────────────────────────
  const handleExport = async () => {
    setExporting(true);
    try {
      const res = await axios.patch(`${PATIENTS_API}/${id}/export`, {
        followupDuration: followUp,
        aiReport: reportText,
        treatmentApproved: approved,
      });
      setPatientData(res.data);
      setExported(true);
      showToast("Report exported successfully.");
      await fetchVisits();
      setTimeout(() => setExported(false), 2500);
    } catch (err) {
      showToast(err?.response?.data?.error || "Failed to export report.", "error");
    } finally {
      setExporting(false);
    }
  };

  // ── Guards ────────────────────────────────────────────────────────────────
  if (loading) return <div className="p-8 text-center text-gray-400">Loading patient details…</div>;
  if (!patientData) return <div className="p-8 text-center text-red-500">Patient not found.</div>;

  const p   = patientData;
  const fmt = (d) => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  return (
    <div className="flex-1 min-h-screen bg-gray-50" style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
      <Toast toast={toast} />

      {/* Top Nav */}
      <div className="bg-white px-4 sm:px-8 py-3 flex items-center justify-between border-b border-gray-100 flex-wrap gap-2">
        <nav className="flex items-center gap-1 text-sm text-gray-500">
          <span className="cursor-pointer hover:text-green-600 transition" onClick={() => navigate("/patient")}>Patients</span>
          <span className="text-gray-300 mx-1">›</span>
          <span className="cursor-pointer hover:text-green-600 transition" onClick={() => navigate("/appointment")}>Appointments</span>
          <span className="text-gray-300 mx-1">›</span>
          <span className="font-semibold text-gray-800">{p.name}</span>
        </nav>
        <div className="flex items-center gap-2 flex-wrap">
          {p.isAppointed === "yes" && <Badge label="Appointed"                          color="green" />}
          {p.isOpd       === "yes" && <Badge label="OPD Done"                           color="green" />}
          {p.isFollowup  === "yes" && <Badge label={`Follow-up: ${fmt(p.followupDate)}`} color="amber" />}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* ── Patient Overview ─────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">Patient Overview</h2>
            <button onClick={() => openEditModal("basic")}
              className="flex items-center gap-1.5 text-xs font-medium text-green-600 border border-green-200 rounded-full px-3 py-1 bg-green-50 hover:bg-green-100 transition">
              Edit Basic Info
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            <div className="flex flex-col sm:flex-row">
              <div className="flex items-start gap-4 p-5 sm:w-56">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-300 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shrink-0 uppercase">
                  {p.name?.charAt(0) || "?"}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">{p.email}</p>
                  {p.vikritiType && <Badge label={`Dosha: ${p.vikritiType}`} color="green" />}
                  {p.severity    && <span className="text-xs text-gray-400 ml-1">{p.severity}</span>}
                </div>
              </div>
              <div className="flex flex-wrap flex-1">
                {[
                  { label: "Age",        value: `${p.age} yrs` },
                  { label: "Height",     value: `${p.height} cm` },
                  { label: "Weight",     value: `${p.weight} kg` },
                  { label: "Contact",    value: p.contactNo },
                  { label: "Registered", value: fmt(p.createdAt) },
                ].map((item) => (
                  <div key={item.label} className="flex flex-col justify-center px-5 py-4 min-w-[90px]">
                    <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                    <p className="font-semibold text-gray-800 text-sm">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── Health Details ───────────────────────────────────────────────── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-bold text-gray-800">Health Details</h2>
            <button onClick={() => openEditModal("health")}
              className="flex items-center gap-1.5 text-xs font-medium text-green-600 border border-green-200 rounded-full px-3 py-1 bg-green-50 hover:bg-green-100 transition">
              Edit Health Info
            </button>
          </div>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {HEALTH_FIELDS.map(({ label, key }) => (
                <div key={key} className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 hover:border-green-200 hover:bg-green-50 transition-all">
                  <p className="text-xs text-gray-400 mb-1">{label}</p>
                  <p className="font-semibold text-gray-800 text-sm">{p[key] || "N/A"}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Visit History ────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-3">Visit History</h2>
          <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
            {visits.length === 0 ? (
              <div className="p-8 text-center text-gray-400 text-sm">No visits recorded yet.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      {["#", "Type", "Date", "Status", "Notes", ""].map((h) => (
                        <th key={h} className="py-3 px-4 text-xs text-gray-500 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visits.map((v, i) => (
                      <VisitRow key={v.id} visit={v} index={i} onCancel={(visit) => setCancelVisit(visit)} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* ── Generated Report ─────────────────────────────────────────────── */}
        <section>
          <h2 className="text-lg font-bold text-gray-800 mb-1">Generated Report</h2>
          <p className="text-xs text-gray-400 mb-3">AI-generated based on patient vitals and dosha analysis.</p>
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5 shadow-sm">
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
              {modifyMode ? (
                <textarea value={reportText} onChange={(e) => setReportText(e.target.value)} rows={6}
                  className="w-full text-sm text-gray-700 leading-relaxed bg-transparent outline-none resize-none"
                  placeholder="Edit AI-generated report here…" />
              ) : (
                <p className="text-sm text-gray-600 leading-relaxed">{reportText}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex flex-col gap-3 flex-1">
                <div className="flex items-center gap-6">
                  <button onClick={() => { setApproved(true); setModifyMode(false); }}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${approved ? "text-green-600" : "text-gray-400 hover:text-gray-600"}`}>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${approved ? "border-green-500 bg-green-500" : "border-gray-300"}`}>
                      {approved && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>}
                    </span>
                    Approve Treatment
                  </button>
                  <button onClick={() => { setApproved(false); setModifyMode(true); }}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${!approved ? "text-amber-500" : "text-gray-400 hover:text-gray-600"}`}>
                    <span className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${!approved ? "border-amber-400 bg-amber-400" : "border-gray-300"}`}>
                      {!approved && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536M9 13l6-6" /></svg>}
                    </span>
                    Modify Treatment
                  </button>
                </div>
                {modifyMode && (
                  <p className="text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                    Editing report above. Changes will be saved when you click <strong>Export Report</strong>.
                  </p>
                )}
                <div className="inline-flex flex-col bg-white rounded-xl border border-gray-200 px-4 py-3 w-fit shadow-sm">
                  <p className="text-xs font-semibold text-gray-600 mb-2">Follow up?</p>
                  <div className="flex gap-3">
                    {["No", "7 Days", "15 Days"].map((opt) => (
                      <label key={opt} className="flex items-center gap-1.5 cursor-pointer group">
                        <span onClick={() => setFollowUp(opt)}
                          className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-all cursor-pointer ${followUp === opt ? "border-green-500 bg-green-500" : "border-gray-300 group-hover:border-green-300"}`} />
                        <span onClick={() => setFollowUp(opt)}
                          className={`text-xs transition-colors ${followUp === opt ? "text-gray-800 font-medium" : "text-gray-500"}`}>
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <button onClick={handleExport} disabled={exporting}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  exported ? "bg-green-600 text-white scale-95" : "bg-green-500 hover:bg-green-600 text-white"
                } disabled:opacity-60`}>
                {exported ? (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg> Exported!</>
                ) : exporting ? "Saving…" : (
                  <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 8l-3-3m3 3l3-3" /></svg> Export Report</>
                )}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* ── Edit Modal ─────────────────────────────────────────────────────── */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="text-lg font-bold text-gray-800">
                {editSection === "basic" ? "Edit Basic Info" : "Edit Health Details"}
              </h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              {editSection === "basic" ? (
                [
                  { label: "Full Name",        key: "name",      type: "text" },
                  { label: "Email",            key: "email",     type: "email" },
                  { label: "Age",              key: "age",       type: "number" },
                  { label: "Height (cm)",      key: "height",    type: "number" },
                  { label: "Weight (kg)",      key: "weight",    type: "number" },
                  { label: "Contact Number",   key: "contactNo", type: "text" },
                ].map(({ label, key, type }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
                    <input type={type} value={editForm[key] || ""}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, [key]: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition" />
                  </div>
                ))
              ) : (
                <>
                  {HEALTH_FIELDS.map(({ label, key }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
                      <select value={editForm[key] || ""}
                        onChange={(e) => setEditForm((prev) => ({ ...prev, [key]: e.target.value }))}
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-green-400 transition bg-white">
                        {ENUM_OPTS[key]?.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                  ))}
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Severity</label>
                    <select value={editForm.severity || ""}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, severity: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-green-400 bg-white">
                      <option value="">— Select —</option>
                      {ENUM_OPTS.severity.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">Vikriti Type (Dosha)</label>
                    <input type="text" placeholder="e.g. Vata, Pitta, Kapha" value={editForm.vikritiType || ""}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, vikritiType: e.target.value }))}
                      className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 outline-none focus:border-green-400 transition" />
                  </div>
                </>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowEditModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                  Cancel
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60">
                  {saving ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Cancel Visit Modal ───────────────────────────────────────────── */}
      {cancelVisit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-800 capitalize">Cancel {cancelVisit.visitType}?</h3>
                <p className="text-xs text-gray-500 mt-0.5">This will mark the visit as missed.</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Are you sure you want to cancel the{" "}
              <span className="font-semibold text-gray-800 capitalize">{cancelVisit.visitType}</span>{" "}
              scheduled on{" "}
              <span className="font-semibold text-gray-800">
                {new Date(cancelVisit.visitDate).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
              </span>?
              {cancelVisit.visitType === "followup" && (
                <span className="block mt-1 text-amber-600 text-xs">The follow-up will also be removed from the patient record.</span>
              )}
            </p>
            <div className="flex gap-3">
              <button onClick={() => setCancelVisit(null)}
                className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition">
                Keep it
              </button>
              <button onClick={handleCancelVisit} disabled={cancellingV}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60">
                {cancellingV ? "Cancelling…" : "Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetails;
