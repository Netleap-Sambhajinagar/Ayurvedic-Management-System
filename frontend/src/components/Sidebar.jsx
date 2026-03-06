// // import { useState } from "react";
// import { useNavigate } from "react-router-dom";

// const Sidebar = ({ activeNav, setActiveNav }) => {
//   const navigate = useNavigate();
//   // const [isEditOpen, setIsEditOpen] = useState(false);

//   const navItems = [
//     {
//       label: "Dashboard",
//       icon: (
//         <svg
//           className="w-5 h-5"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth={1.8}
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
//           />
//         </svg>
//       ),
//       url: "/",
//     },
//     {
//       label: "Appointments",
//       icon: (
//         <svg
//           className="w-5 h-5"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth={1.8}
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
//           />
//         </svg>
//       ),
//       url: "/appointment",
//     },
//     {
//       label: "Patients",
//       icon: (
//         <svg
//           className="w-5 h-5"
//           fill="none"
//           stroke="currentColor"
//           strokeWidth={1.8}
//           viewBox="0 0 24 24"
//         >
//           <path
//             strokeLinecap="round"
//             strokeLinejoin="round"
//             d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
//           />
//         </svg>
//       ),
//       url: "/patient",
//     },
//   ];

//   return (
//     <aside className="w-60 min-h-screen bg-[#E6E6E6] flex flex-col px-3 py-6">
//       {/* Logo */}
//       <div className="px-4 mb-6">
//         <span className="text-2xl font-black text-gray-900">LOGO</span>
//       </div>

//       {/* Doctor Profile Card */}
//       <div className="bg-white rounded-2xl p-6 flex flex-col items-center shadow-sm mb-6">
//         <div className="w-20 h-20 rounded-full overflow-hidden mb-3">
//           <img
//             src="https://randomuser.me/api/portraits/women/44.jpg"
//             alt="Doctor"
//             className="w-full h-full object-cover"
//           />
//         </div>

//         <p className="text-sm font-semibold text-gray-800">Dr. Name</p>

//         <p className="text-xs text-gray-400 text-center mt-1">
//           Education Specification
//         </p>

//         <button
//           className="mt-4 text-sm border border-[#7FB53D] text-[#7FB53D] rounded-full px-5 py-1.5 hover:bg-green-50 transition"
//           onClick={() => navigate("/doctor/edit")}
//         >
//           Edit profile
//         </button>
//       </div>

//       {/* Navigation Card */}
//       <div className="bg-white rounded-2xl p-3 shadow-sm">
//         {navItems.map((item) => {
//           const isActive = activeNav === item.label;

//           return (
//             <button
//               key={item.label}
//               onClick={() => {
//                 setActiveNav(item.label);
//                 navigate(item.url);
//               }}
//               className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
//                 isActive
//                   ? "text-[#7FB53D] bg-green-50 border-l-4 border-[#7FB53D]"
//                   : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
//               }`}
//             >
//               <span className={isActive ? "text-[#7FB53D]" : "text-gray-400"}>
//                 {item.icon}
//               </span>
//               {item.label}
//             </button>
//           );
//         })}
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;

// import { useNavigate } from "react-router-dom";

// const Sidebar = ({ activeNav, setActiveNav }) => {
//   const navigate = useNavigate();

//   const navItems = [
//     { label: "Dashboard", url: "/" },
//     { label: "Appointments", url: "/appointment" },
//     { label: "Patients", url: "/patient" },
//   ];

//   return (
//     <aside className="w-60 min-h-screen bg-[#E6E6E6] flex flex-col px-3 py-6">
//       {/* Logo */}
//       <div className="px-4 mb-6">
//         <span className="text-2xl font-black text-gray-900">LOGO</span>
//       </div>

//       {/* Doctor Profile Card */}
//       <div className="bg-white rounded-2xl p-6 flex flex-col items-center shadow-sm mb-6">
//         <div className="w-20 h-20 rounded-full overflow-hidden mb-3">
//           <img
//             src="https://randomuser.me/api/portraits/women/44.jpg"
//             alt="Doctor"
//             className="w-full h-full object-cover"
//           />
//         </div>

//         <p className="text-sm font-semibold text-gray-800">Dr. Name</p>
//         <p className="text-xs text-gray-400 text-center mt-1">
//           Education / Specialization
//         </p>

//         <button
//           className="mt-4 text-sm border border-[#7FB53D] text-[#7FB53D] rounded-full px-5 py-1.5 hover:bg-green-50 transition"
//           onClick={() => navigate("/doctor/edit")}
//         >
//           Edit profile
//         </button>
//       </div>

//       {/* Navigation */}
//       <div className="bg-white rounded-2xl p-3 shadow-sm">
//         {navItems.map((item) => {
//           const isActive = activeNav === item.label;
//           return (
//             <button
//               key={item.label}
//               onClick={() => {
//                 setActiveNav(item.label);
//                 navigate(item.url);
//               }}
//               className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${
//                 isActive
//                   ? "text-[#7FB53D] bg-green-50 border-l-4 border-[#7FB53D]"
//                   : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
//               }`}
//             >
//               {item.label}
//             </button>
//           );
//         })}
//       </div>
//     </aside>
//   );
// };

// export default Sidebar;

import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";

const Sidebar = ({ activeNav, setActiveNav }) => {
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);

  useEffect(() => {
    const fetchDoctor = async () => {
      const currentEmail = localStorage.getItem("doctorEmail");
      if (!currentEmail) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/doctor?email=${currentEmail}`,
        );
        setDoctor(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchDoctor();

    window.addEventListener("profileUpdated", fetchDoctor);
    return () => window.removeEventListener("profileUpdated", fetchDoctor);
  }, []);

  const navItems = [
    { label: "Dashboard", url: "/" },
    { label: "Appointments", url: "/appointment" },
    { label: "Patients", url: "/patient" },
  ];

  return (
    <aside className="w-60 min-h-screen bg-[#E6E6E6] flex flex-col px-3 py-6">
      {/* Logo */}
      <div className="px-4 mb-6">
        <span className="text-2xl font-black text-gray-900">LOGO</span>
      </div>

      {/* Doctor Profile Card */}
      <div className="bg-white rounded-2xl p-6 flex flex-col items-center shadow-sm mb-6">
        <div className="w-20 h-20 rounded-full overflow-hidden mb-3">
          <img
            src="https://randomuser.me/api/portraits/men/44.jpg"
            alt="Doctor"
            className="w-full h-full object-cover"
          />
        </div>

        <p className="text-sm font-semibold text-gray-800">
          {doctor ? `Dr. ${doctor.name}` : "Loading..."}
        </p>
        <p className="text-xs text-gray-400 text-center mt-1">
          {doctor ? doctor.specialization : "Loading..."}
        </p>

        <button
          className="mt-4 text-sm border border-[#7FB53D] text-[#7FB53D] rounded-full px-5 py-1.5 hover:bg-green-50 transition"
          onClick={() => navigate("/doctor/edit")}
        >
          Edit profile
        </button>
      </div>

      {/* Navigation */}
      <div className="bg-white rounded-2xl p-3 shadow-sm">
        {navItems.map((item) => {
          const isActive = activeNav === item.label;
          return (
            <button
              key={item.label}
              onClick={() => {
                setActiveNav(item.label);
                navigate(item.url);
              }}
              className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all ${isActive
                  ? "text-[#7FB53D] bg-green-50 border-l-4 border-[#7FB53D]"
                  : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
