import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown } from "lucide-react";

const Sidebar = ({ activeNav, setActiveNav }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [doctor, setDoctor] = useState(null);
  const [appointmentsOpen, setAppointmentsOpen] = useState(false);

  useEffect(() => {
    const fetchDoctor = async () => {
      const currentEmail = localStorage.getItem("doctorEmail");
      if (!currentEmail) return;
      try {
        const res = await axios.get(`http://localhost:5000/api/doctor?email=${currentEmail}`);
        setDoctor(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchDoctor();
    window.addEventListener("profileUpdated", fetchDoctor);
    return () => window.removeEventListener("profileUpdated", fetchDoctor);
  }, []);

  // Auto-open the dropdown if we're on a sub-route
  useEffect(() => {
    if (
      location.pathname === "/appointment" ||
      location.pathname === "/followups" ||
      location.pathname === "/opd" ||
      location.pathname === "/history"
    ) {
      setAppointmentsOpen(true);
    }
  }, [location.pathname]);

  const isActive = (path) =>
    path === "/dashboard"
      ? location.pathname === "/dashboard"
      : location.pathname === path;

  const isAppointmentGroupActive =
    location.pathname === "/appointment" ||
    location.pathname === "/followups" ||
    location.pathname === "/opd" ||
    location.pathname === "/history";

  const navItemClass = (active) =>
    `w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all mb-1 ${
      active
        ? "text-[#7FB53D] bg-green-50 border-l-4 border-[#7FB53D]"
        : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
    }`;

  const iconClass = (active) => (active ? "text-[#7FB53D]" : "text-gray-400");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("doctorEmail");
    navigate("/login");
  };

  return (
    <aside className="w-60 h-screen sticky top-0 bg-[#E6E6E6] flex flex-col px-3 py-6 overflow-y-auto">
      {/* Logo */}
      <div className="px-4 mb-6">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-green-500 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-xl font-black text-gray-900 leading-tight">
            Ayurveda<br /><span className="text-green-600">Care</span>
          </span>
        </div>
      </div>

      {/* Doctor Profile Card */}
      <div className="bg-white rounded-2xl p-5 flex flex-col items-center shadow-sm mb-6">
        <div className="w-16 h-16 rounded-full overflow-hidden mb-3 bg-green-100 flex items-center justify-center">
          {doctor?.avatar ? (
            <img src={doctor.avatar} alt="Doctor" className="w-full h-full object-cover" />
          ) : (
            <span className="text-2xl font-bold text-green-600 uppercase">
              {doctor?.name ? doctor.name.charAt(0) : "D"}
            </span>
          )}
        </div>
        <p className="text-sm font-semibold text-gray-800">
          {doctor ? `Dr. ${doctor.name}` : "Loading..."}
        </p>
        <p className="text-xs text-gray-400 text-center mt-0.5">
          {doctor?.specialization || "Ayurvedic Physician"}
        </p>
        <button
          className="mt-3 text-xs border border-[#7FB53D] text-[#7FB53D] rounded-full px-4 py-1 hover:bg-green-50 transition"
          onClick={() => navigate("/doctor/edit")}
        >
          Edit profile
        </button>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-2xl p-2 shadow-sm flex-1">
        {/* Dashboard */}
        <button
          onClick={() => { setActiveNav("Dashboard"); navigate("/dashboard"); }}
          className={navItemClass(isActive("/dashboard"))}
        >
          <span className={iconClass(isActive("/dashboard"))}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </span>
          Dashboard
        </button>

        {/* Appointments Dropdown */}
        <div className="mb-1">
          <button
            onClick={() => setAppointmentsOpen((prev) => !prev)}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-all ${
              isAppointmentGroupActive
                ? "text-[#7FB53D] bg-green-50 border-l-4 border-[#7FB53D]"
                : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
            }`}
          >
            <span className={iconClass(isAppointmentGroupActive)}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            <span className="flex-1 text-left">Appointments</span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-200 ${appointmentsOpen ? "rotate-180" : ""} ${isAppointmentGroupActive ? "text-[#7FB53D]" : "text-gray-400"}`}
            />
          </button>

          {/* Dropdown Items */}
          {appointmentsOpen && (
            <div className="ml-4 mt-1 border-l-2 border-gray-200 pl-3 flex flex-col gap-0.5">
              {/* Appointments sub-item */}
              <button
                onClick={() => { setActiveNav("Appointments"); navigate("/appointment"); }}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive("/appointment")
                    ? "text-[#7FB53D] bg-green-50"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Appointments
              </button>

              {/* Follow-ups sub-item */}
              <button
                onClick={() => { setActiveNav("Follow-ups"); navigate("/followups"); }}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive("/followups")
                    ? "text-[#7FB53D] bg-green-50"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Follow-ups
              </button>

              {/* OPD sub-item */}
              <button
                onClick={() => { setActiveNav("OPD"); navigate("/opd"); }}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive("/opd")
                    ? "text-[#7FB53D] bg-green-50"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                OPD
              </button>

              {/* History sub-item */}
              <button
                onClick={() => { setActiveNav("History"); navigate("/history"); }}
                className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive("/history")
                    ? "text-[#7FB53D] bg-green-50"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                History
              </button>
            </div>
          )}
        </div>

        {/* Patients */}
        <button
          onClick={() => { setActiveNav("Patients"); navigate("/patient"); }}
          className={navItemClass(isActive("/patient"))}
        >
          <span className={iconClass(isActive("/patient"))}>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </span>
          Patients
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="mt-4 flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition w-full"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
        </svg>
        Logout
      </button>
    </aside>
  );
};

export default Sidebar;
