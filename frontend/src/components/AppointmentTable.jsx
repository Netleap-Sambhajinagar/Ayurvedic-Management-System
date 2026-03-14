import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { PATIENTS_API } from "../config";

const AppointmentTable = ({ title, data }) => {
  const navigate = useNavigate();
  const [patients, setPatients] = useState([]);

  useEffect(() => {
    axios.get(PATIENTS_API).then((res) => {
      setPatients(res.data);
    });
  }, []);

  const handleNameClick = (name) => {
    const match = patients.find(
      (p) => p.name.toLowerCase() === name.toLowerCase(),
    );
    if (match) {
      navigate(`/patient/${match.id}`);
    } else {
      alert("Patient profile not found in records.");
    }
  };

  return (
    <div className="mb-10">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{title}</h1>
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="bg-gray-100 text-gray-700 rounded-lg">
                <th className="py-3 px-4 rounded-l-lg">Sr.No</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 rounded-r-lg">Time</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr
                  key={index}
                  className="hover:bg-green-50 transition duration-200"
                >
                  <td className="py-3 px-4">{index + 1}</td>
                  <td
                    className="py-3 px-4 text-green-600 font-medium cursor-pointer hover:underline"
                    onClick={() => handleNameClick(item.name)}
                  >
                    {item.name}
                  </td>
                  <td className="py-3 px-4">{item.date}</td>
                  <td className="py-3 px-4">{item.time}</td>
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
