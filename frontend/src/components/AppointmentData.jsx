import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Toast from "./Toast";
import { PATIENTS_API } from "../config";

const Badge = ({ label, color = "green" }) => {
  const styles = {
    green:  { background: "rgba(39,103,73,.1)",  color: "var(--fern)" },
    red:    { background: "rgba(139,42,42,.1)",   color: "#b94040" },
    gray:   { background: "rgba(107,126,114,.1)", color: "var(--mist)" },
    amber:  { background: "rgba(193,105,79,.1)",  color: "var(--terracotta)" },
  };
  return <span className="badge" style={styles[color] || styles.gray}>{label}</span>;
};

const CancelModal = ({ patient, type, onConfirm, onClose, loading }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="card w-full max-w-sm p-6 anim-scale">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "rgba(193,105,79,.12)" }}>
          <svg className="w-5 h-5" style={{ color: "var(--terracotta)" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
          </svg>
        </div>
        <div>
          <h3 className="text-base font-semibold" style={{ fontFamily: "var(--font-serif)", color: "var(--forest)" }}>
            Cancel {type === "appointment" ? "Appointment" : "Follow-up"}?
          </h3>
          <p className="text-xs" style={{ color: "var(--mist)" }}>This action cannot be undone.</p>
        </div>
      </div>
      <p className="text-sm mb-5" style={{ color: "var(--mist)" }}>
        Cancel for <span className="font-semibold" style={{ color: "var(--ink)" }}>{patient?.name}</span>?
      </p>
      <div className="flex gap-3">
        <button onClick={onClose} className="btn-ghost flex-1 justify-center">Keep it</button>
        <button onClick={onConfirm} disabled={loading}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition"
          style={{ background: "linear-gradient(135deg,#8b2a2a,var(--terracotta))", opacity: loading ? .6 : 1 }}>
          {loading ? "Cancelling…" : "Yes, Cancel"}
        </button>
      </div>
    </div>
  </div>
);

const EditFollowupModal = ({ patient, onConfirm, onClose, loading }) => {
  const [newDate, setNewDate] = useState(patient?.followupDate || "");
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="card w-full max-w-sm p-6 anim-scale">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold" style={{ fontFamily: "var(--font-serif)", color: "var(--forest)" }}>
            Edit Follow-up Date
          </h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ color: "var(--mist)", background: "var(--parchment)" }}>✕</button>
        </div>
        <p className="text-sm mb-4" style={{ color: "var(--mist)" }}>
          Patient: <span className="font-semibold" style={{ color: "var(--ink)" }}>{patient?.name}</span>
        </p>
        <div className="mb-5">
          <label className="block text-xs font-medium mb-1.5 uppercase tracking-widest" style={{ color: "var(--mist)" }}>
            New Follow-up Date
          </label>
          <input
            type="date"
            value={newDate}
            min={new Date().toISOString().slice(0, 10)}
            onChange={e => setNewDate(e.target.value)}
            className="w-full rounded-xl px-3 py-2 text-sm outline-none"
            style={{ border: "1px solid rgba(39,103,73,.3)", background: "white", color: "var(--ink)", fontFamily: "var(--font-sans)" }}
          />
          <p className="text-xs mt-2 px-2 py-1.5 rounded-lg" style={{ color: "var(--terracotta)", background: "rgba(193,105,79,.06)", border: "1px solid rgba(193,105,79,.15)" }}>
            💡 After saving, go to patient details and export PDF to record the updated date.
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-ghost flex-1 justify-center">Cancel</button>
          <button
            onClick={() => onConfirm(newDate)}
            disabled={loading || !newDate}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition"
            style={{ background: "var(--fern)", opacity: (loading || !newDate) ? .6 : 1 }}>
            {loading ? "Saving…" : "Save Date"}
          </button>
        </div>
      </div>
    </div>
  );
};

