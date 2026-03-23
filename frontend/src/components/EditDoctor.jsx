import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { DOCTOR_API } from "../config";

export default function EditDoctor() {
  const navigate = useNavigate();
  const fileRef = useRef(null);
  const doctorEmail = localStorage.getItem("doctorEmail");
  const [form, setForm] = useState({ name:"", email:"", specialization:"" });
  const [avatar, setAvatar] = useState(null);
  const [avatarErr, setAvatarErr] = useState("");
  const [saving, setSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState(null);
  const [loading, setLoading] = useState(true);
  const [focused, setFocused] = useState(null);
  const [showPw, setShowPw] = useState(false);
  const [pwForm, setPwForm] = useState({ currentPassword:"", newPassword:"", confirmPassword:"" });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);
  const [pwFocused, setPwFocused] = useState(null);
  const [showFields, setShowFields] = useState({ cur:false, nw:false, cf:false });

  useEffect(() => {
    if (!doctorEmail) return;
    axios.get(`${DOCTOR_API}/doctor?email=${doctorEmail}`)
      .then(r => { setForm({ name:r.data.name, email:r.data.email, specialization:r.data.specialization }); setAvatar(r.data.avatar||null); setLoading(false); })
      .catch(() => { setProfileMsg({ ok:false, text:"Failed to fetch profile." }); navigate("/dashboard"); });
  }, [doctorEmail]);

  const handleAvatarChange = e => {
    const file = e.target.files[0]; setAvatarErr("");
    if (!file) return;
    if (!["image/jpeg","image/png"].includes(file.type)) { setAvatarErr("Only JPG/PNG allowed."); return; }
    if (file.size > 1_000_000) { setAvatarErr("Max 1 MB."); return; }
    const r = new FileReader(); r.onload = ev => setAvatar(ev.target.result); r.readAsDataURL(file);
  };

  const handleProfileSubmit = async e => {
    e.preventDefault(); setSaving(true); setProfileMsg(null);
    try {
      // JWT token in Authorization header (set by axios interceptor in config.js)
      // Backend identifies the doctor from the token — no email query param needed
      const res = await axios.put(`${DOCTOR_API}/doctor`, { ...form, avatar });
      // Save updated email to localStorage so sidebar stays in sync
      if (res.data.email) {
        localStorage.setItem("doctorEmail", res.data.email);
      }
      window.dispatchEvent(new Event("profileUpdated"));
      setProfileMsg({ ok:true, text:"Profile updated!" });
    } catch(err) { setProfileMsg({ ok:false, text:err.response?.data?.error||"Update failed." }); }
    finally { setSaving(false); }
  };

  const handlePwSubmit = async e => {
    e.preventDefault(); setPwMsg(null);
    if (pwForm.newPassword !== pwForm.confirmPassword) { setPwMsg({ ok:false, text:"Passwords don't match." }); return; }
    if (pwForm.newPassword.length < 6) { setPwMsg({ ok:false, text:"Min 6 characters." }); return; }
    setPwSaving(true);
    try {
      // Backend identifies doctor from JWT — no email query param needed
      await axios.patch(`${DOCTOR_API}/doctor/change-password`,
        { currentPassword:pwForm.currentPassword, newPassword:pwForm.newPassword });
      setPwMsg({ ok:true, text:"Password changed!" });
      setPwForm({ currentPassword:"", newPassword:"", confirmPassword:"" });
    } catch(err) { setPwMsg({ ok:false, text:err.response?.data?.error||"Failed." }); }
    finally { setPwSaving(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center" style={{ background:"var(--parchment)" }}>
      <svg className="w-7 h-7 animate-spin" style={{ color:"var(--fern)" }} fill="none" viewBox="0 0 24 24">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
      </svg>
    </div>
  );

  const inputStyle = key => ({
    borderColor: focused===key ? "var(--fern)" : "rgba(39,103,73,.18)",
    background: focused===key ? "#fafff8" : "white",
  });

  return (
    <div className="min-h-screen py-10 px-4 anim-page" style={{ background:"var(--parchment)" }}>
      <div className="max-w-lg mx-auto space-y-5">

        <div className="flex items-center gap-3 anim-up">
          <button onClick={()=>navigate("/dashboard")} className="btn-ghost p-2.5" style={{ borderRadius:"12px" }}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <div>
            <h1 className="text-3xl" style={{ fontFamily:"var(--font-serif)", color:"var(--forest)" }}>Edit Profile</h1>
            <p className="text-xs" style={{ color:"var(--mist)" }}>Update your details and photo</p>
          </div>
        </div>

        {/* Profile card */}
        <div className="card p-6 anim-up d-150">
          <p className="text-xs font-medium uppercase tracking-widest mb-5" style={{ color:"var(--mist)" }}>Profile Information</p>
          <div className="flex items-center gap-5 mb-6">
            <div className="relative">
              <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center"
                style={{ background:"linear-gradient(135deg,#c8e6d0,#a8d4b8)", border:"2px solid var(--border)" }}>
                {avatar
                  ? <img src={avatar} alt="" className="w-full h-full object-cover"/>
                  : <span className="text-3xl font-semibold uppercase" style={{ fontFamily:"var(--font-serif)", color:"var(--forest)" }}>{form.name?.charAt(0)||"D"}</span>}
              </div>
              <button type="button" onClick={()=>fileRef.current?.click()}
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full flex items-center justify-center shadow-md"
                style={{ background:"linear-gradient(135deg,var(--forest),var(--fern))" }}>
                <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </button>
            </div>
            <div>
              <button type="button" onClick={()=>fileRef.current?.click()} className="text-sm font-medium" style={{ color:"var(--fern)" }}>Upload photo</button>
              <p className="text-xs mt-0.5" style={{ color:"var(--mist)" }}>JPG or PNG · Max 1 MB</p>
              {avatar && <button type="button" onClick={()=>{setAvatar(null);setAvatarErr("");}} className="text-xs mt-1" style={{ color:"var(--terracotta)" }}>Remove</button>}
              {avatarErr && <p className="text-xs mt-1" style={{ color:"var(--terracotta)" }}>{avatarErr}</p>}
            </div>
            <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleAvatarChange}/>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            {[{key:"name",label:"Full Name",type:"text"},{key:"email",label:"Email",type:"email"},{key:"specialization",label:"Specialization",type:"text"}].map(({key,label,type}) => (
              <div key={key}>
                <label className="block text-xs font-medium mb-1.5 uppercase tracking-widest" style={{ color:"var(--mist)" }}>{label}</label>
                <input type={type} value={form[key]} required className="input-field" style={inputStyle(key)}
                  onChange={e=>setForm({...form,[key]:e.target.value})}
                  onFocus={()=>setFocused(key)} onBlur={()=>setFocused(null)}/>
              </div>
            ))}
            {profileMsg && (
              <div className="text-xs px-4 py-2.5 rounded-xl font-medium"
                style={{ background:profileMsg.ok?"rgba(39,103,73,.08)":"rgba(193,105,79,.08)", color:profileMsg.ok?"var(--fern)":"var(--terracotta)", border:`1px solid ${profileMsg.ok?"rgba(39,103,73,.2)":"rgba(193,105,79,.2)"}` }}>
                {profileMsg.ok?"✓ ":"✕ "}{profileMsg.text}
              </div>
            )}
            <button type="submit" disabled={saving} className="btn-primary w-full justify-center py-3"
              style={{ borderRadius:"12px", background:saving?"var(--mist)":undefined }}>
              {saving ? "Saving…" : "Save Profile →"}
            </button>
          </form>
        </div>

        {/* Password card */}
        <div className="card overflow-hidden anim-up d-300">
          <button type="button" onClick={()=>{setShowPw(!showPw);setPwMsg(null);}}
            className="w-full flex items-center justify-between px-6 py-4 transition"
            onMouseEnter={e=>e.currentTarget.style.background="rgba(39,103,73,.03)"}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background:"rgba(193,105,79,.1)" }}>
                <svg className="w-4 h-4" style={{ color:"var(--terracotta)" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <div className="text-left">
                <p className="text-sm font-medium" style={{ color:"var(--ink)" }}>Change Password</p>
                <p className="text-xs" style={{ color:"var(--mist)" }}>Update your login credentials</p>
              </div>
            </div>
            <svg className={`w-4 h-4 transition-transform duration-200 ${showPw?"rotate-180":""}`} style={{ color:"var(--sand)" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          {showPw && (
            <div className="px-6 pb-6 border-t anim-up" style={{ borderColor:"var(--border)" }}>
              <form onSubmit={handlePwSubmit} className="space-y-4 mt-5">
                {[{key:"currentPassword",label:"Current Password",fk:"cur"},{key:"newPassword",label:"New Password",fk:"nw"},{key:"confirmPassword",label:"Confirm Password",fk:"cf"}].map(({key,label,fk}) => (
                  <div key={key}>
                    <label className="block text-xs font-medium mb-1.5 uppercase tracking-widest" style={{ color:"var(--mist)" }}>{label}</label>
                    <div className="relative">
                      <input type={showFields[fk]?"text":"password"} value={pwForm[key]} required
                        className="input-field pr-10" style={inputStyle(`pw_${key}`)}
                        onChange={e=>setPwForm({...pwForm,[key]:e.target.value})}
                        onFocus={()=>setPwFocused(key)} onBlur={()=>setPwFocused(null)}/>
                      <button type="button" onClick={()=>setShowFields(s=>({...s,[fk]:!s[fk]}))}
                        className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color:"var(--mist)" }}>
                        {showFields[fk]
                          ? <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                          : <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>}
                      </button>
                    </div>
                  </div>
                ))}
                {pwForm.newPassword && (
                  <div className="text-xs px-3 py-1.5 rounded-lg"
                    style={{ background:pwForm.newPassword.length>=8?"rgba(39,103,73,.08)":"rgba(193,105,79,.08)", color:pwForm.newPassword.length>=8?"var(--fern)":"var(--terracotta)" }}>
                    {pwForm.newPassword.length<6?"Too short — min 6 chars":pwForm.newPassword.length<8?"Acceptable — 8+ recommended":"Strong ✓"}
                  </div>
                )}
                {pwForm.confirmPassword && (
                  <div className="text-xs px-3 py-1.5 rounded-lg"
                    style={{ background:pwForm.newPassword===pwForm.confirmPassword?"rgba(39,103,73,.08)":"rgba(193,105,79,.08)", color:pwForm.newPassword===pwForm.confirmPassword?"var(--fern)":"var(--terracotta)" }}>
                    {pwForm.newPassword===pwForm.confirmPassword?"Passwords match ✓":"No match"}
                  </div>
                )}
                {pwMsg && (
                  <div className="text-xs px-4 py-2.5 rounded-xl font-medium"
                    style={{ background:pwMsg.ok?"rgba(39,103,73,.08)":"rgba(193,105,79,.08)", color:pwMsg.ok?"var(--fern)":"var(--terracotta)", border:`1px solid ${pwMsg.ok?"rgba(39,103,73,.2)":"rgba(193,105,79,.2)"}` }}>
                    {pwMsg.ok?"✓ ":"✕ "}{pwMsg.text}
                  </div>
                )}
                <button type="submit" disabled={pwSaving} className="btn-primary w-full justify-center py-3"
                  style={{ borderRadius:"12px", background:pwSaving?"var(--mist)":"linear-gradient(135deg,var(--earth),var(--terracotta))" }}>
                  {pwSaving?"Updating…":"Update Password →"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
