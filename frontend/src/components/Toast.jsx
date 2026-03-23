export default function Toast({ toast }) {
  if (!toast) return null;
  const ok = toast.type !== "error";
  return (
    <div className="fixed bottom-5 right-5 z-50 anim-right flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-lg"
      style={{
        background: ok ? "linear-gradient(135deg,var(--forest),var(--fern))" : "linear-gradient(135deg,#8b2a2a,var(--terracotta))",
        boxShadow: `0 8px 28px rgba(${ok?"28,69,50":"139,42,42"},.35)`,
        minWidth:"220px",
      }}>
      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background:"rgba(255,255,255,.2)" }}>
        {ok
          ? <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
          : <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>}
      </div>
      <span className="text-sm font-medium text-white" style={{ fontFamily:"var(--font-sans)" }}>{toast.msg}</span>
    </div>
  );
}
