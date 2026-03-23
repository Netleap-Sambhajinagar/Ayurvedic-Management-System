import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AUTH_API } from "../config";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await axios.post(`${AUTH_API}/login`, form, {
        headers: { "Content-Type": "application/json" },
      });
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("doctorEmail", res.data.doctor.email);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex leaf-bg" style={{ background: "linear-gradient(145deg, #f4ede0 0%, #faf6ef 55%, #edf4ee 100%)" }}>
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] shrink-0 p-12 relative overflow-hidden"
        style={{ background: "linear-gradient(160deg, #1c4532 0%, #276749 60%, #3d7a5a 100%)" }}>
        <div className="absolute w-80 h-80 rounded-full anim-float" style={{ background:"rgba(255,255,255,.05)", top:"-80px", right:"-80px" }} />
        <div className="absolute w-56 h-56 rounded-full anim-float" style={{ background:"rgba(255,255,255,.04)", bottom:"60px", left:"-40px", animationDelay:"2s" }} />
        <svg className="absolute bottom-0 right-0 opacity-10" width="260" height="260" viewBox="0 0 200 200">
          <path d="M100 10 Q160 50 155 110 Q100 165 45 110 Q40 50 100 10Z" fill="white" />
          <path d="M100 10 Q100 90 100 165" fill="none" stroke="white" strokeWidth="1.5" strokeDasharray="1000" className="anim-line" />
        </svg>
        <div>
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6" style={{ background:"rgba(255,255,255,.15)" }}>
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-light text-white mb-3 leading-tight" style={{ fontFamily:"var(--font-serif)" }}>
            Ayurveda<br /><em>Care</em>
          </h1>
          <p className="text-sm leading-relaxed" style={{ color:"rgba(255,255,255,.65)", fontFamily:"var(--font-sans)" }}>
            Ancient wisdom meets modern medicine. Manage your patients' dosha balance with precision and care.
          </p>
        </div>
        <div className="space-y-4">
          {["Dosha Analysis & Tracking","Patient Visit History","AI-Generated Reports"].map((f,i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0" style={{ background:"rgba(255,255,255,.15)" }}>
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <span className="text-sm" style={{ color:"rgba(255,255,255,.75)", fontFamily:"var(--font-sans)" }}>{f}</span>
            </div>
          ))}
        </div>
        <p className="text-xs" style={{ color:"rgba(255,255,255,.35)", fontFamily:"var(--font-sans)" }}>© 2025 Ayurveda Care System</p>
      </div>

      {/* Right: form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-sm anim-scale">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background:"linear-gradient(135deg,#1c4532,#276749)" }}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <span className="text-xl" style={{ fontFamily:"var(--font-serif)", color:"var(--forest)" }}>Ayurveda Care</span>
          </div>

          <div className="anim-up">
            <h2 className="text-3xl mb-1" style={{ fontFamily:"var(--font-serif)", color:"var(--forest)" }}>Welcome back</h2>
            <p className="text-sm mb-8" style={{ color:"var(--mist)" }}>Sign in to your practice dashboard</p>
          </div>

          {/* Inline error — no more alert() */}
          {error && (
            <div className="mb-4 px-4 py-3 rounded-xl text-sm anim-up" style={{ background:"rgba(193,105,79,.1)", color:"var(--terracotta)", border:"1px solid rgba(193,105,79,.25)" }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {[{name:"email",label:"Email",type:"email",ph:"doctor@clinic.com"},{name:"password",label:"Password",type:"password",ph:"••••••••"}].map(({name,label,type,ph},i) => (
              <div key={name} className={`anim-up d-${(i+1)*150}`}>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-widest" style={{ color:"var(--mist)" }}>{label}</label>
                <input type={type} name={name} placeholder={ph} required
                  className="input-field"
                  style={{ borderColor: focused===name ? "var(--fern)" : undefined, background: focused===name ? "#fafff8" : "white" }}
                  onChange={e => setForm({...form,[e.target.name]:e.target.value})}
                  onFocus={() => setFocused(name)} onBlur={() => setFocused(null)} />
              </div>
            ))}
            <div className="flex justify-end anim-up d-225">
              <span className="text-xs cursor-pointer hover:underline" style={{ color:"var(--fern)" }}
                onClick={() => navigate("/forgot-password")}>Forgot password?</span>
            </div>
            <div className="anim-up d-300 pt-1">
              <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3"
                style={{ borderRadius:"12px", background: loading?"var(--mist)":"linear-gradient(135deg,var(--forest),var(--fern))" }}>
                {loading ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/></svg> Signing in…</> : "Sign In →"}
              </button>
            </div>
          </form>

          <p className="text-xs text-center mt-7 anim-up d-400" style={{ color:"var(--mist)" }}>
            New doctor?{" "}
            <span className="font-medium cursor-pointer hover:underline" style={{ color:"var(--fern)" }} onClick={() => navigate("/register")}>Create account</span>
          </p>

          <div className="flex items-center gap-2 mt-8 anim-up d-500">
            <div className="flex-1 h-px" style={{ background:"var(--border)" }} />
            <span className="text-xs px-2" style={{ color:"var(--sand)", fontFamily:"var(--font-serif)", fontStyle:"italic" }}>Vata · Pitta · Kapha</span>
            <div className="flex-1 h-px" style={{ background:"var(--border)" }} />
          </div>
        </div>
      </div>
    </div>
  );
}
