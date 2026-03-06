import Sidebar from "./components/Sidebar";
import PatientData from "./components/PatientData";
import AppointmentData from "./components/AppointmentData";
import Dashboard from "./components/Dashboard";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import PatientDetails from "./components/PatientDetails";
import Login from "./components/Login";
import Register from "./components/Register";
import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./Layout";

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}
