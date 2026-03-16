import { useNavigate } from "react-router-dom";

const PatientsTable = ({ patients }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200">
      {/* ── Desktop Table (md and up) ─────────────────────────── */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-black border-separate border-spacing-y-2 px-4">
          <thead>
            <tr className="bg-[#e6e6e6] text-gray-700">
              {["Sr.No", "Name", "Age", "Height", "Weight", "Contact"].map(
                (col, i, arr) => (
                  <th
                    key={col}
                    className={`py-3 px-5 font-semibold text-sm text-center
                    ${i === 0 ? "rounded-l-xl" : ""}
                    ${i === arr.length - 1 ? "rounded-r-xl" : ""}`}
                  >
                    {col}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {patients.map((p, i) => (
              <tr
                key={p.id}
                onClick={() => navigate(`/patient/${p.id}`)}
                className="bg-white hover:bg-green-50 transition duration-200 text-center cursor-pointer rounded-xl"
              >
                <td className="py-3.5 px-5 text-gray-500 text-sm">{i + 1}</td>
                <td className="py-3.5 px-5 font-medium text-gray-800">
                  {p.name}
                </td>
                <td className="py-3.5 px-5 text-gray-600">{p.age}</td>
                <td className="py-3.5 px-5 text-gray-600">{p.height}</td>
                <td className="py-3.5 px-5 text-gray-600">{p.weight}</td>
                <td className="py-3.5 px-5 text-gray-600">{p.contactNo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Mobile Cards (below md) ───────────────────────────── */}
      <div className="md:hidden divide-y divide-gray-100">
        {patients.map((p, i) => (
          <div
            key={p.id}
            onClick={() => navigate(`/patient/${p.id}`)}
            className="flex items-center gap-4 px-4 py-4 hover:bg-green-50 active:bg-green-100 transition cursor-pointer"
          >
            {/* Avatar */}
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <span className="text-sm font-bold text-green-600 uppercase">
                {p.name?.charAt(0) || "?"}
              </span>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold text-gray-800 text-sm truncate">
                  {p.name}
                </p>
                <span className="text-xs text-gray-400 shrink-0">#{i + 1}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <span className="text-xs text-gray-500">{p.age} yrs</span>
                <span className="text-gray-300 text-xs">·</span>
                <span className="text-xs text-gray-500">{p.height} cm</span>
                <span className="text-gray-300 text-xs">·</span>
                <span className="text-xs text-gray-500">{p.weight} kg</span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{p.contactNo}</p>
            </div>

            {/* Chevron */}
            <svg
              className="w-4 h-4 text-gray-300 shrink-0"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PatientsTable;
