import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const reportText =
  "The patient's vital signs are within normal limits. Body temperature and blood pressure are stable. Sleep duration is adequate, and digestion appears normal. No critical concerns detected at this time. Routine monitoring and healthy lifestyle maintenance are recommended.";

const PatientDetails = () => {
  const [approved, setApproved] = useState(true);
  const [followUp, setFollowUp] = useState("No");
  const [exported, setExported] = useState(false);

  const { id } = useParams();
  const [patientData, setPatientData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [saving, setSaving] = useState(false);

  const navigator = useNavigate();

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/patients/${id}`);
        setPatientData(res.data);
      } catch (err) {
        console.error("Failed to load patient", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, [id]);

  const handleEditOpen = () => {
    setEditForm({
      name: patientData.name || "",
      age: patientData.age || "",
      weight: patientData.weight || "",
      height: patientData.height || "",
      contactNo: patientData.contactNo || "",
      email: patientData.email || "",
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/patients/${id}`, editForm);
      setPatientData(res.data);
      setShowEditModal(false);
    } catch (err) {
      console.error("Failed to save patient", err);
      alert("Failed to save changes. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading patient details...</div>;
  }

  if (!patientData) {
    return <div className="p-8 text-center text-red-500">Patient not found.</div>;
  }

  // Create Health details map from our patient Schema enums dynamically
  const healthDetails = [
    { label: "Skin Type", value: patientData.skinType || "N/A" },
    { label: "Digestion", value: patientData.digestion || "N/A" },
    { label: "Hunger", value: patientData.hungerPattern || "N/A" },
    { label: "Sleep", value: patientData.sleepPattern || "N/A" },
    { label: "Bowel Movements", value: patientData.bowelMovements || "N/A" },
    { label: "Stress Response", value: patientData.stressResponse || "N/A" },
    { label: "Energy Level", value: patientData.energyLevel || "N/A" },
    { label: "Body Build", value: patientData.bodyBuild || "N/A" },
  ];

  return (
    <div
      className="flex-1 min-h-screen mt-10 "
      style={{ fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}
    >
      {/* Top Nav */}
      <div className="bg-white px-8 py-3 flex items-center justify-between ">
        <nav className="flex items-center gap-1 text-sm text-gray-500">
          <span
            className=" cursor-pointer transition-colors"
            onClick={() => navigator("/patient")}
          >
            Patients
          </span>
          <span className="text-gray-300 mx-1">&gt;</span>
          <span className="transition-colors">Patient Details</span>
          <span className="text-gray-300 mx-1">&gt;</span>
          <span className="font-semibold text-gray-800">{patientData.name}</span>
        </nav>
        <div className="flex items-center gap-4">
          <button className="text-gray-500 p-1.5 rounded-[5px] bg-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-4.35-4.35M16.65 16.65A7 7 0 1 0 4.35 4.35a7 7 0 0 0 12.3 12.3z"
              />
            </svg>
          </button>
          <button className="text-gray-500 p-1.5  rounded-[5px] bg-gray-200">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 1 1v2a1 1 0 0 1-.293.707L13 13.414V19a1 1 0 0 1-.553.894l-4-2A1 1 0 0 1 8 17v-3.586L3.293 6.707A1 1 0 0 1 3 6V4z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Patient Overview */}
        <section className="-ml-25">
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            Patient Overview
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200  overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              {/* Left: Avatar + Info */}
              <div className="flex items-start gap-4 p-5 sm:w-56">
                <div className="w-12 h-12 rounded-full bg-linear-to-br from-green-300 to-emerald-500 flex items-center justify-center text-white font-bold text-lg shrink-0 uppercase">
                  {patientData.name ? patientData.name.charAt(0) : "?"}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900 leading-tight">
                    {patientData.name}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {patientData.email}
                  </p>
                  <button onClick={handleEditOpen} className="mt-2.5 flex items-center gap-1.5 text-xs font-medium text-green-600 border border-green-200 rounded-full px-3 py-1 bg-green-50 hover:bg-green-100 transition-colors">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-3 h-3"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2.5}
                        d="M15.232 5.232l3.536 3.536M9 13l6-6m0 0l-3-3M3 21h4l10-10.5L13 7 3 17v4z"
                      />
                    </svg>
                    Edit profile
                  </button>
                </div>
              </div>

              {/* Right: Stats */}
              <div className="flex flex-wrap flex-1">
                {[
                  { label: "Age", value: `${patientData.age} years` },
                  { label: "Height", value: `${patientData.height} cm` },
                  { label: "Weight", value: `${patientData.weight} Kg` },
                  { label: "Contact", value: patientData.contactNo },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col justify-center px-5 py-4 min-w-[90px]"
                  >
                    <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                    <p className="font-semibold text-gray-800 text-sm">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Health Details */}
        <section className="-ml-25">
          <h2 className="text-lg font-bold text-gray-800 mb-3">
            Health Details
          </h2>
          <div className="bg-white rounded-2xl border border-gray-200  p-5">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {healthDetails.map((item) => (
                <div
                  key={item.label}
                  className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 hover:border-green-200 hover:bg-green-50 transition-all duration-200"
                >
                  <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                  <p className="font-semibold text-gray-800 text-sm">
                    {item.value}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Generated Report */}
        <section className="-ml-25">
          <h2 className="text-lg font-bold text-gray-800 mb-1">
            Generated Report
          </h2>
          <p className="text-xs text-gray-400 mb-3">
            Based on recorded vitals and observations, the patient's overall
            health condition appears stable. No critical indicators detected.
          </p>
          <div className="bg-white rounded-2xl border border-gray-200  p-5 space-y-5">
            {/* Report Text */}
            <div className="bg-gray-50 rounded-xl border border-gray-100 p-4">
              <p className="text-sm text-gray-600 leading-relaxed">
                {reportText}
              </p>
            </div>

            {/* Actions Row */}
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              {/* Left: Approve / Modify */}
              <div className="flex flex-col gap-3 flex-1">
                <div className="flex items-center gap-6">
                  <button
                    onClick={() => setApproved(true)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${approved
                      ? "text-green-600"
                      : "text-gray-400 hover:text-gray-600"
                      }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${approved
                        ? "border-green-500 bg-green-500"
                        : "border-gray-300"
                        }`}
                    >
                      {approved && (
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      )}
                    </span>
                    Approve Treatment
                  </button>

                  <button
                    onClick={() => setApproved(false)}
                    className={`flex items-center gap-2 text-sm font-medium transition-colors ${!approved
                      ? "text-amber-500"
                      : "text-gray-400 hover:text-gray-600"
                      }`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-all ${!approved
                        ? "border-amber-400 bg-amber-400"
                        : "border-gray-300"
                        }`}
                    >
                      {!approved && (
                        <svg
                          className="w-2.5 h-2.5 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M15.232 5.232l3.536 3.536M9 13l6-6"
                          />
                        </svg>
                      )}
                    </span>
                    Modify Treatment
                  </button>
                </div>

                {/* Follow Up Card */}
                <div className="inline-flex flex-col bg-white rounded-xl border border-gray-200  px-4 py-3 w-fit">
                  <p className="text-xs font-semibold text-gray-600 mb-2">
                    Follow up?
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {["No", "7 Days", "15 Days"].map((opt) => (
                      <label
                        key={opt}
                        className="flex items-center gap-2 cursor-pointer group"
                      >
                        <span
                          onClick={() => setFollowUp(opt)}
                          className={`w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-all cursor-pointer ${followUp === opt
                            ? "border-green-500 bg-green-500"
                            : "border-gray-300 group-hover:border-green-300"
                            }`}
                        />
                        <span
                          onClick={() => setFollowUp(opt)}
                          className={`text-xs transition-colors ${followUp === opt
                            ? "text-gray-800 font-medium"
                            : "text-gray-500"
                            }`}
                        >
                          {opt}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Export Button */}
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setExported(true);
                    setTimeout(() => setExported(false), 2000);
                  }}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold  transition-all duration-200 ${exported
                    ? "bg-green-600 text-white scale-95"
                    : "bg-green-500 hover:bg-green-600 text-white"
                    }`}
                >
                  {exported ? (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      Exported!
                    </>
                  ) : (
                    <>
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1M12 12V4m0 8l-3-3m3 3l3-3"
                        />
                      </svg>
                      Export Report
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Edit Patient Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-800">Edit Patient Profile</h2>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-600 text-xl leading-none"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              {[
                { label: "Full Name", key: "name", type: "text" },
                { label: "Email", key: "email", type: "email" },
                { label: "Age", key: "age", type: "number" },
                { label: "Height (cm)", key: "height", type: "number" },
                { label: "Weight (kg)", key: "weight", type: "number" },
                { label: "Contact Number", key: "contactNo", type: "text" },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
                  <input
                    type={type}
                    value={editForm[key] || ""}
                    onChange={(e) => setEditForm((prev) => ({ ...prev, [key]: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm text-gray-800 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition"
                    required={key === "name" || key === "email"}
                  />
                </div>
              ))}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 border border-gray-200 text-gray-600 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetails;
