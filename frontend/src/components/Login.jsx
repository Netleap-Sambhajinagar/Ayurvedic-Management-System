import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        form,
        {
          headers: { "Content-Type": "application/json" }, // important
        },
      );
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("doctorEmail", res.data.doctor.email); // ✅ ADDED
      navigate("/");
    } catch (err) {
      alert(err.response?.data || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-100 via-white to-green-200 relative overflow-hidden">
      {/* 🌿 Floating Blur Leaves Effect */}
      <div className="absolute w-72 h-72 bg-green-300 rounded-full opacity-20 blur-3xl top-10 left-10 animate-pulse"></div>
      <div className="absolute w-72 h-72 bg-green-500 rounded-full opacity-20 blur-3xl bottom-10 right-10 animate-pulse"></div>

      {/* 🌱 Login Card */}
      <div className="bg-white/80 backdrop-blur-lg shadow-2xl rounded-3xl p-10 w-[380px] border border-green-100 transform transition-all duration-700 hover:scale-105">
        {/* Logo / Title */}
        <h2 className="text-3xl font-bold text-green-700 text-center mb-2 tracking-wide">
          Ayurveda Care
        </h2>
        <p className="text-sm text-gray-500 text-center mb-8">
          Welcome back 🌿
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <input
              type="email"
              name="email"
              placeholder="Email Address"
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-green-200 focus:ring-2 focus:ring-green-400 focus:outline-none transition-all"
              required
            />
          </div>

          <div>
            <input
              type="password"
              name="password"
              placeholder="Password"
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-green-200 focus:ring-2 focus:ring-green-400 focus:outline-none transition-all"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-green-300"
          >
            Login
          </button>
        </form>

        <p className="text-sm text-center text-gray-500 mt-6">
          Don’t have an account?{" "}
          <span
            onClick={() => navigate("/register")}
            className="text-green-600 font-medium cursor-pointer hover:underline"
          >
            Register
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
