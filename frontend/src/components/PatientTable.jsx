import { useNavigate } from "react-router-dom";

export default function PatientsTable({ patients }) {
  const navigate = useNavigate();
  return (
    <div className="card overflow-hidden anim-up">
      {/* Desktop */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ background:"var(--parchment)", borderBottom:"1px solid var(--border)" }}>
              {["Name","Age","Height","Weight","Contact"].map((col) => (
                <th key={col} className="py-3 px-5 text-left"
                  style={{ color:"var(--mist)", fontFamily:"var(--font-sans)", fontSize:"11px", fontWeight:600, letterSpacing:".06em", textTransform:"uppercase" }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {patients.map((p,i) => (
              <tr key={p.id} onClick={() => navigate(`/patient/${p.id}`, { state: { from: "patients" } })}
                className="trow cursor-pointer" style={{ borderBottom:"1px solid rgba(39,103,73,.06)" }}>
                <td className="py-3.5 px-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-semibold uppercase"
                      style={{ background:"linear-gradient(135deg,#c8e6d0,#a8d4b8)", color:"var(--forest)", fontFamily:"var(--font-serif)" }}>
                      {p.name?.charAt(0)||"?"}
                    </div>
                    <span className="font-medium text-sm" style={{ color:"var(--ink)", fontFamily:"var(--font-sans)" }}>{p.name}</span>
                  </div>
                </td>
                {[p.age, p.height, p.weight, p.contactNo].map((val,j) => (
                  <td key={j} className="py-3.5 px-5 text-sm" style={{ color:"var(--mist)", fontFamily:"var(--font-sans)" }}>{val}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile */}
      <div className="md:hidden divide-y" style={{ borderColor:"rgba(39,103,73,.06)" }}>
        {patients.map((p,i) => (
          <div key={p.id} onClick={() => navigate(`/patient/${p.id}`, { state: { from: "patients" } })}
            className="trow flex items-center gap-3 px-4 py-3.5 cursor-pointer">
            <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-base font-semibold uppercase"
              style={{ background:"linear-gradient(135deg,#c8e6d0,#a8d4b8)", color:"var(--forest)", fontFamily:"var(--font-serif)" }}>
              {p.name?.charAt(0)||"?"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate" style={{ color:"var(--ink)" }}>{p.name}</p>
              <p className="text-xs mt-0.5" style={{ color:"var(--mist)" }}>{p.age} yrs · {p.height} cm · {p.weight} kg</p>
              <p className="text-xs" style={{ color:"var(--sand)" }}>{p.contactNo}</p>
            </div>
            <svg className="w-4 h-4 shrink-0" style={{ color:"var(--sand)" }} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
}
