import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE = "http://localhost:5000/api/patients";

const Badge = ({ label, color }) => {
  const colors = {
    green:  "bg-green-100 text-green-700",
    red:    "bg-red-100 text-red-600",
    gray:   "bg-gray-100 text-gray-500",
    amber:  "bg-amber-100 text-amber-700",
    blue:   "bg-blue-100 text-blue-700",
    purple: "bg-purple-100 text-purple-700",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[color] || colors.gray}`}>
      {label}
    </span>
  );
};

const visitTypeColor = (type) => {
  if (type === "appointment") return "blue";
  if (type === "followup")    return "amber";
  if (type === "opd")         return "purple";
  return "gray";
};

const visitTypeLabel = (type) => {
  if (type === "appointment") return "Appointment";
  if (type === "followup")    return "Follow-up";
  if (type === "opd")         return "OPD";
  return type;
};

const statusColor = (status) => {
  if (status === "completed") return "green";
  if (status === "missed")    return "red";
  return "gray";
};

const HistoryData = () => {
  const navigate = useNavigate();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);

  // Filters
  const [filterType,   setFilterType]   = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");

  const fetchHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${BASE}/history`);
      setVisits(res.data);
    } catch (err) {
      console.error("Failed to load history", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchHistory(); }, [fetchHistory]);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—";

  const formatDateTime = (d) =>
    d ? new Date(d).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

  const filtered = visits.filter((v) => {
    const name = v.patient?.name?.toLowerCase() || "";
    const matchSearch = name.includes(search.toLowerCase()) ||
      v.patient?.email?.toLowerCase().includes(search.toLowerCase());
    const matchType   = filterType   === "all" || v.visitType === filterType;
    const matchStatus = filterStatus === "all" || v.status    === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  // Summary counts
  const total       = visits.length;
  const completed   = visits.filter((v) => v.status === "completed").length;
  const missed      = visits.filter((v) => v.status === "missed").length;
  const pending     = visits.filter((v) => v.status === "pending").length;
  const apptCount   = visits.filter((v) => v.visitType === "appointment").length;
  const followCount = visits.filter((v) => v.visitType === "followup").length;
  const opdCount    = visits.filter((v) => v.visitType === "opd").length;

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="p-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Visit History</h1>
            <p className="text-sm text-gray-400 mt-0.5">All patient visits across all time</p>
          </div>
          <div className="flex items-center gap-2">
            {showSearch ? (
              <div className="flex items-center bg-white border rounded-xl px-3 py-2 shadow-sm">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search by name or email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="outline-none text-sm w-52 text-gray-700"
                />
                <button onClick={() => { setShowSearch(false); setSearch(""); }}
                  className="ml-2 text-gray-400 hover:text-gray-700 text-sm">✕</button>
              </div>
            ) : (
              <button onClick={() => setShowSearch(true)}
                className="p-2.5 bg-white border rounded-xl shadow-sm hover:bg-gray-50 transition">
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" d="m21 21-4.35-4.35" />
                </svg>
              </button>
            )}
            <button onClick={fetchHistory}
              className="p-2.5 bg-white border rounded-xl shadow-sm hover:bg-gray-50 transition" title="Refresh">
              <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-7 gap-3 mb-6">
          {[
            { label: "Total Visits",   value: total,       color: "border-gray-200 bg-white" },
            { label: "Completed",      value: completed,   color: "border-green-200 bg-green-50" },
            { label: "Pending",        value: pending,     color: "border-gray-200 bg-gray-50" },
            { label: "Missed",         value: missed,      color: "border-red-200 bg-red-50" },
            { label: "Appointments",   value: apptCount,   color: "border-blue-200 bg-blue-50" },
            { label: "Follow-ups",     value: followCount, color: "border-amber-200 bg-amber-50" },
            { label: "OPD Visits",     value: opdCount,    color: "border-purple-200 bg-purple-50" },
          ].map(({ label, value, color }) => (
            <div key={label} className={`rounded-2xl border p-4 text-center shadow-sm ${color}`}>
              <div className="text-2xl font-bold text-gray-800">{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-3 mb-5 bg-white border rounded-2xl px-4 py-3 shadow-sm">
          <span className="text-xs font-semibold text-gray-500 mr-1">Filter by:</span>

          {/* Visit Type */}
          <div className="flex gap-1.5">
            {["all", "appointment", "followup", "opd"].map((t) => (
              <button key={t}
                onClick={() => setFilterType(t)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                  filterType === t
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {t === "all" ? "All Types" : visitTypeLabel(t)}
              </button>
            ))}
          </div>

          <div className="w-px h-5 bg-gray-200 mx-1" />

          {/* Status */}
          <div className="flex gap-1.5">
            {["all", "completed", "pending", "missed"].map((s) => (
              <button key={s}
                onClick={() => setFilterStatus(s)}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium transition ${
                  filterStatus === s
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}>
                {s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="ml-auto text-xs text-gray-400">
            {filtered.length} record{filtered.length !== 1 ? "s" : ""} shown
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20 text-gray-400">
              <svg className="w-6 h-6 animate-spin mr-2 text-green-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Loading visit records…
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
              <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-sm">No records found</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Visit Date</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Type</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Dosha / Vikriti</th>
                    <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">Last Updated</th>
                    <th className="px-5 py-3.5"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filtered.map((v, idx) => (
                    <tr key={v.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-3.5 text-gray-400 text-xs">{idx + 1}</td>

                      {/* Patient */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                            <span className="text-xs font-bold text-green-600 uppercase">
                              {v.patient?.name?.charAt(0) || "?"}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-gray-800 text-sm">{v.patient?.name || "Unknown"}</div>
                            <div className="text-xs text-gray-400">{v.patient?.email || "—"}</div>
                          </div>
                        </div>
                      </td>

                      {/* Visit Date */}
                      <td className="px-5 py-3.5 text-gray-700 text-sm font-medium">
                        {formatDate(v.visitDate)}
                      </td>

                      {/* Type */}
                      <td className="px-5 py-3.5">
                        <Badge label={visitTypeLabel(v.visitType)} color={visitTypeColor(v.visitType)} />
                      </td>

                      {/* Status */}
                      <td className="px-5 py-3.5">
                        <Badge
                          label={v.status.charAt(0).toUpperCase() + v.status.slice(1)}
                          color={statusColor(v.status)}
                        />
                      </td>

                      {/* Dosha */}
                      <td className="px-5 py-3.5">
                        {v.patient?.vikritiType ? (
                          <Badge label={v.patient.vikritiType} color="green" />
                        ) : (
                          <span className="text-xs text-gray-400">—</span>
                        )}
                      </td>

                      {/* Last Updated */}
                      <td className="px-5 py-3.5 text-xs text-gray-400">
                        {formatDateTime(v.updatedAt)}
                      </td>

                      {/* View Patient */}
                      <td className="px-5 py-3.5">
                        <button
                          onClick={() => navigate(`/patient/${v.patientId}`)}
                          className="text-xs text-green-600 hover:text-green-800 hover:bg-green-50 px-3 py-1.5 rounded-lg transition font-medium border border-green-200"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default HistoryData;
