import { useState, useEffect } from "react";
import axios from "axios";
import PatientsTable from "./PatientTable";
import { PATIENTS_API } from "../config";

const PatientData = () => {
  const [search, setSearch]           = useState("");
  const [showSearch, setShowSearch]   = useState(false);
  const [patients, setPatients]       = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get(PATIENTS_API);
        setPatients(res.data);
      } catch (err) {
        console.error("Failed to fetch patients", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const clearSearch = () => {
    setSearch("");
    setShowSearch(false);
  };

  const filtered = patients.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main className="flex-1 bg-gray-50 min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-8 py-5 bg-white border-b border-gray-100">
        <h1 className="text-2xl font-bold text-gray-800">Patients Data</h1>
        <div className="flex items-center gap-2">
          {showSearch ? (
            <div className="flex items-center bg-white border rounded-xl px-3 py-2 shadow-sm">
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="outline-none text-sm w-44 text-gray-700"
                autoFocus
              />
              <button
                onClick={clearSearch}
                className="ml-2 text-gray-400 hover:text-black transition"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowSearch(true)}
              className="p-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl transition"
              title="Search patients"
            >
              <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" d="m21 21-4.35-4.35" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-gray-400">
            <svg className="w-5 h-5 animate-spin mr-2 text-green-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
            </svg>
            Loading patients…
          </div>
        ) : (
          <>
            <PatientsTable patients={filtered} />
            {filtered.length === 0 && (
              <p className="text-center text-gray-400 py-10 text-sm">
                {search ? `No patients found for "${search}".` : "No patients registered yet."}
              </p>
            )}
          </>
        )}
      </div>
    </main>
  );
};

export default PatientData;
