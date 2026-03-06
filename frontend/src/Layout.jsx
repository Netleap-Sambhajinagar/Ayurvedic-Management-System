import { useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
// import patientsData from "./utils/patientData"; // ❌ Removed
import PatientData from "./components/PatientData";
import AppointmentData from "./components/AppointmentData";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";
import Register from "./components/Register";
import Sidebar from "./components/Sidebar";
import ProtectedRoute from "./components/ProtectedRoute";
import PatientDetails from "./components/PatientDetails";
import EditDoctor from "./components/EditDoctor";

const Layout = () => {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const location = useLocation();

  const token = localStorage.getItem("token");

  // Pages where sidebar should NOT appear
  const hideSidebarRoutes = ["/login", "/register"];
  const hideSidebar = hideSidebarRoutes.includes(location.pathname);

  return (
    <div className="flex min-h-screen font-sans bg-gray-50">
      {/* Sidebar only if logged in and not on login/register */}
      {token && !hideSidebar && (
        <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} />
      )}

      <div className="flex-1">
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/doctor/edit"
            element={
              <ProtectedRoute>
                <EditDoctor />
              </ProtectedRoute>
            }
          />

          <Route
            path="/appointment"
            element={
              <ProtectedRoute>
                <AppointmentData />
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient"
            element={
              <ProtectedRoute>
                <PatientData /> {/* ✅ Removed prop */}
              </ProtectedRoute>
            }
          />

          <Route
            path="/patient/:id"
            element={
              <ProtectedRoute>
                <PatientDetails />
              </ProtectedRoute>
            }
          />
        </Routes>
      </div>
    </div>
  );
};

export default Layout;
