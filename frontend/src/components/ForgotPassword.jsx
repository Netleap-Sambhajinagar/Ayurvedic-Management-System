import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AUTH_API } from "../config";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [focused, setFocused] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      await axios.post(`${AUTH_API}/forgot-password`, { email });
      setMessage({ ok: true, text: "If that email is registered, a reset link has been sent. Check your inbox." });
    } catch (err) {
      setMessage({ ok: false, text: err.response?.data?.message || "Something went wrong. Try again." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center leaf-bg"
      style={{ background: "linear-gradient(145deg, #f4ede0 0%, #faf6ef 55%, #edf4ee 100%)" }}>
      <div className="w-full max-w-sm px-8 anim-scale">
        {/* Logo */}
        <div className="flex items-center gap-2 mb-8">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: "linear-gradient(135deg,#1c4532,#276749)" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-xl" style={{ fontFamily: "var(--font-serif)", color: "var(--forest)" }}>Ayurveda Care</span>
        </div>

        <h2 className="text-3xl mb-1 anim-up" style={{ fontFamily: "var(--font-serif)", color: "var(--forest)" }}>Forgot password?</h2>
        <p className="text-sm mb-8 anim-up d-75" style={{ color: "var(--mist)" }}>
          Enter your registered email and we'll send you a reset link.
        </p>

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
            <div className="anim-up d-150">
              <label className="block text-xs font-medium mb-1.5 uppercase tracking-widest" style={{ color: "var(--mist)" }}>
                Email
              </label>
              <input
                type="email" required placeholder="doctor@clinic.com"
                value={email} onChange={e => setEmail(e.target.value)}
                onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
                className="input-field"
                style={{ borderColor: focused ? "var(--fern)" : undefined, background: focused ? "#fafff8" : "white" }}
              />
            </div>
            <div className="anim-up d-225">
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3"
                style={{ borderRadius: "12px", background: loading ? "var(--mist)" : "linear-gradient(135deg,var(--forest),var(--fern))" }}>
                {loading
                  ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Sending…</>
                  : "Send Reset Link →"}
              </button>
            </div>
          </form>
        )}

        <p className="text-xs text-center mt-7 anim-up d-300" style={{ color: "var(--mist)" }}>
          <span className="font-medium cursor-pointer hover:underline" style={{ color: "var(--fern)" }}
            onClick={() => navigate("/login")}>← Back to login</span>
        </p>
      </div>
    </div>
  );
}
