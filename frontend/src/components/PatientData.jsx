import { useState, useEffect } from "react";
import axios from "axios";
import PatientsTable from "./PatientTable";
import { PATIENTS_API } from "../config";

export default function PatientData() {
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(PATIENTS_API).then(r => setPatients(r.data)).catch(console.error).finally(() => setLoading(false));
  }, []);

  const filtered = patients.filter(p => p.name?.toLowerCase().includes(search.toLowerCase()));

  return (
    <main className="flex-1 min-h-screen anim-page" style={{ background:"var(--parchment)" }}>
      {/* Header */}
      <div className="px-6 sm:px-10 py-5 border-b flex items-center justify-between gap-4"
        style={{ background:"white", borderColor:"var(--border)" }}>
        <div>
          <h1 className="text-3xl" style={{ fontFamily:"var(--font-serif)", color:"var(--forest)" }}>Patients</h1>
          <p className="text-xs mt-0.5" style={{ color:"var(--mist)" }}>{patients.length} registered</p>
        </div>
        <div>
          {showSearch ? (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl border" style={{ background:"white", borderColor:"var(--border)" }}>
              <svg className="w-4 h-4 shrink-0" style={{ color:"var(--mist)" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/>
              </svg>
              <input autoFocus type="text" placeholder="Search by name…" value={search}
                onChange={e => setSearch(e.target.value)}
                className="outline-none text-sm w-36 sm:w-48" style={{ fontFamily:"var(--font-sans)", color:"var(--ink)" }} />
              <button onClick={() => { setSearch(""); setShowSearch(false); }} style={{ color:"var(--mist)" }}>✕</button>
            </div>
          ) : (
            <button onClick={() => setShowSearch(true)} className="btn-ghost">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"/><path strokeLinecap="round" d="m21 21-4.35-4.35"/>
              </svg>
              Search
            </button>
          )}
        </div>
      </div>

      <div className="px-6 sm:px-10 py-6">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <svg className="w-7 h-7 animate-spin" style={{ color:"var(--fern)" }} fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            <p className="text-sm" style={{ color:"var(--mist)" }}>Loading patients…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4 anim-float inline-block">🌿</div>
            <p className="text-xl mb-1" style={{ fontFamily:"var(--font-serif)", color:"var(--forest)" }}>
              {search ? `No results for "${search}"` : "No patients yet"}
            </p>
            <p className="text-sm" style={{ color:"var(--mist)" }}>
              {search ? "Try a different name" : "Patients will appear here once added"}
            </p>
          </div>
        ) : <PatientsTable patients={filtered} />}
      </div>
    </main>
  );
}