const SectionTable = ({ title, patients, columns, emptyMsg, loading, currentViewType }) => {
  const navigate = useNavigate();
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-2xl" style={{ fontFamily: "var(--font-serif)", color: "var(--forest)" }}>{title}</h2>
        <span className="badge badge-gray">{loading ? "…" : `${patients.length} records`}</span>
      </div>
      <div className="card overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-sm" style={{ color: "var(--mist)" }}>Loading…</div>
        ) : patients.length === 0 ? (
          <div className="p-10 text-center">
            <p className="text-base" style={{ fontFamily: "var(--font-serif)", color: "var(--forest)" }}>{emptyMsg}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: "var(--parchment)", borderBottom: "1px solid var(--border)" }}>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--mist)" }}>#</th>
                  <th className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--mist)" }}>Patient</th>
                  {columns.map(c => (
                    <th key={c.key} className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--mist)" }}>{c.label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {patients.map((p, i) => (
                  <tr key={p.id} className="trow" style={{ borderBottom: "1px solid rgba(39,103,73,.05)" }}>
                    <td className="py-3 px-4 text-xs" style={{ color: "var(--sand)", fontFamily: "var(--font-mono)" }}>{String(i + 1).padStart(2, "0")}</td>
                    <td className="py-3 px-4">
                      <button className="text-sm font-medium hover:underline text-left" style={{ color: "var(--fern)" }}
                        onClick={() => navigate(`/patient/${p.id}`, { state: { from: currentViewType } })}>
                        {p.name}
                      </button>
                      <p className="text-xs" style={{ color: "var(--mist)" }}>{p.contactNo}</p>
                    </td>
                    {columns.map(c => (
                      <td key={c.key} className="py-3 px-4 text-sm" style={{ color: "var(--mist)" }}>
                        {c.render ? c.render(p) : (p[c.key] ?? "—")}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default function AppointmentData({ viewType = "appointments" }) {
  const [appointments, setAppointments] = useState([]);
  const [followups,    setFollowups]    = useState([]);
  const [opd,          setOpd]          = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [showSearch,   setShowSearch]   = useState(false);
  const [updating,     setUpdating]     = useState({});
  const [cancelModal,  setCancelModal]  = useState(null);
  const [cancelling,   setCancelling]   = useState(false);
  const [editFollowup, setEditFollowup] = useState(null);
  const [savingDate,   setSavingDate]   = useState(false);
  const [toast,        setToast]        = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      if (viewType === "appointments") { const r = await axios.get(`${PATIENTS_API}/appointments`); setAppointments(r.data); }
      else if (viewType === "followups") { const r = await axios.get(`${PATIENTS_API}/followups`); setFollowups(r.data); }
      else if (viewType === "opd") { const r = await axios.get(`${PATIENTS_API}/opd`); setOpd(r.data); }
    } catch (e) { showToast("Failed to load data.", "error"); }
    finally { setLoading(false); }
  }, [viewType]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const handleAppointed = async (pid, val) => {
    setUpdating(u => ({ ...u, [pid]: true }));
    try {
      await axios.patch(`${PATIENTS_API}/${pid}/appointed`, { isAppointed: val });
      await fetchAll();
      if (val === "yes") showToast("Appointment confirmed ✓");
      else showToast("Marked as not appointed.");
    } catch (e) { showToast("Failed to update.", "error"); }
    finally { setUpdating(u => ({ ...u, [pid]: false })); }
  };

  const handleCancelConfirm = async () => {
    if (!cancelModal) return;
    setCancelling(true);
    try {
      const { patient, type } = cancelModal;
      if (type === "appointment") await axios.patch(`${PATIENTS_API}/${patient.id}/cancel-appointment`);
      else await axios.patch(`${PATIENTS_API}/${patient.id}/cancel-followup`);
      setCancelModal(null);
      showToast(`${type === "appointment" ? "Appointment" : "Follow-up"} cancelled.`);
      await fetchAll();
    } catch (e) { showToast("Failed to cancel.", "error"); }
    finally { setCancelling(false); }
  };

  const handleEditFollowupDate = async (newDate) => {
    if (!editFollowup) return;
    setSavingDate(true);
    try {
      await axios.patch(`${PATIENTS_API}/${editFollowup.id}/followup-date`, { followupDate: newDate });
      setEditFollowup(null);
      showToast("Follow-up date updated. Export PDF from patient details to save.");
      await fetchAll();
    } catch (e) { showToast("Failed to update date.", "error"); }
    finally { setSavingDate(false); }
  };

  const filter = list => list.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));
  const fmt = d => d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const apptCols = [
    { key: "createdAt",   label: "Registered", render: p => fmt(p.createdAt) },
    { key: "vikritiType", label: "Dosha",      render: p => p.vikritiType ? <Badge label={p.vikritiType} color="green"/> : <Badge label="Pending" color="gray"/> },
    {
      key: "isAppointed", label: "Cabin?",
      render: p => {
        if (p.isAppointed === "yes") return <Badge label="✓ Yes" color="green"/>;
        return (
          <div className="flex gap-1.5 flex-wrap">
            <button
              disabled={!!updating[p.id]}
              onClick={() => handleAppointed(p.id, "yes")}
              className="text-xs px-3 py-1 rounded-lg font-medium text-white transition"
              style={{ background: "var(--fern)", opacity: updating[p.id] ? .5 : 1 }}>
              Yes
            </button>
            <button
              disabled={!!updating[p.id]}
              onClick={() => handleAppointed(p.id, "no")}
              className="text-xs px-3 py-1 rounded-lg font-medium transition"
              style={{ background: "var(--parchment)", color: "var(--mist)", border: "1px solid var(--border)", opacity: updating[p.id] ? .5 : 1 }}>
              No
            </button>
          </div>
        );
      }
    },
    {
      key: "actions", label: "",
      render: p => (
        p.isOpd !== "yes" ? (
          <button
            onClick={() => setCancelModal({ patient: p, type: "appointment" })}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition font-medium"
            style={{ color: "var(--terracotta)", border: "1px solid rgba(193,105,79,.25)", background: "rgba(193,105,79,.05)" }}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
            Cancel
          </button>
        ) : <span className="text-xs" style={{ color: "var(--mist)" }}>—</span>
      )
    },
  ];

  const followupCols = [
    {
      key: "followupDate", label: "Follow-up Date",
      render: p => (
        <div className="flex items-center gap-2">
          <span className="font-medium" style={{ color: "var(--terracotta)" }}>{fmt(p.followupDate)}</span>
          <button
            onClick={() => setEditFollowup(p)}
            title="Edit follow-up date"
            className="flex items-center justify-center w-6 h-6 rounded-lg transition"
            style={{ color: "var(--fern)", border: "1px solid rgba(39,103,73,.25)", background: "rgba(39,103,73,.05)" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(39,103,73,.15)"}
            onMouseLeave={e => e.currentTarget.style.background = "rgba(39,103,73,.05)"}>
            ✏️
          </button>
        </div>
      )
    },
    { key: "followupDuration", label: "Schedule",  render: p => <Badge label={p.followupDuration || "—"} color="amber"/> },
    { key: "vikritiType",      label: "Dosha",     render: p => p.vikritiType ? <Badge label={p.vikritiType} color="green"/> : <Badge label="N/A" color="gray"/> },
    {
      key: "actions", label: "",
      render: p => (
        <button
          onClick={() => setCancelModal({ patient: p, type: "followup" })}
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition font-medium"
          style={{ color: "var(--terracotta)", border: "1px solid rgba(193,105,79,.25)", background: "rgba(193,105,79,.05)" }}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
          Cancel
        </button>
      )
    },
  ];

  const opdCols = [
    { key: "isAppointed",      label: "Status",    render: () => <Badge label="✓ Completed" color="green"/> },
    { key: "followupDuration", label: "Follow-up", render: p => p.followupDuration && p.followupDuration !== "No" ? <Badge label={`In ${p.followupDuration}`} color="amber"/> : <Badge label="None" color="gray"/> },
    { key: "vikritiType",      label: "Dosha",     render: p => p.vikritiType ? <Badge label={p.vikritiType} color="green"/> : <Badge label="N/A" color="gray"/> },
  ];

  const titles = { appointments: "Appointments", followups: "Follow-ups", opd: "OPD Visits" };

  return (
    <div className="flex-1 min-h-screen anim-page" style={{ background: "var(--parchment)" }}>
      <Toast toast={toast} />
      <div className="px-6 sm:px-10 py-5 border-b flex items-center justify-between gap-4"
        style={{ background: "white", borderColor: "var(--border)" }}>
        <div>
          <h1 className="text-3xl" style={{ fontFamily: "var(--font-serif)", color: "var(--forest)" }}>{titles[viewType]}</h1>
          <p className="text-xs mt-0.5" style={{ color: "var(--mist)" }}>
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {showSearch ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ background: "white", borderColor: "var(--border)" }}>
              <input autoFocus type="text" placeholder="Search patient…" value={search}
                onChange={e => setSearch(e.target.value)} className="outline-none text-sm w-36 sm:w-44"
                style={{ fontFamily: "var(--font-sans)", color: "var(--ink)" }}/>
              <button onClick={() => { setShowSearch(false); setSearch(""); }} style={{ color: "var(--mist)" }}>✕</button>
            </div>
          ) : (
            <button onClick={() => setShowSearch(true)} className="btn-ghost">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/>
              </svg>
              Search
            </button>
          )}
          <button onClick={fetchAll} className="btn-ghost">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>
      </div>

      <div className="px-6 sm:px-10 py-6">
        {viewType === "appointments" && (
          <SectionTable title="Appointments" patients={filter(appointments)} columns={apptCols}
            emptyMsg="No appointments registered." loading={loading} currentViewType="appointments"/>
        )}
        {viewType === "followups" && (
          <SectionTable title="Follow-ups" patients={filter(followups)} columns={followupCols}
            emptyMsg="No follow-ups scheduled." loading={loading} currentViewType="followups"/>
        )}
        {viewType === "opd" && (
          <SectionTable
            title="Today's OPD Visits"
            patients={filter(opd)}
            columns={opdCols}
            emptyMsg={`No completed OPD visits for ${new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}`}
            loading={loading}
            currentViewType="opd"
          />
        )}
      </div>

      {cancelModal && (
        <CancelModal
          patient={cancelModal.patient}
          type={cancelModal.type}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelModal(null)}
          loading={cancelling}
        />
      )}

      {editFollowup && (
        <EditFollowupModal
          patient={editFollowup}
          onConfirm={handleEditFollowupDate}
          onClose={() => setEditFollowup(null)}
          loading={savingDate}
        />
      )}
    </div>
  );
}
