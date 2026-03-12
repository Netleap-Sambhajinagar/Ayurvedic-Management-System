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
  const location = useLocation();
  const token = localStorage.getItem("token");
  const hideSidebarRoutes = ["/login", "/register"];
  const hideSidebar = hideSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-screen font-sans bg-gray-50">
      {token && !hideSidebar && (
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
      )}
      <div className="flex-1">
        <Routes>
          <Route path="/" element={token ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} />

          {/* Public */}
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected */}
          <Route path="/dashboard"   element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/doctor/edit" element={<ProtectedRoute><EditDoctor /></ProtectedRoute>} />

          {/* Appointments group */}
          <Route path="/appointment" element={<ProtectedRoute><AppointmentData viewType="appointments" /></ProtectedRoute>} />
          <Route path="/followups"   element={<ProtectedRoute><AppointmentData viewType="followups" /></ProtectedRoute>} />
          <Route path="/opd"         element={<ProtectedRoute><AppointmentData viewType="opd" /></ProtectedRoute>} />
          <Route path="/history"     element={<ProtectedRoute><HistoryData /></ProtectedRoute>} />

          {/* Patients */}
          <Route path="/patient"     element={<ProtectedRoute><PatientData /></ProtectedRoute>} />
          <Route path="/patient/:id" element={<ProtectedRoute><PatientDetails /></ProtectedRoute>} />
        </Routes>
      </div>
    </div>
  );
};

export default Layout;
