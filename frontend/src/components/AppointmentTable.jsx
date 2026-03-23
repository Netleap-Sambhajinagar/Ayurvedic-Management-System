import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { PATIENTS_API } from "../config";

// Legacy component — kept for backwards compatibility but not currently used in routing.
// AppointmentData.jsx handles appointments UI. This component navigates to a patient by name match.
const AppointmentTable = ({ title, data }) => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);
  const [notFound, setNotFound] = useState(null);

  useEffect(() => {
    axios.get(PATIENTS_API).then((res) => setPatients(res.data)).catch(() => {});
  }, []);

  const handleNameClick = (name) => {
    const match = patients.find((p) => p.name.toLowerCase() === name.toLowerCase());
    if (match) {
      navigate(`/patient/${match.id}`, { state: { from: "appointments" } });
    } else {
      // Show inline message instead of alert()
      setNotFound(name);
      setTimeout(() => setNotFound(null), 3000);
    }
  };

  return (
    <div className="mb-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-4">{title}</h1>
      {notFound && (
        <div className="mb-4 px-4 py-2 rounded-xl text-sm"
          style={{ background:"rgba(193,105,79,.1)", color:"var(--terracotta)", border:"1px solid rgba(193,105,79,.2)" }}>
          Patient "{notFound}" not found in records.
        </div>
      )}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr style={{ background:"var(--parchment)", borderBottom:"1px solid var(--border)" }}>
                {["#","Name","Date","Time"].map(h => (
                  <th key={h} className="py-3 px-4 text-xs font-semibold uppercase tracking-widest" style={{ color:"var(--mist)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="trow" style={{ borderBottom:"1px solid rgba(39,103,73,.05)" }}>
                  <td className="py-3 px-4 text-xs" style={{ color:"var(--sand)", fontFamily:"var(--font-mono)" }}>{String(index+1).padStart(2,"0")}</td>
                  <td className="py-3 px-4">
                    <button className="text-sm font-medium hover:underline" style={{ color:"var(--fern)" }}
                      onClick={() => handleNameClick(item.name)}>{item.name}</button>
                  </td>
                  <td className="py-3 px-4 text-sm" style={{ color:"var(--mist)" }}>{item.date}</td>
                  <td className="py-3 px-4 text-sm" style={{ color:"var(--mist)" }}>{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AppointmentTable;
