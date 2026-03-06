// import { useState } from "react";
// import PatientsTable from "./PatientTable";

// const PatientData = ({ patients }) => {
//   const [search, setSearch] = useState("");

//   const filtered = patients.filter((p) =>
//     p.name.toLowerCase().includes(search.toLowerCase()),
//   );

//   return (
//     <main className="flex-1 bg-white min-h-screen">
//       {/* Top bar */}
//       <div className="flex items-center justify-end gap-3 px-8 py-5 bg-white">
//         <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 w-56">
//           <svg
//             className="w-4 h-4 text-gray-400"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth={2}
//             viewBox="0 0 24 24"
//           >
//             <circle cx="11" cy="11" r="8" />
//             <path strokeLinecap="round" d="m21 21-4.35-4.35" />
//           </svg>
//           <input
//             type="text"
//             placeholder="Search patients..."
//             value={search}
//             onChange={(e) => setSearch(e.target.value)}
//             className="bg-transparent text-sm text-gray-600 placeholder-gray-400 outline-none w-full"
//           />
//         </div>
//         <button className="p-2 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
//           <svg
//             className="w-4 h-4 text-gray-500"
//             fill="none"
//             stroke="currentColor"
//             strokeWidth={2}
//             viewBox="0 0 24 24"
//           >
//             <path
//               strokeLinecap="round"
//               strokeLinejoin="round"
//               d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
//             />
//           </svg>
//         </button>
//       </div>

//       {/* Content */}
//       <div className="px-8 py-7">
//         <h1 className="text-2xl font-bold text-gray-800 mb-6">Patients Data</h1>
//         <PatientsTable patients={filtered} />
//         {filtered.length === 0 && (
//           <p className="text-center text-gray-400 py-10 text-sm">
//             No patients found.
//           </p>
//         )}
//       </div>
//     </main>
//   );
// };
// export default PatientData;

import { useState, useEffect } from "react";
import axios from "axios";
import PatientsTable from "./PatientTable";

const PatientData = () => {
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/patients");
        setPatients(res.data);
      } catch (err) {
        console.error("Failed to fetch patients", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, []);

  const filtered = patients.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <main className="flex-1 bg-gray-50 min-h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-end gap-3 px-10 py-10 bg-white">
        {/* 🔍 Search Toggle */}
        {!showSearch ? (
          <button
            onClick={() => setShowSearch(true)}
            className="p-3 bg-gray-200 rounded-xl"
          >
            <svg
              className="w-4 h-4 text-black"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path strokeLinecap="round" d="m21 21-4.35-4.35" />
            </svg>
          </button>
        ) : (
          <div className="flex items-center bg-white border rounded-xl px-3 py-2 shadow-sm">
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="outline-none text-sm w-40"
              autoFocus
            />

            <button className="ml-2 text-gray-400 hover:text-black">✕</button>
          </div>
        )}
        {/* Filter Icon */}
        <button className="p-3 bg-gray-200 rounded-xl">
          <svg
            className="w-4 h-4 text-black"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
            />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="px-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-3 -mt-[18px]">
          Patients Data
        </h1>
        <PatientsTable patients={filtered} />
        {filtered.length === 0 && (
          <p className="text-center text-gray-400 py-10 text-sm">
            No patients found.
          </p>
        )}
      </div>
    </main>
  );
};

export default PatientData;
