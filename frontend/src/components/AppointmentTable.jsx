const AppointmentTable = ({ title, data }) => {
  return (
    <div className="mb-10">
      {/* Section Title */}
      <h1 className="text-2xl font-bold text-gray-800 mb-6">{title}</h1>

      {/* Card */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            {/* Header */}
            <thead>
              <tr className="bg-gray-100 text-gray-700 rounded-lg">
                <th className="py-3 px-4 rounded-l-lg">Sr.No</th>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 rounded-r-lg">Time</th>
              </tr>
            </thead>

            {/* Body */}
            <tbody>
              {data.map((item, index) => (
                <tr key={index} className="">
                  <td className="py-3 px-4">{index + 1}</td>
                  <td className="py-3 px-4">{item.name}</td>
                  <td className="py-3 px-4">{item.date}</td>
                  <td className="py-3 px-4">{item.time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AppointmentTable;
