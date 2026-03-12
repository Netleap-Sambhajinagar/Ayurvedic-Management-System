import PatientDetails from "./PatientDetails";
import { useNavigate } from "react-router-dom";

const PatientsTable = ({ patients }) => {
  const cols = ["Sr.No", "Name", "Age", "Height", "Weight", "Contact"];
  const navigate = useNavigate();

  return (
    <div className="bg-white p-6 rounded-2xl -mt-3">
      <div className="bg-white rounded-2xl p-4 border border-gray-400">
        <table className="w-full text-black border-separate border-spacing-y-3">
          <thead>
            <tr className="bg-[#e6e6e6] text-gray-700">
              {cols.map((col, index) => (
                <th
                  key={col}
                  className={`py-3 px-6 font-semibold text-center ${
                    index === 0 ? "rounded-l-xl" : ""
                  } ${index === cols.length - 1 ? "rounded-r-xl" : ""}`}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {patients.map((p, i) => (
              <tr
                key={p.id}
                onClick={() => navigate(`/patient/${p.id}`)}
                className="bg-white hover:bg-green-50 transition duration-200 text-center cursor-pointer"
              >
                <td className="py-4 px-6">{i + 1}</td>
                <td className="py-4 px-6">{p.name}</td>
                <td className="py-4 px-6">{p.age}</td>
                <td className="py-4 px-6">{p.height}</td>
                <td className="py-4 px-6">{p.weight}</td>
                <td className="py-4 px-6">{p.contactNo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PatientsTable;
