import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { AUTH_API } from "../config";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [form, setForm] = useState({ newPassword: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [focused, setFocused] = useState(null);
  const [showPw, setShowPw] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      setMessage({ ok: false, text: "Passwords do not match." });
      return;
    }
    if (form.newPassword.length < 6) {
      setMessage({ ok: false, text: "Password must be at least 6 characters." });
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await axios.post(`${AUTH_API}/reset-password`, { token, newPassword: form.newPassword });
      setMessage({ ok: true, text: "Password reset successfully! Redirecting to login…" });
      setTimeout(() => navigate("/login"), 2500);
    } catch (err) {
      setMessage({ ok: false, text: err.response?.data?.message || "Reset failed. The link may have expired." });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "var(--parchment)" }}>
        <div className="text-center">
          <p className="text-xl mb-2" style={{ fontFamily: "var(--font-serif)", color: "var(--terracotta)" }}>Invalid reset link</p>
          <button className="btn-ghost mt-4" onClick={() => navigate("/forgot-password")}>Request a new one</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center leaf-bg"
      style={{ background: "linear-gradient(145deg, #f4ede0 0%, #faf6ef 55%, #edf4ee 100%)" }}>
      <div className="w-full max-w-sm px-8 anim-scale">
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#1c4532,#276749)" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-xl" style={{ fontFamily: "var(--font-serif)", color: "var(--forest)" }}>Ayurveda Care</span>
        </div>

        <h2 className="text-3xl mb-1 anim-up" style={{ fontFamily: "var(--font-serif)", color: "var(--forest)" }}>Set new password</h2>
        <p className="text-sm mb-8 anim-up d-75" style={{ color: "var(--mist)" }}>Choose a strong password for your account.</p>

        {message && (
          <div className="mb-5 px-4 py-3 rounded-xl text-sm anim-up"
            style={{
              background: message.ok ? "rgba(39,103,73,.08)" : "rgba(193,105,79,.1)",
              color: message.ok ? "var(--fern)" : "var(--terracotta)",
              border: `1px solid ${message.ok ? "rgba(39,103,73,.2)" : "rgba(193,105,79,.25)"}`,
            }}>
            {message.text}
          </div>
        )}

        {!message?.ok && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: "newPassword", label: "New Password", ph: "Min 6 characters" },
              { key: "confirmPassword", label: "Confirm Password", ph: "Repeat password" },
            ].map(({ key, label, ph }, i) => (
              <div key={key} className={`anim-up d-${(i+1)*150}`}>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-widest" style={{ color: "var(--mist)" }}>{label}</label>
                <div className="relative">
                  <input
                    type={showPw ? "text" : "password"} placeholder={ph} required
                    value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    onFocus={() => setFocused(key)} onBlur={() => setFocused(null)}
                    className="input-field pr-10"
                    style={{ borderColor: focused === key ? "var(--fern)" : undefined, background: focused === key ? "#fafff8" : "white" }}
                  />
                  {key === "newPassword" && (
                    <button type="button" onClick={() => setShowPw(p => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
                      style={{ color: "var(--mist)" }}>
                      {showPw ? "Hide" : "Show"}
                    </button>
                  )}
                </div>
              </div>
            ))}
            <div className="anim-up d-300">
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3"
                style={{ borderRadius: "12px", background: loading ? "var(--mist)" : "linear-gradient(135deg,var(--forest),var(--fern))" }}>
                {loading
                  ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Resetting…</>
                  : "Reset Password →"}
              </button>
            </div>
          </form>
        )}

        <p className="text-xs text-center mt-7 anim-up d-400" style={{ color: "var(--mist)" }}>
          <span className="font-medium cursor-pointer hover:underline" style={{ color: "var(--fern)" }}
            onClick={() => navigate("/login")}>← Back to login</span>
        </p>
      </div>
    </div>
  );
}
