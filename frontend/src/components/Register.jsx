import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AUTH_API } from "../config";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:"", email:"", specialization:"", password:"" });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    try {
      const res = await axios.post(`${AUTH_API}/register`, form);
      setMessage({ ok: true, text: res.data.message || "Registration successful! Redirecting to login…" });
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage({ ok: false, text: err.response?.data?.message || "Registration failed. Please try again." });
    } finally {
      setLoading(false);
    }
  };

  const fields = [
    { name:"name",           label:"Full Name",      type:"text",     ph:"Dr. Firstname Lastname" },
    { name:"email",          label:"Email Address",  type:"email",    ph:"doctor@clinic.com" },
    { name:"specialization", label:"Specialization", type:"text",     ph:"e.g. Ayurvedic Physician" },
    { name:"password",       label:"Password",       type:"password", ph:"••••••••" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center leaf-bg py-10 px-4"
      style={{ background:"linear-gradient(145deg,#f4ede0 0%,#faf6ef 55%,#edf4ee 100%)" }}>
      <div className="fixed w-96 h-96 rounded-full pointer-events-none anim-float" style={{ background:"radial-gradient(circle,rgba(39,103,73,.1) 0%,transparent 70%)", top:"-100px", right:"-100px" }} />
      <div className="fixed w-72 h-72 rounded-full pointer-events-none anim-float" style={{ background:"radial-gradient(circle,rgba(193,105,79,.08) 0%,transparent 70%)", bottom:"-60px", left:"-60px", animationDelay:"2s" }} />

      <div className="w-full max-w-md anim-scale relative">
        <button onClick={() => navigate("/login")} className="flex items-center gap-1.5 text-sm mb-6 anim-up" style={{ color:"var(--mist)" }}
          onMouseEnter={e=>e.currentTarget.style.color="var(--fern)"} onMouseLeave={e=>e.currentTarget.style.color="var(--mist)"}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/></svg>
          Back to sign in
        </button>

        <div className="card p-8 lg:p-10" style={{ background:"rgba(255,255,255,.92)", backdropFilter:"blur(12px)" }}>
          <div className="flex items-center gap-3 mb-8 anim-up">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0" style={{ background:"linear-gradient(135deg,#1c4532,#276749)" }}>
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl" style={{ fontFamily:"var(--font-serif)", color:"var(--forest)" }}>Join the Practice</h2>
              <p className="text-xs" style={{ color:"var(--mist)" }}>Doctor registration</p>
            </div>
          </div>

          {/* Inline message — no alert() */}
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

          <form onSubmit={handleSubmit} className="space-y-4">
            {fields.map(({ name,label,type,ph }, i) => (
              <div key={name} className={`anim-up d-${(i+1)*100+75}`}>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-widest" style={{ color:"var(--mist)" }}>{label}</label>
                <input type={type} name={name} placeholder={ph} value={form[name]} required
                  className="input-field"
                  style={{ borderColor: focused===name ? "var(--fern)" : undefined, background: focused===name ? "#fafff8" : "white" }}
                  onChange={e => setForm({...form,[e.target.name]:e.target.value})}
                  onFocus={() => setFocused(name)} onBlur={() => setFocused(null)} />
              </div>
            ))}
            <div className="anim-up d-600 pt-1">
              <button type="submit" disabled={loading || message?.ok} className="btn-primary w-full justify-center py-3"
                style={{ borderRadius:"12px", background: (loading || message?.ok) ? "var(--mist)" : undefined }}>
                {loading
                  ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Registering…</>
                  : "Create Account →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
