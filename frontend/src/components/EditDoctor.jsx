import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

import { DOCTOR_API } from "../config";
const BASE = DOCTOR_API;

const EditDoctor = () => {
  const navigate  = useNavigate();
  const fileRef   = useRef(null);
  const doctorEmail = localStorage.getItem("doctorEmail");

  // ── Profile state ──────────────────────────────────────────────────────────
  const [form, setForm] = useState({ name: "", email: "", specialization: "" });
  const [avatar,      setAvatar]      = useState(null);   // base64 data-URI
  const [avatarError, setAvatarError] = useState("");
  const [saving,      setSaving]      = useState(false);
  const [profileMsg,  setProfileMsg]  = useState(null);   // { type, text }
  const [loading,     setLoading]     = useState(true);

  // ── Password state ─────────────────────────────────────────────────────────
  const [showPwSection, setShowPwSection] = useState(false);
  const [pwForm, setPwForm]   = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg,    setPwMsg]    = useState(null);          // { type, text }
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew,     setShowNew]     = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // ── Fetch doctor ───────────────────────────────────────────────────────────
  useEffect(() => {
    if (!doctorEmail) return;
    axios.get(`${BASE}/doctor?email=${doctorEmail}`)
      .then((res) => {
        setForm({ name: res.data.name, email: res.data.email, specialization: res.data.specialization });
        setAvatar(res.data.avatar || null);
        setLoading(false);
      })
      .catch(() => { alert("Failed to fetch profile"); navigate("/dashboard"); });
  }, [doctorEmail, navigate]);

  // ── Avatar file picker ─────────────────────────────────────────────────────
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    setAvatarError("");
    if (!file) return;

    if (!["image/jpeg", "image/png"].includes(file.type)) {
      setAvatarError("Only JPG and PNG files are allowed.");
      return;
    }
    if (file.size > 1_000_000) {
      setAvatarError("File size must be under 1 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => setAvatar(ev.target.result);
    reader.readAsDataURL(file);
  };

  // ── Save profile ───────────────────────────────────────────────────────────
  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setProfileMsg(null);
    try {
      await axios.put(`${BASE}/doctor?email=${doctorEmail}`, { ...form, avatar });
      localStorage.setItem("doctorEmail", form.email);
      window.dispatchEvent(new Event("profileUpdated"));
      setProfileMsg({ type: "success", text: "Profile updated successfully!" });
    } catch (err) {
      setProfileMsg({ type: "error", text: err.response?.data?.error || "Update failed." });
    } finally {
      setSaving(false);
    }
  };

  // ── Change password ────────────────────────────────────────────────────────
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPwMsg(null);

    if (pwForm.newPassword !== pwForm.confirmPassword) {
      setPwMsg({ type: "error", text: "New passwords do not match." });
      return;
    }
    if (pwForm.newPassword.length < 6) {
      setPwMsg({ type: "error", text: "New password must be at least 6 characters." });
      return;
    }

    setPwSaving(true);
    try {
      const email = localStorage.getItem("doctorEmail");
      await axios.patch(`${BASE}/doctor/change-password?email=${email}`, {
        currentPassword: pwForm.currentPassword,
        newPassword:     pwForm.newPassword,
      });
      setPwMsg({ type: "success", text: "Password changed successfully!" });
      setPwForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err) {
      setPwMsg({ type: "error", text: err.response?.data?.error || "Failed to change password." });
    } finally {
      setPwSaving(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-gray-400 text-sm">Loading profile…</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-lg mx-auto space-y-6">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/dashboard")} className="p-2 rounded-xl hover:bg-gray-200 transition text-gray-500">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Edit Profile</h1>
            <p className="text-xs text-gray-400">Update your details and profile photo</p>
          </div>
        </div>

        {/* ── Profile Card ────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-sm font-bold text-gray-700 mb-5">Profile Information</h2>

          {/* Avatar upload */}
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-green-100 flex items-center justify-center border-2 border-green-200">
                {avatar ? (
                  <img src={avatar} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-3xl font-bold text-green-600 uppercase">
                    {form.name ? form.name.charAt(0) : "D"}
                  </span>
                )}
              </div>
              {/* Camera overlay button */}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 bg-green-500 hover:bg-green-600 rounded-full flex items-center justify-center shadow-md transition"
                title="Change photo"
              >
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>
            </div>

            <div>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-sm font-semibold text-green-600 hover:text-green-700 transition"
              >
                Upload photo
              </button>
              <p className="text-xs text-gray-400 mt-0.5">JPG or PNG · Max 1 MB</p>
              {avatar && (
                <button
                  type="button"
                  onClick={() => { setAvatar(null); setAvatarError(""); }}
                  className="text-xs text-red-500 hover:text-red-700 mt-1 transition"
                >
                  Remove photo
                </button>
              )}
              {avatarError && <p className="text-xs text-red-500 mt-1">{avatarError}</p>}
            </div>

            {/* Hidden file input */}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>

          {/* Profile form */}
          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {[
              { label: "Full Name",       name: "name",           type: "text",  placeholder: "Dr. John Doe" },
              { label: "Email Address",   name: "email",          type: "email", placeholder: "doctor@example.com" },
              { label: "Specialization",  name: "specialization", type: "text",  placeholder: "Ayurvedic Physician" },
            ].map(({ label, name, type, placeholder }) => (
              <div key={name}>
                <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
                <input
                  name={name}
                  type={type}
                  value={form[name]}
                  onChange={(e) => setForm({ ...form, [e.target.name]: e.target.value })}
                  placeholder={placeholder}
                  required
                  className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition"
                />
              </div>
            ))}

            {/* Success / error message */}
            {profileMsg && (
              <div className={`text-xs px-4 py-2.5 rounded-xl font-medium ${
                profileMsg.type === "success"
                  ? "bg-green-50 text-green-700 border border-green-200"
                  : "bg-red-50 text-red-600 border border-red-200"
              }`}>
                {profileMsg.type === "success" ? "✓ " : "✕ "}{profileMsg.text}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="w-full bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Profile"}
            </button>
          </form>
        </div>

        {/* ── Change Password Card ─────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          {/* Toggle header */}
          <button
            type="button"
            onClick={() => { setShowPwSection(!showPwSection); setPwMsg(null); }}
            className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-amber-600" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-bold text-gray-800">Change Password</p>
                <p className="text-xs text-gray-400">Update your login password</p>
              </div>
            </div>
            <svg
              className={`w-4 h-4 text-gray-400 transition-transform ${showPwSection ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Collapsible password form */}
          {showPwSection && (
            <div className="px-6 pb-6 border-t border-gray-50">
              <form onSubmit={handlePasswordSubmit} className="space-y-4 mt-5">
                {/* Current password */}
                {[
                  { label: "Current Password",     key: "currentPassword", show: showCurrent, toggle: () => setShowCurrent(!showCurrent) },
                  { label: "New Password",          key: "newPassword",     show: showNew,     toggle: () => setShowNew(!showNew) },
                  { label: "Confirm New Password",  key: "confirmPassword", show: showConfirm, toggle: () => setShowConfirm(!showConfirm) },
                ].map(({ label, key, show, toggle }) => (
                  <div key={key}>
                    <label className="block text-xs font-semibold text-gray-500 mb-1">{label}</label>
                    <div className="relative">
                      <input
                        type={show ? "text" : "password"}
                        value={pwForm[key]}
                        onChange={(e) => setPwForm({ ...pwForm, [key]: e.target.value })}
                        placeholder="••••••••"
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 outline-none focus:border-green-400 focus:ring-1 focus:ring-green-100 transition pr-10"
                      />
                      <button
                        type="button"
                        onClick={toggle}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition"
                      >
                        {show ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Password strength hint */}
                {pwForm.newPassword && (
                  <div className={`text-xs px-3 py-1.5 rounded-lg ${
                    pwForm.newPassword.length >= 8 ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"
                  }`}>
                    {pwForm.newPassword.length < 6
                      ? "Too short — minimum 6 characters"
                      : pwForm.newPassword.length < 8
                      ? "Acceptable — 8+ characters recommended"
                      : "Strong password ✓"}
                  </div>
                )}

                {/* Confirm match indicator */}
                {pwForm.confirmPassword && (
                  <div className={`text-xs px-3 py-1.5 rounded-lg ${
                    pwForm.newPassword === pwForm.confirmPassword
                      ? "bg-green-50 text-green-700"
                      : "bg-red-50 text-red-600"
                  }`}>
                    {pwForm.newPassword === pwForm.confirmPassword ? "Passwords match ✓" : "Passwords do not match"}
                  </div>
                )}

                {/* Status message */}
                {pwMsg && (
                  <div className={`text-xs px-4 py-2.5 rounded-xl font-medium ${
                    pwMsg.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}>
                    {pwMsg.type === "success" ? "✓ " : "✕ "}{pwMsg.text}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={pwSaving}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-white py-2.5 rounded-xl text-sm font-semibold transition disabled:opacity-60"
                >
                  {pwSaving ? "Updating…" : "Update Password"}
                </button>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default EditDoctor;
