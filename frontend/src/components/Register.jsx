// import { useState } from "react";
// import axios from "axios";
// import { useNavigate } from "react-router-dom";

// const Register = () => {
//   const navigate = useNavigate();

//   const [form, setForm] = useState({
//     name: "",
//     email: "",
//     password: "",
//   });

//   const handleChange = (e) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     try {
//       const res = await axios.post(
//         "http://localhost:5000/api/auth/register",
//         form,
//       );
//       alert(res.data);
//       navigate("/login");
//     } catch (err) {
//       alert(err.response?.data || "Registration failed");
//     }
//   };

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-green-200 relative overflow-hidden">
//       {/* 🌿 Floating Blur Effects */}
//       <div className="absolute w-72 h-72 bg-green-400 rounded-full opacity-20 blur-3xl top-10 right-10 animate-pulse"></div>
//       <div className="absolute w-72 h-72 bg-green-600 rounded-full opacity-20 blur-3xl bottom-10 left-10 animate-pulse"></div>

//       {/* 🌱 Register Card */}
//       <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-10 w-[400px] border border-green-100 transform transition-all duration-700 hover:scale-105">
//         <h2 className="text-3xl font-bold text-green-700 text-center mb-2 tracking-wide">
//           Ayurveda Care
//         </h2>

//         <p className="text-sm text-gray-500 text-center mb-8">
//           Create your account 🌿
//         </p>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <input
//             name="name"
//             placeholder="Full Name"
//             onChange={handleChange}
//             className="w-full px-4 py-3 rounded-xl border border-green-200 focus:ring-2 focus:ring-green-400 focus:outline-none transition-all"
//             required
//           />

//           <input
//             type="email"
//             name="email"
//             placeholder="Email Address"
//             onChange={handleChange}
//             className="w-full px-4 py-3 rounded-xl border border-green-200 focus:ring-2 focus:ring-green-400 focus:outline-none transition-all"
//             required
//           />

//           <input
//             type="password"
//             name="password"
//             placeholder="Password"
//             onChange={handleChange}
//             className="w-full px-4 py-3 rounded-xl border border-green-200 focus:ring-2 focus:ring-green-400 focus:outline-none transition-all"
//             required
//           />

//           <button
//             type="submit"
//             className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-green-300"
//           >
//             Register
//           </button>
//         </form>

//         <p className="text-sm text-center text-gray-500 mt-6">
//           Already have an account?{" "}
//           <span
//             onClick={() => navigate("/login")}
//             className="text-green-600 font-medium cursor-pointer hover:underline"
//           >
//             Login
//           </span>
//         </p>
//       </div>
//     </div>
//   );
// };

// export default Register;

import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    specialization: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        form,
      );
      alert(res.data.message); // ✅ FIXED
      navigate("/login");
    } catch (err) {
      alert(
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Registration failed"
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-green-200 relative overflow-hidden">
      <div className="absolute w-72 h-72 bg-green-400 rounded-full opacity-20 blur-3xl top-10 right-10 animate-pulse"></div>
      <div className="absolute w-72 h-72 bg-green-600 rounded-full opacity-20 blur-3xl bottom-10 left-10 animate-pulse"></div>

      <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-10 w-[400px] border border-green-100 transform transition-all duration-700 hover:scale-105">
        <h2 className="text-3xl font-bold text-green-700 text-center mb-2 tracking-wide">
          Ayurveda Care
        </h2>

        <p className="text-sm text-gray-500 text-center mb-8">
          Doctor Registration 🌿
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <input
            name="name"
            placeholder="Full Name"
            onChange={handleChange}
            value={form.name}
            className="w-full px-4 py-3 rounded-xl border border-green-200 focus:ring-2 focus:ring-green-400 focus:outline-none transition-all"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            onChange={handleChange}
            value={form.email}
            className="w-full px-4 py-3 rounded-xl border border-green-200 focus:ring-2 focus:ring-green-400 focus:outline-none transition-all"
            required
          />

          {/* ✅ NEW FIELD */}
          <input
            name="specialization"
            placeholder="Specialization (e.g. Cardiologist)"
            onChange={handleChange}
            value={form.specialization}
            className="w-full px-4 py-3 rounded-xl border border-green-200 focus:ring-2 focus:ring-green-400 focus:outline-none transition-all"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            onChange={handleChange}
            value={form.password}
            className="w-full px-4 py-3 rounded-xl border border-green-200 focus:ring-2 focus:ring-green-400 focus:outline-none transition-all"
            required
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-green-300"
          >
            Register
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            className="text-green-600 font-medium cursor-pointer hover:underline"
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
};

export default Register;
