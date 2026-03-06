// import AppointmentTable from "./AppointmentTable";

// const AppointmentData = () => {
//   const sampleData = [
//     { name: "Sherya Mehta", date: "2-03-2026", time: "2:00 PM" },
//     { name: "Sherya Mehta", date: "2-03-2026", time: "2:00 PM" },
//     { name: "Sherya Mehta", date: "2-03-2026", time: "2:00 PM" },
//     { name: "Sherya Mehta", date: "2-03-2026", time: "2:00 PM" },
//   ];

//   return (
//     <div className="flex-1 bg-gray-50 min-h-screen">
//       {/* Sidebar */}
//       <div className="bg-gray-200">{/* Sidebar content here */}</div>

//       {/* Main Content */}
//       <div className="flex-1 p-10">
//         {/* Top Right Icons */}
//         <div className="flex justify-end gap-3 mb-6">
//           <button className="p-3 bg-gray-200 rounded-xl ">
//             <svg
//               className="w-4 h-4 text-black"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth={2}
//               viewBox="0 0 24 24"
//             >
//               <circle cx="11" cy="11" r="8" />
//               <path strokeLinecap="round" d="m21 21-4.35-4.35" />
//             </svg>
//           </button>
//           <button className="p-3 bg-gray-200 rounded-xl ">
//             <svg
//               className="w-4 h-4 text-black"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth={2}
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
//               />
//             </svg>
//           </button>
//         </div>

//         <AppointmentTable title="Today’s Appointments" data={sampleData} />

//         <AppointmentTable title="Follow ups" data={sampleData.slice(0, 3)} />

//         <AppointmentTable title="OPD" data={sampleData.slice(0, 2)} />
//       </div>
//     </div>
//   );
// };

// export default AppointmentData;

// import { useState } from "react";
// import AppointmentTable from "./AppointmentTable";

// const AppointmentData = () => {
//   const [showSearch, setShowSearch] = useState(false);
//   const [searchText, setSearchText] = useState("");

//   const sampleData = [
//     { name: "Sherya Mehta", date: "2-03-2026", time: "2:00 PM" },
//     { name: "Rahul Sharma", date: "3-03-2026", time: "3:30 PM" },
//     { name: "Priya Patil", date: "4-03-2026", time: "4:00 PM" },
//     { name: "Amit Verma", date: "5-03-2026", time: "5:00 PM" },
//   ];

//   // 🔎 Filter logic
//   const filteredData = sampleData.filter((item) =>
//     item.name.toLowerCase().includes(searchText.toLowerCase()),
//   );

//   return (
//     <div className="flex-1 bg-gray-50 min-h-screen">
//       <div className="flex-1 p-10">
//         {/* Top Right Section */}
//         <div className="flex justify-end gap-3 mb-6 items-center">
//           {/* 🔍 Search Toggle */}
//           {!showSearch ? (
//             <button
//               onClick={() => setShowSearch(true)}
//               className="p-3 bg-gray-200 rounded-xl"
//             >
//               <svg
//                 className="w-4 h-4 text-black"
//                 fill="none"
//                 stroke="currentColor"
//                 strokeWidth={2}
//                 viewBox="0 0 24 24"
//               >
//                 <circle cx="11" cy="11" r="8" />
//                 <path strokeLinecap="round" d="m21 21-4.35-4.35" />
//               </svg>
//             </button>
//           ) : (
//             <div className="flex items-center bg-white border rounded-xl px-3 py-2 shadow-sm">
//               <input
//                 type="text"
//                 placeholder="Search by name..."
//                 value={searchText}
//                 onChange={(e) => setSearchText(e.target.value)}
//                 className="outline-none text-sm w-40"
//                 autoFocus
//               />

//               <button
//                 onClick={() => {
//                   setShowSearch(false);
//                   setSearchText("");
//                 }}
//                 className="ml-2 text-gray-400 hover:text-black"
//               >
//                 ✕
//               </button>
//             </div>
//           )}

//           {/* Filter Icon */}
//           <button className="p-3 bg-gray-200 rounded-xl">
//             <svg
//               className="w-4 h-4 text-black"
//               fill="none"
//               stroke="currentColor"
//               strokeWidth={2}
//               viewBox="0 0 24 24"
//             >
//               <path
//                 strokeLinecap="round"
//                 strokeLinejoin="round"
//                 d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
//               />
//             </svg>
//           </button>
//         </div>

//         {/* Tables with Filtered Data */}
//         <AppointmentTable title="Today’s Appointments" data={filteredData} />
//         <AppointmentTable title="Follow ups" data={filteredData.slice(0, 3)} />
//         <AppointmentTable title="OPD" data={filteredData.slice(0, 2)} />
//       </div>
//     </div>
//   );
// };

// export default AppointmentData;

import { useState } from "react";
import AppointmentTable from "./AppointmentTable";

const AppointmentData = () => {
  const [showSearch, setShowSearch] = useState(false);
  const [searchText, setSearchText] = useState("");

  // ✅ Separate data for each table
  const todaysAppointments = [
    { name: "Sherya Mehta", date: "2-03-2026", time: "2:00 PM" },
    { name: "Rahul Sharma", date: "3-03-2026", time: "3:30 PM" },
  ];

  const followUps = [
    { name: "Priya Patil", date: "4-03-2026", time: "4:00 PM" },
    { name: "Amit Verma", date: "5-03-2026", time: "5:00 PM" },
    { name: "Sherya Mehta", date: "2-03-2026", time: "2:00 PM" },
  ];

  const opdAppointments = [
    { name: "Neha Joshi", date: "6-03-2026", time: "1:00 PM" },
    { name: "Karan Shah", date: "7-03-2026", time: "11:00 AM" },
  ];

  // ✅ Filter each table separately
  const filteredToday = todaysAppointments.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const filteredFollowUps = followUps.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  const filteredOPD = opdAppointments.filter((item) =>
    item.name.toLowerCase().includes(searchText.toLowerCase()),
  );

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      <div className="flex-1 p-10">
        {/* 🔍 Top Right Section */}

        <div className="flex justify-end gap-3 mb-6 items-center">
          {" "}
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
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="outline-none text-sm w-40"
                autoFocus
              />

              <button
                onClick={() => {
                  setShowSearch(false);
                  setSearchText("");
                }}
                className="ml-2 text-gray-400 hover:text-black"
              >
                ✕
              </button>
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

        {/* ✅ Each table gets its own filtered data */}
        <AppointmentTable title="Today’s Appointments" data={filteredToday} />
        <AppointmentTable title="Follow Ups" data={filteredFollowUps} />
        <AppointmentTable title="OPD" data={filteredOPD} />
      </div>
    </div>
  );
};

export default AppointmentData;
