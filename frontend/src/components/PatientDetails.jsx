import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axios from "axios";
import Toast from "./Toast";
import { PATIENTS_API } from "../config";

const ENUM_OPTS = {
  bodyBuild:      ["Thin, difficulty gaining weight","Medium build, muscular","Broad, easily gains weight"],
  skinType:       ["Dry, rough, cold","Warm, sensitive, prone to redness/acne","Soft, thick, oily"],
  digestion:      ["Irregular, bloating/gas common","Strong but prone to acidity","Slow, heavy after meals"],
  hungerPattern:  ["Variable, sometimes forget to eat","Strong and sharp, get irritated if hungry","Mild and stable"],
  sleepPattern:   ["Light, easily disturbed","Moderate, may wake once","Deep and long"],
  bowelMovements: ["Dry, hard, constipated","Loose or frequent","Regular but slow"],
  stressResponse: ["Feel anxious or fearful","Become irritable or angry","Withdraw or feel dull"],
  energyLevel:    ["Fluctuating, comes in bursts","Strong but can burn out","Stable but slow"],
  severity:       ["Sthula","Madhyama","Sukshma"],
};
const HEALTH_FIELDS = [
  {label:"Body Build",key:"bodyBuild"},{label:"Skin Type",key:"skinType"},
  {label:"Digestion",key:"digestion"},{label:"Hunger Pattern",key:"hungerPattern"},
  {label:"Sleep Pattern",key:"sleepPattern"},{label:"Bowel Movements",key:"bowelMovements"},
  {label:"Stress Response",key:"stressResponse"},{label:"Energy Level",key:"energyLevel"},
];

const Badge = ({ label, color="green" }) => {
  const s = {
    green: { background:"rgba(39,103,73,.1)",  color:"var(--fern)" },
    amber: { background:"rgba(193,105,79,.1)", color:"var(--terracotta)" },
    gray:  { background:"rgba(107,126,114,.1)",color:"var(--mist)" },
    red:   { background:"rgba(139,42,42,.1)",  color:"#b94040" },
  };
  return <span className="badge" style={s[color]||s.gray}>{label}</span>;
};

const VisitRow = ({ visit, index, onCancel }) => {
  const fmt = d => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";
  const tc = {appointment:"green",followup:"amber",opd:"gray"};
  const sc = {completed:"green",pending:"amber",missed:"red"};
  return (
    <tr className="trow" style={{ borderBottom:"1px solid rgba(39,103,73,.05)" }}>
      <td className="py-2.5 px-4 text-xs" style={{ color:"var(--sand)", fontFamily:"var(--font-mono)" }}>{String(index+1).padStart(2,"0")}</td>
      <td className="py-2.5 px-4"><Badge label={visit.visitType} color={tc[visit.visitType]||"gray"}/></td>
      <td className="py-2.5 px-4 text-sm" style={{ color:"var(--mist)" }}>{fmt(visit.visitDate)}</td>
      <td className="py-2.5 px-4"><Badge label={visit.status} color={sc[visit.status]||"gray"}/></td>
      <td className="py-2.5 px-4 text-xs max-w-[160px] truncate" style={{ color:"var(--mist)" }}>{visit.report||visit.notes||"—"}</td>
      <td className="py-2.5 px-4">
        {visit.status==="pending" && (
          <button onClick={()=>onCancel(visit)}
            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition"
            style={{ color:"var(--terracotta)", border:"1px solid rgba(193,105,79,.25)", background:"rgba(193,105,79,.05)" }}>
            <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
            Cancel
          </button>
        )}
      </td>
    </tr>
  );
};

