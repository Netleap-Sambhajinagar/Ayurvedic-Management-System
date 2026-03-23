import { useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { ChevronDown, X } from "lucide-react";
import { DOCTOR_API } from "../config";

export default function Sidebar({ activeNav, setActiveNav, sidebarOpen, setSidebarOpen }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [doctor, setDoctor] = useState(null);
  const [apptOpen, setApptOpen] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      const email = localStorage.getItem("doctorEmail");
      if (!email) return;
      try { const r = await axios.get(`${DOCTOR_API}/doctor?email=${email}`); setDoctor(r.data); }
      catch(e) { console.error(e); }
    };
    fetch();
    window.addEventListener("profileUpdated", fetch);
    return () => window.removeEventListener("profileUpdated", fetch);
  }, []);

  useEffect(() => {
    if (["/appointment","/followups","/opd","/history"].includes(location.pathname)) setApptOpen(true);
  }, [location.pathname]);

  const at = p => location.pathname === p;
  const apptActive = ["/appointment","/followups","/opd","/history"].includes(location.pathname);

  const go = (label, path) => { setActiveNav(label); navigate(path); setSidebarOpen?.(false); };

  const NavItem = ({ label, path, icon }) => {
    const active = at(path);
    return (
      <button onClick={() => go(label, path)}
        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all mb-0.5"
        style={{
          fontFamily:"var(--font-sans)", fontWeight: active ? 500 : 400,
          background: active ? "rgba(39,103,73,.1)" : "transparent",
          color: active ? "var(--forest)" : "var(--mist)",
          borderLeft: active ? "3px solid var(--fern)" : "3px solid transparent",
          paddingLeft: active ? "16px" : "12px",
        }}
        onMouseEnter={e => { if(!active) { e.currentTarget.style.background="rgba(39,103,73,.05)"; e.currentTarget.style.color="var(--forest)"; }}}
        onMouseLeave={e => { if(!active) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="var(--mist)"; }}}>
        <span style={{ color: active ? "var(--fern)" : "var(--sand)" }}>{icon}</span>
        {label}
      </button>
    );
  };

  return (
    <aside className={`fixed lg:sticky top-0 left-0 z-30 w-64 h-screen flex flex-col py-6 overflow-y-auto transition-transform duration-300 ${sidebarOpen?"translate-x-0":"-translate-x-full"} lg:translate-x-0`}
      style={{ background:"linear-gradient(180deg,#f4ede0 0%,#faf6ef 100%)", borderRight:"1px solid var(--border)" }}>

      <button onClick={() => setSidebarOpen?.(false)} className="lg:hidden absolute top-4 right-4 p-1.5 rounded-lg" style={{ color:"var(--mist)" }}>
        <X className="w-5 h-5" />
      </button>

      {/* Logo */}
      <div className="px-5 mb-6 anim-up">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background:"linear-gradient(135deg,var(--forest),var(--fern))" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <div className="text-xl leading-none" style={{ fontFamily:"var(--font-serif)", color:"var(--forest)" }}>Ayurveda</div>
            <div className="text-xs tracking-widest font-medium" style={{ color:"var(--sage)", fontFamily:"var(--font-sans)" }}>CARE</div>
          </div>
        </div>
      </div>

      {/* Doctor card */}
      <div className="mx-3 mb-5 rounded-2xl p-4 anim-up d-150"
        style={{ background:"white", border:"1px solid var(--border)", boxShadow:"var(--shadow-sm)" }}>
        <div className="flex items-center gap-3 mb-3">
          <div className="w-11 h-11 rounded-full overflow-hidden flex items-center justify-center shrink-0"
            style={{ background:"linear-gradient(135deg,#c8e6d0,#a8d4b8)" }}>
            {doctor?.avatar
              ? <img src={doctor.avatar} alt="" className="w-full h-full object-cover" />
              : <span className="text-lg font-semibold uppercase" style={{ fontFamily:"var(--font-serif)", color:"var(--forest)" }}>{doctor?.name?.charAt(0)||"D"}</span>}
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium truncate" style={{ color:"var(--ink)", fontFamily:"var(--font-sans)" }}>
              {doctor ? `Dr. ${doctor.name}` : <span className="shimmer inline-block w-20 h-3.5 rounded" />}
            </p>
            <p className="text-xs truncate" style={{ color:"var(--mist)" }}>{doctor?.specialization || "Ayurvedic Physician"}</p>
          </div>
        </div>
        <button onClick={() => { navigate("/doctor/edit"); setSidebarOpen?.(false); }}
          className="w-full text-xs py-1.5 rounded-lg transition text-center font-medium"
          style={{ border:"1px solid var(--border)", color:"var(--fern)", fontFamily:"var(--font-sans)" }}
          onMouseEnter={e=>e.currentTarget.style.background="rgba(39,103,73,.07)"}
          onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
          Edit Profile
        </button>
      </div>

      {/* Nav */}
      <div className="mx-3 rounded-2xl px-2 py-2 flex-1 anim-up d-225"
        style={{ background:"white", border:"1px solid var(--border)", boxShadow:"var(--shadow-sm)" }}>
        <p className="text-[10px] font-medium uppercase tracking-widest px-3 py-2 mb-1" style={{ color:"var(--sand)" }}>Navigation</p>

        <NavItem label="Dashboard" path="/dashboard" icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
          </svg>} />

        {/* Appointments dropdown */}
        <div>
          <button onClick={() => setApptOpen(p=>!p)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all mb-0.5"
            style={{
              fontFamily:"var(--font-sans)", fontWeight: apptActive ? 500 : 400,
              background: apptActive ? "rgba(39,103,73,.1)" : "transparent",
              color: apptActive ? "var(--forest)" : "var(--mist)",
              borderLeft: apptActive ? "3px solid var(--fern)" : "3px solid transparent",
              paddingLeft: apptActive ? "16px" : "12px",
            }}>
            <span style={{ color: apptActive ? "var(--fern)" : "var(--sand)" }}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </span>
            <span className="flex-1 text-left">Appointments</span>
            <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200" style={{ transform: apptOpen?"rotate(180deg)":"rotate(0)", color: apptActive ? "var(--fern)":"var(--sand)" }} />
          </button>
          {apptOpen && (
            <div className="ml-4 pl-3 pb-1 flex flex-col gap-0.5 anim-up" style={{ borderLeft:"1.5px solid var(--border)" }}>
              {[["Appointments","/appointment"],["Follow-ups","/followups"],["OPD","/opd"],["History","/history"]].map(([label,path])=>{
                const active = at(path);
                return (
                  <button key={path} onClick={() => go(label,path)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all"
                    style={{ fontFamily:"var(--font-sans)", color: active?"var(--forest)":"var(--mist)", fontWeight: active?500:400, background: active?"rgba(39,103,73,.08)":"transparent" }}
                    onMouseEnter={e=>{if(!active){e.currentTarget.style.background="rgba(39,103,73,.05)";e.currentTarget.style.color="var(--forest)"}}}
                    onMouseLeave={e=>{if(!active){e.currentTarget.style.background="transparent";e.currentTarget.style.color="var(--mist)"}}}>
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: active?"var(--fern)":"var(--sand)" }} />
                    {label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <NavItem label="Patients" path="/patient" icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>} />
      </div>

      {/* Logout */}
      <button onClick={() => { localStorage.removeItem("token"); localStorage.removeItem("doctorEmail"); navigate("/login"); }}
        className="mx-3 mt-4 flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm transition-all anim-up d-300"
        style={{ fontFamily:"var(--font-sans)", color:"var(--terracotta)", background:"transparent" }}
        onMouseEnter={e=>e.currentTarget.style.background="rgba(193,105,79,.08)"}
        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H6a2 2 0 01-2-2V7a2 2 0 012-2h5a2 2 0 012 2v1" />
        </svg>
        Logout
      </button>
    </aside>
  );
}
