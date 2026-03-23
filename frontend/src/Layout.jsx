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
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";

export default function Layout() {
  const [activeNav, setActiveNav] = useState("Dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const token = localStorage.getItem("token");
  const hideSidebar = ["/login","/register","/forgot-password","/reset-password"].includes(location.pathname);

  return (
    <div className="flex min-h-screen" style={{ fontFamily:"var(--font-sans)", background:"var(--parchment)" }}>
      {token && !hideSidebar && (
        <>
          {sidebarOpen && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={()=>setSidebarOpen(false)}/>}
          <Sidebar activeNav={activeNav} setActiveNav={setActiveNav} sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen}/>
        </>
      )}
      <div className="flex-1 min-w-0">
        {token && !hideSidebar && (
          <div className="lg:hidden flex items-center gap-3 px-4 py-3 border-b sticky top-0 z-10 shadow-sm"
            style={{ background:"white", borderColor:"var(--border)" }}>
            <button onClick={()=>setSidebarOpen(true)} className="p-2 rounded-xl transition" style={{ background:"var(--parchment)" }}>
              <svg className="w-5 h-5" style={{ color:"var(--sage)" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
              </svg>
            </button>
            <span className="text-lg" style={{ fontFamily:"var(--font-serif)", color:"var(--forest)" }}>Ayurveda <span style={{ color:"var(--sage)" }}>Care</span></span>
          </div>
        )}
        <Routes>
          <Route path="/"            element={token?<Navigate to="/dashboard" replace/>:<Navigate to="/login" replace/>}/>
          <Route path="/login"           element={<Login/>}/>
          <Route path="/register"        element={<Register/>}/>
          <Route path="/forgot-password" element={<ForgotPassword/>}/>
          <Route path="/reset-password"  element={<ResetPassword/>}/>
          <Route path="/dashboard"   element={<ProtectedRoute><Dashboard/></ProtectedRoute>}/>
          <Route path="/doctor/edit" element={<ProtectedRoute><EditDoctor/></ProtectedRoute>}/>
          <Route path="/appointment" element={<ProtectedRoute><AppointmentData viewType="appointments"/></ProtectedRoute>}/>
          <Route path="/followups"   element={<ProtectedRoute><AppointmentData viewType="followups"/></ProtectedRoute>}/>
          <Route path="/opd"         element={<ProtectedRoute><AppointmentData viewType="opd"/></ProtectedRoute>}/>
          <Route path="/history"     element={<ProtectedRoute><HistoryData/></ProtectedRoute>}/>
          <Route path="/patient"     element={<ProtectedRoute><PatientData/></ProtectedRoute>}/>
          <Route path="/patient/:id" element={<ProtectedRoute><PatientDetails/></ProtectedRoute>}/>
        </Routes>
      </div>
    </div>
  );
}
