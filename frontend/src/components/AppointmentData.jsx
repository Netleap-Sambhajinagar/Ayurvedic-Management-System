import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const BASE = "http://localhost:5000/api/patients";

const Badge = ({ label, color }) => {
  const colors = {
    green: "bg-green-100 text-green-700",
    red: "bg-red-100 text-red-600",
    gray: "bg-gray-100 text-gray-500",
    amber: "bg-amber-100 text-amber-700",
  };
  return (
    <span
      className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors[color] || colors.gray}`}
    >
      {label}
    </span>
  );
};

// ── Confirm Cancel Modal ──────────────────────────────────────────────────────
const CancelModal = ({ patient, type, onConfirm, onClose, loading }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <svg
            className="w-5 h-5 text-red-500"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-base font-bold text-gray-800">
            Cancel {type === "appointment" ? "Appointment" : "Follow-up"}?
          </h3>
          <p className="text-xs text-gray-500 mt-0.5">
            This action cannot be undone easily.
          </p>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-5">
        Are you sure you want to cancel the{" "}
        {type === "appointment" ? "appointment" : "follow-up"} for{" "}
        <span className="font-semibold text-gray-800">{patient?.name}</span>?
        {type === "followup" && (
          <span className="block mt-1 text-amber-600 text-xs">
            Scheduled follow-up on{" "}
            {patient?.followupDate
              ? new Date(patient.followupDate).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                })
              : "—"}{" "}
            will be removed.
          </span>
        )}
      </p>
      <div className="flex gap-3">
        <button
          onClick={onClose}
          className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
        >
          Keep it
        </button>
        <button
          onClick={onConfirm}
          disabled={loading}
          className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60"
        >
          {loading ? "Cancelling…" : "Yes, Cancel"}
        </button>
      </div>
    </div>
  </div>
);

// ── Section Table ─────────────────────────────────────────────────────────────
const SectionTable = ({ title, patients, columns, emptyMsg, loading }) => {
  const navigate = useNavigate();
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
        <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
          {loading ? "…" : `${patients.length} records`}
        </span>
      </div>
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : patients.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">
            {emptyMsg}
          </div>
        ) : (
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="py-3 px-4 text-gray-500 font-semibold text-xs">
                  #
                </th>
                <th className="py-3 px-4 text-gray-500 font-semibold text-xs">
                  Patient
                </th>
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className="py-3 px-4 text-gray-500 font-semibold text-xs"
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {patients.map((p, i) => (
                <tr
                  key={p.id}
                  className="border-b border-gray-50 hover:bg-green-50 transition"
                >
                  <td className="py-3 px-4 text-gray-400 text-xs">{i + 1}</td>
                  <td
                    className="py-3 px-4 font-medium text-green-600 cursor-pointer hover:underline"
                    onClick={() => navigate(`/patient/${p.id}`)}
                  >
                    <div>{p.name}</div>
                    <div className="text-xs text-gray-400 font-normal">
                      {p.contactNo}
                    </div>
                  </td>
                  {columns.map((c) => (
                    <td key={c.key} className="py-3 px-4">
                      {c.render ? c.render(p) : (p[c.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

// ── Main ──────────────────────────────────────────────────────────────────────
const AppointmentData = ({ viewType = "appointments" }) => {
  const [appointments, setAppointments] = useState([]);
  const [followups, setFollowups] = useState([]);
  const [opd, setOpd] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [updating, setUpdating] = useState({});

  // Cancel modal state
  const [cancelModal, setCancelModal] = useState(null);
  // { patient, type: "appointment" | "followup" }
  const [cancelling, setCancelling] = useState(false);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [a, f, o] = await Promise.all([
        axios.get(`${BASE}/appointments`),
        axios.get(`${BASE}/followups`),
        axios.get(`${BASE}/opd`),
      ]);
      setAppointments(a.data);
      setFollowups(f.data);
      setOpd(o.data);
    } catch (err) {
      console.error("Failed to load appointment data", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleAppointed = async (patientId, value) => {
    setUpdating((u) => ({ ...u, [patientId]: true }));
    try {
      await axios.patch(`${BASE}/${patientId}/appointed`, {
        isAppointed: value,
      });
      await fetchAll();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating((u) => ({ ...u, [patientId]: false }));
    }
  };

  const handleCancelConfirm = async () => {
    if (!cancelModal) return;
    setCancelling(true);
    try {
      const { patient, type } = cancelModal;
      if (type === "appointment") {
        await axios.patch(`${BASE}/${patient.id}/cancel-appointment`);
      } else {
        await axios.patch(`${BASE}/${patient.id}/cancel-followup`);
      }
      setCancelModal(null);
      await fetchAll();
    } catch (err) {
      console.error(err);
      alert("Failed to cancel. Please try again.");
    } finally {
      setCancelling(false);
    }
  };

  const filter = (list) =>
    list.filter((p) => p.name?.toLowerCase().includes(search.toLowerCase()));

  const formatDate = (d) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";

  // ── Column definitions ────────────────────────────────────────────────────
  const apptCols = [
    {
      key: "createdAt",
      label: "Registered On",
      render: (p) => formatDate(p.createdAt),
    },
    {
      key: "vikritiType",
      label: "Dosha",
      render: (p) =>
        p.vikritiType ? (
          <Badge label={p.vikritiType} color="green" />
        ) : (
          <Badge label="Pending AI" color="gray" />
        ),
    },
    {
      key: "isAppointed",
      label: "Entered Cabin?",
      render: (p) =>
        p.isAppointed === "yes" ? (
          <Badge label="✓ Yes" color="green" />
        ) : (
          <div className="flex gap-1">
            <button
              disabled={updating[p.id]}
              onClick={() => handleAppointed(p.id, "yes")}
              className="text-xs px-3 py-1 rounded-lg bg-green-500 text-white hover:bg-green-600 transition disabled:opacity-50 font-semibold"
            >
              Yes
            </button>
            <button
              disabled={updating[p.id]}
              onClick={() => handleAppointed(p.id, "no")}
              className="text-xs px-3 py-1 rounded-lg bg-gray-200 text-gray-600 hover:bg-gray-300 transition disabled:opacity-50 font-semibold"
            >
              No
            </button>
          </div>
        ),
    },
    {
      key: "actions",
      label: "",
      render: (p) => (
        <button
          onClick={() => setCancelModal({ patient: p, type: "appointment" })}
          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition font-medium border border-red-100"
          title="Cancel appointment"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Cancel
        </button>
      ),
    },
  ];

  const followupCols = [
    {
      key: "followupDate",
      label: "Follow-up Date",
      render: (p) => (
        <span className="font-medium text-amber-700">
          {formatDate(p.followupDate)}
        </span>
      ),
    },
    {
      key: "followupDuration",
      label: "Schedule",
      render: (p) => <Badge label={p.followupDuration || "—"} color="amber" />,
    },
    {
      key: "vikritiType",
      label: "Dosha",
      render: (p) =>
        p.vikritiType ? (
          <Badge label={p.vikritiType} color="green" />
        ) : (
          <Badge label="N/A" color="gray" />
        ),
    },
    {
      key: "actions",
      label: "",
      render: (p) => (
        <button
          onClick={() => setCancelModal({ patient: p, type: "followup" })}
          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-lg transition font-medium border border-red-100"
          title="Cancel follow-up"
        >
          <svg
            className="w-3.5 h-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
          Cancel
        </button>
      ),
    },
  ];

  const opdCols = [
    {
      key: "isAppointed",
      label: "Visited",
      render: () => <Badge label="✓ Completed" color="green" />,
    },
    {
      key: "followupDuration",
      label: "Follow-up",
      render: (p) =>
        p.followupDuration && p.followupDuration !== "No" ? (
          <Badge label={`In ${p.followupDuration}`} color="amber" />
        ) : (
          <Badge label="None" color="gray" />
        ),
    },
    {
      key: "vikritiType",
      label: "Dosha",
      render: (p) =>
        p.vikritiType ? (
          <Badge label={p.vikritiType} color="green" />
        ) : (
          <Badge label="N/A" color="gray" />
        ),
    },
  ];

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {viewType === "followups" ? "Follow-ups" : viewType === "opd" ? "OPD — Today's Visits" : "Appointments"}
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">
              {new Date().toLocaleDateString("en-IN", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {showSearch ? (
              <div className="flex items-center bg-white border rounded-xl px-3 py-2 shadow-sm">
                <input
                  autoFocus
                  type="text"
                  placeholder="Search patient…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="outline-none text-sm w-44 text-gray-700"
                />
                <button
                  onClick={() => {
                    setShowSearch(false);
                    setSearch("");
                  }}
                  className="ml-2 text-gray-400 hover:text-gray-700 text-sm"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowSearch(true)}
                className="p-2.5 bg-white border rounded-xl shadow-sm hover:bg-gray-50 transition"
              >
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" />
                  <path strokeLinecap="round" d="m21 21-4.35-4.35" />
                </svg>
              </button>
            )}
            <button
              onClick={fetchAll}
              className="p-2.5 bg-white border rounded-xl shadow-sm hover:bg-gray-50 transition"
              title="Refresh"
            >
              <svg
                className="w-4 h-4 text-gray-500"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
            </button>
          </div>
        </div>

        {viewType !== "followups" && viewType !== "opd" && (
          <SectionTable
            title="Appointments"
            patients={filter(appointments)}
            columns={apptCols}
            emptyMsg="No appointments registered today."
            loading={loading}
          />
        )}
        {viewType === "followups" && (
          <SectionTable
            title="Follow Ups"
            patients={filter(followups)}
            columns={followupCols}
            emptyMsg="No follow-ups scheduled."
            loading={loading}
          />
        )}
        {viewType === "opd" && (
          <SectionTable
            title="OPD — Today's Completed Visits"
            patients={filter(opd)}
            columns={opdCols}
            emptyMsg="No completed visits recorded today."
            loading={loading}
          />
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancelModal && (
        <CancelModal
          patient={cancelModal.patient}
          type={cancelModal.type}
          onConfirm={handleCancelConfirm}
          onClose={() => setCancelModal(null)}
          loading={cancelling}
        />
      )}
    </div>
  );
};

export default AppointmentData;
