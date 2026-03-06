import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const EditDoctor = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    specialization: "",
  });
  const [loading, setLoading] = useState(true);

  const doctorEmail = localStorage.getItem("doctorEmail");

  useEffect(() => {
    const fetchDoctor = async () => {
      if (!doctorEmail) return;
      try {
        const res = await axios.get(
          `http://localhost:5000/api/doctor?email=${doctorEmail}`,
        );
        setForm({
          name: res.data.name,
          email: res.data.email,
          specialization: res.data.specialization,
        });
        setLoading(false);
      } catch (err) {
        console.error(err);
        alert("Failed to fetch doctor profile");
        navigate("/"); // redirect if error
      }
    };

    fetchDoctor();
  }, [doctorEmail, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(
        `http://localhost:5000/api/doctor?email=${doctorEmail}`,
        form,
      );
      localStorage.setItem("doctorEmail", form.email); // ✅ ADDED
      window.dispatchEvent(new Event("profileUpdated")); // ✅ Notify sidebar
      alert("Profile updated successfully!");
      navigate("/"); // redirect after save
    } catch (err) {
      alert(err.response?.data?.error || "Update failed");
    }
  };

  if (loading) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50">
      <div className="bg-white rounded-3xl p-10 w-[400px] shadow-xl">
        <h2 className="text-2xl font-bold text-green-700 mb-6 text-center">
          Edit Profile
        </h2>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            name="name"
            placeholder="Full Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
            required
          />

          <input
            name="email"
            type="email"
            placeholder="Email"
            value={form.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
            required
          />

          <input
            name="specialization"
            placeholder="Specialization"
            value={form.specialization}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
            required
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-lg font-semibold hover:bg-green-700 transition-all"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditDoctor;
