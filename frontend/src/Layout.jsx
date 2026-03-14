import { useState } from "react";
import { Route, Routes, useLocation, Navigate } from "react-router-dom";
import PatientData from "./components/PatientData";
import AppointmentData from "./components/AppointmentData";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import PatientDetails from "./components/PatientDetails";
import EditDoctor from "./components/EditDoctor";
import HistoryData from "./components/HistoryData";

const Layout = () => {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const token = localStorage.getItem("token");
  const hideSidebarRoutes = ["/login", "/register"];
  const hideSidebar = hideSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-screen font-sans bg-gray-50">
      {token && !hideSidebar && (
        <>
          {/* Mobile overlay */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 bg-black/40 z-20 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <Sidebar
            activeNav={activeNav}
            setActiveNav={setActiveNav}
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
          />
        </>
      )}

      <div className="flex-1 min-w-0">
        {/* Mobile top bar */}
        {token && !hideSidebar && (
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
            <button
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg hover:bg-gray-100 transition"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-green-500 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
              <span className="font-bold text-gray-900 text-sm">Ayurveda <span className="text-green-600">Care</span></span>
            </div>
          </div>
        )}

        <Routes>
          <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/doctor/edit" element={<ProtectedRoute><EditDoctor /></ProtectedRoute>} />
          <Route path="/appointment" element={<ProtectedRoute><AppointmentData viewType="appointments" /></ProtectedRoute>} />
          <Route path="/followups"   element={<ProtectedRoute><AppointmentData viewType="followups" /></ProtectedRoute>} />
          <Route path="/opd"         element={<ProtectedRoute><AppointmentData viewType="opd" /></ProtectedRoute>} />
          <Route path="/history"     element={<ProtectedRoute><HistoryData /></ProtectedRoute>} />
          <Route path="/patient"     element={<ProtectedRoute><PatientData /></ProtectedRoute>} />
          <Route path="/patient/:id" element={<ProtectedRoute><PatientDetails /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
};

export default Layout;
