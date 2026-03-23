import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Toast from "./Toast";
import { PATIENTS_API } from "../config";

const Badge = ({ label, color="green" }) => {
  const s = {
    green:  { background:"rgba(39,103,73,.1)",  color:"var(--fern)" },
    red:    { background:"rgba(139,42,42,.1)",   color:"#b94040" },
    gray:   { background:"rgba(107,126,114,.1)", color:"var(--mist)" },
    amber:  { background:"rgba(193,105,79,.1)",  color:"var(--terracotta)" },
    blue:   { background:"rgba(14,165,233,.1)",  color:"#0369a1" },
    purple: { background:"rgba(107,33,168,.1)",  color:"#7c3aed" },
  };
  return <span className="badge" style={s[color]||s.gray}>{label}</span>;
};

const typeColor   = t => t==="appointment"?"blue":t==="followup"?"amber":t==="opd"?"purple":"gray";
const statusColor = s => s==="completed"?"green":s==="missed"?"red":"gray";

const DeleteConfirmModal = ({ visit, onConfirm, onCancel, deleting }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
    <div className="card relative w-full max-w-sm p-6 z-10 anim-scale">
      <div className="flex items-center justify-center w-12 h-12 rounded-full mx-auto mb-4"
        style={{ background:"rgba(193,105,79,.12)" }}>
        <svg className="w-6 h-6" style={{ color:"var(--terracotta)" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round"
            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
        </svg>
      </div>
      <h3 className="text-xl font-light text-center mb-1" style={{ fontFamily:"var(--font-serif)", color:"var(--forest)" }}>
        Delete Visit Record?
      </h3>
      <p className="text-sm text-center mb-1" style={{ color:"var(--mist)" }}>
        This will permanently delete the visit for
      </p>
      <p className="text-sm font-semibold text-center mb-1" style={{ color:"var(--ink)" }}>
        {visit?.patient?.name || visit?.patientName || "this patient"}
      </p>
      <p className="text-xs text-center mb-4" style={{ color:"var(--sand)" }}>
        {visit?.visitDate ? new Date(visit.visitDate).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : ""}
        {" · "}{visit?.visitType}
      </p>
      <div className="text-xs text-center px-3 py-2 rounded-xl mb-5"
        style={{ background:"rgba(193,105,79,.08)", color:"var(--terracotta)", border:"1px solid rgba(193,105,79,.2)" }}>
        ⚠️ Patient details will <strong>not</strong> be deleted — only this visit record.
      </div>
      <div className="flex gap-3">
        <button onClick={onCancel} disabled={deleting} className="btn-ghost flex-1 justify-center py-2.5">
          Cancel
        </button>
        <button onClick={onConfirm} disabled={deleting}
          className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition"
          style={{ background:"linear-gradient(135deg,#8b2a2a,var(--terracotta))", opacity:deleting?.6:1 }}>
          {deleting
            ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg>Deleting…</>
            : "Delete Record"}
        </button>
      </div>
    </div>
  </div>
);

export default function HistoryData() {
  const navigate = useNavigate();
  const [history, setHistory]           = useState([]);
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [showSearch, setShowSearch]     = useState(false);
  const [typeFilter, setTypeFilter]     = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting]         = useState(false);
  const [toast, setToast]               = useState(null);

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try { const r = await axios.get(`${PATIENTS_API}/history`); setHistory(r.data||[]); }
    catch(e) { console.error(e); setHistory([]); }
    finally { setLoading(false); }
  },[]);

  useEffect(()=>{ fetchHistory(); },[fetchHistory]);

  const showToast = (msg, type="success") => {
    setToast({msg,type});
    setTimeout(()=>setToast(null),3000);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await axios.delete(`${PATIENTS_API}/visits/${deleteTarget.id}`);
      setHistory(prev => prev.filter(v => v.id !== deleteTarget.id));
      showToast("Visit record deleted successfully.");
    } catch(err) {
      showToast(err?.response?.data?.error || "Failed to delete record.", "error");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const fmt = d => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";

  const filtered = history.filter(h => {
    const name = (h.patient?.name || h.patientName || "").toLowerCase();
    const matchName   = name.includes(search.toLowerCase()) || !search;
    const matchType   = typeFilter==="All"   || h.visitType===typeFilter.toLowerCase();
    const matchStatus = statusFilter==="All" || h.status===statusFilter.toLowerCase();
    return matchName && matchType && matchStatus;
  });

  const stats = [
    { label:"Total",        value: history.length },
    { label:"Completed",    value: history.filter(v=>v.status==="completed").length },
    { label:"Pending",      value: history.filter(v=>v.status==="pending").length },
    { label:"Missed",       value: history.filter(v=>v.status==="missed").length },
    { label:"Appointments", value: history.filter(v=>v.visitType==="appointment").length },
    { label:"Follow-ups",   value: history.filter(v=>v.visitType==="followup").length },
    { label:"OPD",          value: history.filter(v=>v.visitType==="opd").length },
  ];

  return (
    <div className="flex-1 min-h-screen anim-page" style={{ background:"var(--parchment)" }}>
      <Toast toast={toast}/>

      {deleteTarget && (
        <DeleteConfirmModal
          visit={deleteTarget}
          onConfirm={handleDeleteConfirm}
          onCancel={()=>setDeleteTarget(null)}
          deleting={deleting}
        />
      )}

      {/* Header */}
      <div className="px-6 sm:px-10 py-5 border-b flex items-center justify-between gap-4 flex-wrap"
        style={{ background:"white", borderColor:"var(--border)" }}>
        <div>
          <h1 className="text-3xl font-light" style={{ fontFamily:"var(--font-serif)", color:"var(--forest)" }}>Visit History</h1>
          <p className="text-xs mt-0.5" style={{ color:"var(--mist)" }}>All patient visits across all time</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}
            className="text-xs rounded-xl px-3 py-2 outline-none"
            style={{ background:"var(--parchment)", border:"1px solid var(--border)", color:"var(--mist)", fontFamily:"var(--font-sans)" }}>
            {["All","Appointment","Followup","OPD"].map(t=><option key={t}>{t}</option>)}
          </select>
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}
            className="text-xs rounded-xl px-3 py-2 outline-none"
            style={{ background:"var(--parchment)", border:"1px solid var(--border)", color:"var(--mist)", fontFamily:"var(--font-sans)" }}>
            {["All","Completed","Pending","Missed"].map(s=><option key={s}>{s}</option>)}
          </select>
          {showSearch ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ background:"white", borderColor:"var(--border)" }}>
              <input autoFocus type="text" placeholder="Search patient…" value={search}
                onChange={e=>setSearch(e.target.value)} className="outline-none text-xs w-36 sm:w-48"
                style={{ fontFamily:"var(--font-sans)", color:"var(--ink)" }}/>
              <button onClick={()=>{setShowSearch(false);setSearch("");}} style={{ color:"var(--mist)" }}>✕</button>
            </div>
          ) : (
            <button onClick={()=>setShowSearch(true)} className="btn-ghost text-xs py-1.5 px-3">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/>
              </svg>
              Search
            </button>
          )}
          <button onClick={fetchHistory} className="btn-ghost text-xs py-1.5 px-3">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
            </svg>
          </button>
        </div>
      </div>

      {/* Stats strip */}
      <div className="px-6 sm:px-10 py-3 border-b flex items-center gap-2 overflow-x-auto"
        style={{ background:"var(--parchment)", borderColor:"var(--border)" }}>
        {stats.map(({label,value})=>(
          <div key={label} className="flex items-center gap-2 shrink-0 px-3 py-1.5 rounded-xl"
            style={{ background:"white", border:"1px solid var(--border)" }}>
            <span className="text-base font-light" style={{ fontFamily:"var(--font-serif)", color:"var(--forest)" }}>{value}</span>
            <span className="text-xs" style={{ color:"var(--mist)" }}>{label}</span>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="px-6 sm:px-10 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <svg className="w-7 h-7 animate-spin" style={{ color:"var(--fern)" }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            <p className="text-sm" style={{ color:"var(--mist)" }}>Loading history…</p>
          </div>
        ) : filtered.length===0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 anim-float inline-block">📋</div>
            <p className="text-xl mb-1" style={{ fontFamily:"var(--font-serif)", color:"var(--forest)" }}>No records found</p>
            <p className="text-sm" style={{ color:"var(--mist)" }}>Try adjusting your filters</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="card overflow-hidden anim-up hidden md:block">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background:"var(--parchment)", borderBottom:"1px solid var(--border)" }}>
                      {["Patient","Type","Date","Status","Dosha","Actions"].map(h=>(
                        <th key={h} className="py-3 px-4 text-left text-xs font-semibold uppercase tracking-widest"
                          style={{ color:"var(--mist)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((h,i)=>(
                      <tr key={h.id||i} className="trow" style={{ borderBottom:"1px solid rgba(39,103,73,.05)" }}>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold uppercase"
                              style={{ background:"linear-gradient(135deg,#c8e6d0,#a8d4b8)", color:"var(--forest)", fontFamily:"var(--font-serif)" }}>
                              {(h.patient?.name||h.patientName)?.charAt(0)||"?"}
                            </div>
                            <div>
                              <p className="text-sm font-medium" style={{ color:"var(--ink)" }}>
                                {h.patient?.name||h.patientName||"—"}
                              </p>
                              {h.patient?.email && (
                                <p className="text-xs" style={{ color:"var(--mist)" }}>{h.patient.email}</p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4"><Badge label={h.visitType} color={typeColor(h.visitType)}/></td>
                        <td className="py-3 px-4 text-sm" style={{ color:"var(--mist)" }}>{fmt(h.visitDate)}</td>
                        <td className="py-3 px-4"><Badge label={h.status} color={statusColor(h.status)}/></td>
                        <td className="py-3 px-4">
                          {h.patient?.vikritiType
                            ? <Badge label={h.patient.vikritiType} color="green"/>
                            : <span style={{ color:"var(--sand)" }}>—</span>}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={()=>navigate(`/patient/${h.patientId||h.patient?.id}`, { state: { from: "history" } })}
                              className="text-xs px-3 py-1.5 rounded-lg font-medium transition"
                              style={{ color:"var(--fern)", border:"1px solid rgba(39,103,73,.25)", background:"rgba(39,103,73,.05)" }}
                              onMouseEnter={e=>e.currentTarget.style.background="rgba(39,103,73,.12)"}
                              onMouseLeave={e=>e.currentTarget.style.background="rgba(39,103,73,.05)"}>
                              View
                            </button>
                            <button
                              onClick={()=>setDeleteTarget(h)}
                              className="flex items-center justify-center p-1.5 rounded-lg transition"
                              style={{ color:"var(--terracotta)", border:"1px solid rgba(193,105,79,.25)", background:"rgba(193,105,79,.05)" }}
                              onMouseEnter={e=>e.currentTarget.style.background="rgba(193,105,79,.12)"}
                              onMouseLeave={e=>e.currentTarget.style.background="rgba(193,105,79,.05)"}
                              title="Delete this visit record">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round"
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile cards */}
            <div className="card overflow-hidden anim-up md:hidden">
              <div className="divide-y" style={{ borderColor:"rgba(39,103,73,.06)" }}>
                {filtered.map((h,i)=>(
                  <div key={h.id||i} className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-base font-semibold uppercase"
                          style={{ background:"linear-gradient(135deg,#c8e6d0,#a8d4b8)", color:"var(--forest)", fontFamily:"var(--font-serif)" }}>
                          {(h.patient?.name||h.patientName)?.charAt(0)||"?"}
                        </div>
                        <div>
                          <p className="font-medium text-sm" style={{ color:"var(--ink)" }}>{h.patient?.name||h.patientName||"—"}</p>
                          {h.patient?.email && <p className="text-xs" style={{ color:"var(--mist)" }}>{h.patient.email}</p>}
                        </div>
                      </div>
                      <span className="text-xs shrink-0" style={{ color:"var(--sand)", fontFamily:"var(--font-mono)" }}></span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <div>
                        <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color:"var(--sand)" }}>Date</p>
                        <p className="text-sm font-medium" style={{ color:"var(--ink)" }}>{fmt(h.visitDate)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color:"var(--sand)" }}>Dosha</p>
                        {h.patient?.vikritiType
                          ? <Badge label={h.patient.vikritiType} color="green"/>
                          : <span className="text-sm" style={{ color:"var(--sand)" }}>—</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3">
                      <Badge label={h.visitType} color={typeColor(h.visitType)}/>
                      <Badge label={h.status} color={statusColor(h.status)}/>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={()=>navigate(`/patient/${h.patientId||h.patient?.id}`, { state: { from: "history" } })}
                        className="flex-1 text-xs py-2 rounded-xl font-medium text-center transition"
                        style={{ color:"var(--fern)", border:"1px solid rgba(39,103,73,.25)", background:"rgba(39,103,73,.05)" }}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(39,103,73,.12)"}
                        onMouseLeave={e=>e.currentTarget.style.background="rgba(39,103,73,.05)"}>
                        View Patient
                      </button>
                      <button onClick={()=>setDeleteTarget(h)}
                        className="flex items-center justify-center gap-1.5 text-xs px-4 py-2 rounded-xl font-medium transition"
                        style={{ color:"var(--terracotta)", border:"1px solid rgba(193,105,79,.25)", background:"rgba(193,105,79,.05)" }}
                        onMouseEnter={e=>e.currentTarget.style.background="rgba(193,105,79,.12)"}
                        onMouseLeave={e=>e.currentTarget.style.background="rgba(193,105,79,.05)"}>
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