export default function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // Track where the user navigated from for accurate breadcrumb
  const fromPage = location.state?.from || "patients";
  const [patientData, setPatientData] = useState(null);
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [editSection, setEditSection] = useState("basic");
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [cancelVisit, setCancelVisit] = useState(null);
  const [cancellingV, setCancellingV] = useState(false);
  const [approved, setApproved] = useState(true);
  const [modifyMode, setModifyMode] = useState(false);
  const [reportText, setReportText] = useState("");
  const [followUp, setFollowUp] = useState("No");
  const [customFollowupDate, setCustomFollowupDate] = useState("");
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [focused, setFocused] = useState(null);

  const showToast = (msg, type="success") => { setToast({msg,type}); setTimeout(()=>setToast(null),3000); };

  const fetchPatient = useCallback(async () => {
    try { const r = await axios.get(`${PATIENTS_API}/${id}`); setPatientData(r.data); setReportText(r.data.aiReport||"No AI report generated yet."); }
    catch(e) { showToast("Failed to load patient.","error"); }
  },[id]);

  const fetchVisits = useCallback(async () => {
    try { const r = await axios.get(`${PATIENTS_API}/${id}/visits`); setVisits(r.data||[]); }
    catch(e) { setVisits([]); }
  },[id]);

  useEffect(()=>{ Promise.all([fetchPatient(),fetchVisits()]).finally(()=>setLoading(false)); },[fetchPatient,fetchVisits]);

  const openEdit = (sec) => {
    setEditSection(sec);
    setEditForm(patientData||{});
    setShowEdit(true);
    // Scroll the modal into view after it mounts
    setTimeout(() => {
      document.getElementById("edit-modal-card")?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 50);
  };

  const handleEditSubmit = async e => {
    e.preventDefault(); setSaving(true);
    try {
      // Use separate endpoints for basic vs health info (respects backend whitelisting)
      const url = editSection === "health"
        ? `${PATIENTS_API}/${id}/health`
        : `${PATIENTS_API}/${id}`;
      const r = await axios.put(url, editForm);
      setPatientData(r.data);
      setShowEdit(false);
      showToast("Updated successfully.");
    }
    catch(err) { showToast(err?.response?.data?.error||"Failed.","error"); }
    finally { setSaving(false); }
  };

  const handleCancelVisit = async () => {
    if (!cancelVisit) return; setCancellingV(true);
    try { await axios.patch(`${PATIENTS_API}/visits/${cancelVisit.id}/cancel`); setCancelVisit(null); showToast("Visit cancelled."); await Promise.all([fetchPatient(),fetchVisits()]); }
    catch(err) { showToast(err?.response?.data?.error||"Failed.","error"); }
    finally { setCancellingV(false); }
  };

  const handleExport = async () => {
    // Validate custom date if selected
    if (followUp === "Custom Date" && !customFollowupDate) {
      showToast("Please pick a custom follow-up date.", "error");
      return;
    }
    setExporting(true);
    try {
      // For custom date, pass as a special duration token the backend resolves
      const followupPayload = followUp === "Custom Date" ? "Custom Date" : followUp;
      const r = await axios.patch(`${PATIENTS_API}/${id}/export`, {
        followupDuration: followupPayload,
        customFollowupDate: followUp === "Custom Date" ? customFollowupDate : undefined,
        aiReport: reportText,
        treatmentApproved: approved
      });
      setPatientData(r.data);
      setExported(true);
      showToast("Report exported.");
      await fetchVisits();

      // Generate & download PDF
      try {
        const patient = r.data;
        const { jsPDF } = await import("jspdf");
        const doc = new jsPDF();
        const lineH = 7;
        let y = 20;
        const line = (txt, bold = false) => {
          doc.setFont("helvetica", bold ? "bold" : "normal");
          doc.setFontSize(bold ? 12 : 10);
          doc.text(txt, 15, y);
          y += lineH;
        };
        const divider = () => { doc.setDrawColor(200); doc.line(15, y, 195, y); y += 4; };

        doc.setFont("helvetica", "bold");
        doc.setFontSize(18);
        doc.text("Ayurvedic Patient Report", 105, y, { align: "center" });
        y += 10;
        divider();

        line(`Patient: ${patient.name}`, true);
        line(`Email: ${patient.email}`);
        line(`Age: ${patient.age} yrs   Height: ${patient.height} cm   Weight: ${patient.weight} kg`);
        line(`Contact: ${patient.contactNo}`);
        line(`Dosha: ${patient.vikritiType || "Pending"}   Severity: ${patient.severity || "—"}`);
        y += 3;
        divider();

        line("Treatment", true);
        line(`Approved: ${approved ? "Yes" : "No (Modified)"}`);
        y += 2;
        const reportLines = doc.splitTextToSize(reportText, 175);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        reportLines.forEach(l => { doc.text(l, 15, y); y += 5.5; });
        y += 3;
        divider();

        line("Follow-up", true);
        const followupLabel = followUp === "Custom Date"
          ? `Custom Date: ${customFollowupDate}`
          : followUp === "No" ? "None scheduled" : followUp;
        line(`Schedule: ${followupLabel}`);
        if (patient.followupDate) line(`Follow-up Date: ${new Date(patient.followupDate).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`);
        y += 3;
        divider();

        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generated on ${new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`, 105, 285, { align: "center" });

        doc.save(`${patient.name.replace(/\s+/g, "_")}_report.pdf`);
      } catch (pdfErr) {
        console.warn("PDF generation failed (jspdf may not be installed):", pdfErr);
        showToast("Report saved. Install jspdf to enable PDF download.", "error");
      }

      setTimeout(() => setExported(false), 2500);
    } catch (err) {
      showToast(err?.response?.data?.error || "Failed.", "error");
    } finally {
      setExporting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:"var(--parchment)" }}>
      <svg className="w-7 h-7 animate-spin" style={{ color:"var(--fern)" }} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
      </svg>
    </div>
  );
  if (!patientData) return <div className="p-8 text-center" style={{ color:"var(--terracotta)" }}>Patient not found.</div>;

  const p = patientData;
  const fmt = d => d ? new Date(d).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"}) : "—";
  const inputStyle = k => ({ borderColor: focused===k?"var(--fern)":"rgba(39,103,73,.18)", background: focused===k?"#fafff8":"white" });

  return (
    <div className="flex-1 min-h-screen anim-page" style={{ background:"var(--parchment)" }}>
      <Toast toast={toast}/>

      {/* Top nav */}
      <div className="px-6 sm:px-10 py-3.5 border-b flex items-center justify-between flex-wrap gap-2"
        style={{ background:"white", borderColor:"var(--border)" }}>
        <nav className="flex items-center gap-1.5 text-sm" style={{ fontFamily:"var(--font-sans)" }}>
          <button className="transition hover:underline" style={{ color:"var(--fern)" }} onClick={()=>navigate("/patient")}>Patients</button>
          {fromPage === "appointments" && (
            <>
              <span style={{ color:"var(--sand)" }}>›</span>
              <button className="transition hover:underline" style={{ color:"var(--fern)" }} onClick={()=>navigate("/appointment")}>Appointments</button>
            </>
          )}
          {fromPage === "followups" && (
            <>
              <span style={{ color:"var(--sand)" }}>›</span>
              <button className="transition hover:underline" style={{ color:"var(--fern)" }} onClick={()=>navigate("/followups")}>Follow-ups</button>
            </>
          )}
          {fromPage === "opd" && (
            <>
              <span style={{ color:"var(--sand)" }}>›</span>
              <button className="transition hover:underline" style={{ color:"var(--fern)" }} onClick={()=>navigate("/opd")}>OPD</button>
            </>
          )}
          {fromPage === "history" && (
            <>
              <span style={{ color:"var(--sand)" }}>›</span>
              <button className="transition hover:underline" style={{ color:"var(--fern)" }} onClick={()=>navigate("/history")}>History</button>
            </>
          )}
          <span style={{ color:"var(--sand)" }}>›</span>
          <span className="font-medium" style={{ color:"var(--ink)" }}>{p.name}</span>
        </nav>
        <div className="flex items-center gap-2 flex-wrap">
          {p.isAppointed==="yes" && <Badge label="Appointed" color="green"/>}
          {p.isOpd==="yes"       && <Badge label="OPD Done" color="green"/>}
          {p.isFollowup==="yes"  && <Badge label={`Follow-up: ${fmt(p.followupDate)}`} color="amber"/>}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">

        {/* Patient Overview */}
        <section className="anim-up">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-light" style={{ fontFamily:"var(--font-serif)", color:"var(--forest)" }}>Patient Overview</h2>
            <button onClick={()=>openEdit("basic")} className="btn-ghost text-xs py-1.5 px-3">Edit Basic Info</button>
          </div>
          <div className="card overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <div className="flex items-start gap-4 p-5 sm:w-60" style={{ borderRight:"1px solid var(--border)" }}>
                <div className="w-13 h-13 w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold uppercase shrink-0"
                  style={{ background:"linear-gradient(135deg,#c8e6d0,#a8d4b8)", color:"var(--forest)", fontFamily:"var(--font-serif)" }}>
                  {p.name?.charAt(0)||"?"}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm mb-0.5" style={{ color:"var(--ink)" }}>{p.name}</p>
                  <p className="text-xs truncate mb-2" style={{ color:"var(--mist)" }}>{p.email}</p>
                  {p.vikritiType && <Badge label={`Dosha: ${p.vikritiType}`} color="green"/>}
                  {p.severity    && <span className="text-xs ml-1" style={{ color:"var(--mist)" }}>{p.severity}</span>}
                </div>
              </div>
              <div className="flex flex-wrap flex-1">
                {[{label:"Age",value:`${p.age} yrs`},{label:"Height",value:`${p.height} cm`},{label:"Weight",value:`${p.weight} kg`},{label:"Contact",value:p.contactNo},{label:"Registered",value:fmt(p.createdAt)}].map(item=>(
                  <div key={item.label} className="flex flex-col justify-center px-5 py-4 min-w-[90px]" style={{ borderRight:"1px solid var(--border)" }}>
                    <p className="text-[10px] uppercase tracking-widest font-medium mb-1" style={{ color:"var(--sand)" }}>{item.label}</p>
                    <p className="font-medium text-sm" style={{ color:"var(--ink)" }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Health Details */}
        <section className="anim-up d-150">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-2xl font-light" style={{ fontFamily:"var(--font-serif)", color:"var(--forest)" }}>Health Details</h2>
            <button onClick={()=>openEdit("health")} className="btn-ghost text-xs py-1.5 px-3">Edit Health Info</button>
          </div>
          <div className="card p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {HEALTH_FIELDS.map(({label,key})=>(
                <div key={key} className="rounded-xl px-4 py-3 transition-all"
                  style={{ background:"var(--parchment)", border:"1px solid var(--border)" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(39,103,73,.3)";e.currentTarget.style.background="#f4f9f6"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="var(--border)";e.currentTarget.style.background="var(--parchment)"}}>
                  <p className="text-[10px] uppercase tracking-widest font-medium mb-1" style={{ color:"var(--sand)" }}>{label}</p>
                  <p className="text-sm font-medium" style={{ color:"var(--ink)" }}>{p[key]||"N/A"}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Visit History */}
        <section className="anim-up d-225">
          <h2 className="text-2xl font-light mb-3" style={{ fontFamily:"var(--font-serif)", color:"var(--forest)" }}>Visit History</h2>
          <div className="card overflow-hidden">
            {visits.length===0 ? (
              <div className="p-10 text-center">
                <p className="text-base" style={{ fontFamily:"var(--font-serif)", color:"var(--forest)" }}>No visits recorded yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr style={{ background:"var(--parchment)", borderBottom:"1px solid var(--border)" }}>
                      {["#","Type","Date","Status","Notes",""].map(h=>(
                        <th key={h} className="py-3 px-4 text-xs font-semibold uppercase tracking-widest" style={{ color:"var(--mist)" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {visits.map((v,i)=><VisitRow key={v.id} visit={v} index={i} onCancel={setCancelVisit}/>)}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        {/* Generated Report */}
        <section className="anim-up d-300">
          <h2 className="text-2xl font-light mb-1" style={{ fontFamily:"var(--font-serif)", color:"var(--forest)" }}>Generated Report</h2>
          <p className="text-xs mb-3" style={{ color:"var(--mist)" }}>AI-generated based on patient vitals and dosha analysis.</p>
          <div className="card p-5 space-y-5">
            <div className="rounded-xl p-4" style={{ background:"var(--parchment)", border:"1px solid var(--border)" }}>
              {modifyMode ? (
                <textarea value={reportText} onChange={e=>setReportText(e.target.value)} rows={6}
                  className="w-full text-sm leading-relaxed bg-transparent outline-none resize-none"
                  style={{ color:"var(--mist)", fontFamily:"var(--font-sans)" }}
                  placeholder="Edit AI-generated report here…"/>
              ) : (
                <p className="text-sm leading-relaxed" style={{ color:"var(--mist)", fontFamily:"var(--font-sans)" }}>{reportText}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="flex flex-col gap-3 flex-1">
                <div className="flex items-center gap-6">
                  {[{val:true,label:"Approve Treatment",active:approved},{val:false,label:"Modify Treatment",active:!approved}].map(opt=>(
                    <button key={String(opt.val)} onClick={()=>{setApproved(opt.val);setModifyMode(!opt.val);}}
                      className="flex items-center gap-2 text-sm font-medium transition-colors"
                      style={{ color: opt.active ? "var(--fern)" : "var(--mist)" }}>
                      <span className="w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all"
                        style={{ borderColor:opt.active?"var(--fern)":"var(--sand)", background:opt.active?"var(--fern)":"transparent" }}>
                        {opt.active && <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7"/></svg>}
                      </span>
                      {opt.label}
                    </button>
                  ))}
                </div>
                {modifyMode && (
                  <p className="text-xs px-3 py-2 rounded-lg" style={{ color:"var(--terracotta)", background:"rgba(193,105,79,.08)", border:"1px solid rgba(193,105,79,.2)" }}>
                    Editing report above. Changes saved on export.
                  </p>
                )}
                <div className="inline-flex flex-col rounded-xl px-4 py-3 w-fit" style={{ background:"white", border:"1px solid var(--border)" }}>
                  <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color:"var(--mist)" }}>Schedule Follow-up?</p>
                  <div className="flex gap-4 flex-wrap">
                    {["No","7 Days","15 Days","1 Month","Custom Date"].map(opt=>(
                      <label key={opt} className="flex items-center gap-1.5 cursor-pointer">
                        <span onClick={()=>setFollowUp(opt)} className="w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-all cursor-pointer"
                          style={{ borderColor:followUp===opt?"var(--fern)":"var(--sand)", background:followUp===opt?"var(--fern)":"transparent" }}/>
                        <span onClick={()=>setFollowUp(opt)} className="text-xs transition-colors"
                          style={{ color:followUp===opt?"var(--ink)":"var(--mist)", fontWeight:followUp===opt?500:400 }}>
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                  {followUp==="Custom Date" && (
                    <div className="mt-3">
                      <label className="block text-[10px] uppercase tracking-widest font-medium mb-1" style={{ color:"var(--mist)" }}>Pick Date</label>
                      <input
                        type="date"
                        value={customFollowupDate}
                        min={new Date().toISOString().slice(0,10)}
                        onChange={e=>setCustomFollowupDate(e.target.value)}
                        className="rounded-xl px-3 py-1.5 text-sm outline-none"
                        style={{ border:"1px solid rgba(39,103,73,.3)", background:"white", color:"var(--ink)", fontFamily:"var(--font-sans)" }}
                      />
                    </div>
                  )}
                </div>
              </div>
              <button onClick={handleExport} disabled={exporting}
                className="btn-primary px-5 py-2.5 shrink-0"
                style={{ borderRadius:"12px", background:exported?"var(--sage)":undefined, opacity:exporting?.7:1 }}>
                {exported ? <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/></svg>Exported!</>
                  : exporting ? "Saving…"
                  : <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a2 2 0 002 2h12a2 2 0 002-2v-1M12 12V4m0 8l-3-3m3 3l3-3"/></svg>Export Report</>}
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Edit Modal — fixed to viewport center, scrolls inside */}
      {showEdit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 overflow-y-auto"
          onClick={e => { if (e.target === e.currentTarget) setShowEdit(false); }}>
          <div className="min-h-full flex items-center justify-center p-4 py-8">
            <div id="edit-modal-card" className="card w-full max-w-lg anim-scale"
              onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between p-6 border-b" style={{ borderColor:"var(--border)" }}>
                <h2 className="text-xl font-light" style={{ fontFamily:"var(--font-serif)", color:"var(--forest)" }}>
                  {editSection==="basic" ? "Edit Basic Info" : "Edit Health Details"}
                </h2>
                <button onClick={()=>setShowEdit(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center transition"
                  style={{ color:"var(--mist)", background:"var(--parchment)" }}
                  onMouseEnter={e=>e.currentTarget.style.background="rgba(193,105,79,.1)"}
                  onMouseLeave={e=>e.currentTarget.style.background="var(--parchment)"}>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                {editSection==="basic" ? (
                  [{label:"Full Name",key:"name",type:"text"},{label:"Email",key:"email",type:"email"},{label:"Age",key:"age",type:"number"},{label:"Height (cm)",key:"height",type:"number"},{label:"Weight (kg)",key:"weight",type:"number"},{label:"Contact",key:"contactNo",type:"text"}].map(({label,key,type})=>(
                    <div key={key}>
                      <label className="block text-xs font-medium mb-1.5 uppercase tracking-widest" style={{ color:"var(--mist)" }}>{label}</label>
                      <input type={type} value={editForm[key]||""} className="input-field" style={inputStyle(key)}
                        onChange={e=>setEditForm(p=>({...p,[key]:e.target.value}))}
                        onFocus={()=>setFocused(key)} onBlur={()=>setFocused(null)}/>
                    </div>
                  ))
                ) : (
                  <>
                    {HEALTH_FIELDS.map(({label,key})=>(
                      <div key={key}>
                        <label className="block text-xs font-medium mb-1.5 uppercase tracking-widest" style={{ color:"var(--mist)" }}>{label}</label>
                        <select value={editForm[key]||""} className="input-field" style={{ background:"white" }}
                          onChange={e=>setEditForm(p=>({...p,[key]:e.target.value}))}>
                          {ENUM_OPTS[key]?.map(o=><option key={o} value={o}>{o}</option>)}
                        </select>
                      </div>
                    ))}
                    <div>
                      <label className="block text-xs font-medium mb-1.5 uppercase tracking-widest" style={{ color:"var(--mist)" }}>Severity</label>
                      <select value={editForm.severity||""} className="input-field" style={{ background:"white" }}
                        onChange={e=>setEditForm(p=>({...p,severity:e.target.value}))}>
                        <option value="">— Select —</option>
                        {ENUM_OPTS.severity.map(s=><option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1.5 uppercase tracking-widest" style={{ color:"var(--mist)" }}>Vikriti Type (Dosha)</label>
                      <input type="text" placeholder="e.g. Vata, Pitta, Kapha" value={editForm.vikritiType||""} className="input-field"
                        style={inputStyle("vikritiType")}
                        onChange={e=>setEditForm(p=>({...p,vikritiType:e.target.value}))}
                        onFocus={()=>setFocused("vikritiType")} onBlur={()=>setFocused(null)}/>
                    </div>
                  </>
                )}
                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={()=>setShowEdit(false)} className="btn-ghost flex-1 justify-center py-2.5">Cancel</button>
                  <button type="submit" disabled={saving} className="btn-primary flex-1 justify-center py-2.5"
                    style={{ borderRadius:"12px", background:saving?"var(--mist)":undefined }}>
                    {saving?"Saving…":"Save Changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Visit Modal */}
      {cancelVisit && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="card w-full max-w-sm p-6 anim-scale">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background:"rgba(193,105,79,.12)" }}>
                <svg className="w-5 h-5" style={{ color:"var(--terracotta)" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                </svg>
              </div>
              <div>
                <h3 className="text-base font-light" style={{ fontFamily:"var(--font-serif)", color:"var(--forest)" }}>Cancel {cancelVisit.visitType}?</h3>
                <p className="text-xs" style={{ color:"var(--mist)" }}>This will mark the visit as missed.</p>
              </div>
            </div>
            <p className="text-sm mb-5" style={{ color:"var(--mist)" }}>
              Cancel the <span className="font-medium" style={{ color:"var(--ink)" }}>{cancelVisit.visitType}</span> on{" "}
              <span className="font-medium" style={{ color:"var(--ink)" }}>
                {new Date(cancelVisit.visitDate).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}
              </span>?
            </p>
            <div className="flex gap-3">
              <button onClick={()=>setCancelVisit(null)} className="btn-ghost flex-1 justify-center py-2.5">Keep it</button>
              <button onClick={handleCancelVisit} disabled={cancellingV}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white transition"
                style={{ background:"linear-gradient(135deg,#8b2a2a,var(--terracotta))", opacity:cancellingV?.6:1 }}>
                {cancellingV?"Cancelling…":"Yes, Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
