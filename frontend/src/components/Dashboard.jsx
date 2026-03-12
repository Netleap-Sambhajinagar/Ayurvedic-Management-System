import React, { useState, useEffect, useMemo } from "react";
import Papa from "papaparse";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Legend
} from "recharts";
import { Filter, RotateCcw, ChevronDown } from "lucide-react";

const COLORS = ["#1b814c", "#8a5840", "#0ea5e9", "#1d3557", "#d97706", "#6b21a8", "#334155"];

// helper function to get color sequentially
const getColor = (index) => COLORS[index % COLORS.length];

// Group by helper
function countBy(data, key) {
  const result = {};
  data.forEach((row) => {
    const val = row[key];
    if (val) {
      result[val] = (result[val] || 0) + 1;
    }
  });
  return Object.entries(result).map(([name, value]) => ({ name, value })).sort((a,b)=>b.value - a.value);
}

const HomeDashboard = ({ data }) => {
  const doshaData = countBy(data, "Doshas").map((d, i) => ({ ...d, color: getColor(i) }));
  const diseaseData = countBy(data, "Disease Category").slice(0, 6); // top 6
  const sleepData = countBy(data, "Sleep Patterns");
  
  // Calculate average age
  const ageDataObj = {};
  let totalAge = 0;
  data.forEach((r) => {
    const age = Number(r["Age of Patient"]);
    if (age) {
      ageDataObj[age] = (ageDataObj[age] || 0) + 1;
      totalAge += age;
    }
  });
  const avgAge = data.length ? (totalAge / data.length).toFixed(2) : 0;
  const ageData = Object.entries(ageDataObj).map(([age, count]) => ({ age: Number(age), count })).sort((a,b) => a.age - b.age);

  const mostFrequentDiet = countBy(data, "Dietary Habits")[0]?.name || "N/A";
  const dominantDosha = doshaData[0]?.name || "N/A";
  const commonDisease = diseaseData[0]?.name || "N/A";

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Top Cards */}
      <div className="grid grid-cols-5 gap-4">
        <StatCard title="Total Patient" value={data.length} />
        <StatCard title="Average Age of Patients" value={avgAge} />
        <StatCard title="Most Common Diet" value={mostFrequentDiet} />
        <StatCard title="Dominant Doshas" value={dominantDosha} />
        <StatCard title="Common Disease" value={commonDisease} />
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-3 gap-4 flex-1 pb-4">
        {/* Left Column (Image & Text) */}
        <div className="col-span-1 border border-[#bc9d82] rounded-md bg-white p-4 flex flex-col overflow-y-auto">
          <img
            src="/images/banner1.jpeg"
            alt="Ayurveda"
            className="w-full h-48 object-cover rounded shadow-sm"
          />
          <div className="text-sm mt-4 text-gray-700 space-y-3 flex-1 flex flex-col justify-start">
            <p>
              Ayurveda focuses on balancing the body's doshas and recommends
              lifestyle changes, herbal medicines, and dietary control.
            </p>
            <div>
              <span className="font-bold block mb-1">Condition-Specific Recommendations</span>
              <ul className="list-disc pl-4 space-y-1">
                <li>High number of severe cases detected.</li>
                <li>
                  Herbal treatments like Ashwagandha and Triphala are commonly
                  recommended.
                </li>
                <li>
                  Patients should follow a balanced diet and regular yoga
                  practice.
                </li>
              </ul>
            </div>
            <div>
              <span className="font-bold">ACTION:</span>
              <p>
                Severe patients should consult an Ayurvedic practitioner for
                proper treatment.
              </p>
            </div>
          </div>
        </div>

        {/* Middle Column */}
        <div className="col-span-1 flex flex-col gap-4">
          <ChartCard title="Dosha Distribution" className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={doshaData}
                  innerRadius="40%"
                  outerRadius="70%"
                  dataKey="value"
                  stroke="none"
                >
                  {doshaData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '10px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Sleep Pattern vs Stress Level" className="flex-1" xLabel="Sleep Patterns" yLabel="Count of Stress Levels">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sleepData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#308a55" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>

        {/* Right Column */}
        <div className="col-span-1 flex flex-col gap-4">
          <ChartCard title="Disease Distribution" className="flex-1" xLabel="Total Patients" yLabel="Disease Category">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={diseaseData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e0e0e0" />
                <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#308a55" barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Age Group vs Disease" className="flex-1" xLabel="Age of Patient" yLabel="Count of Disease Category">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ageData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="age" tick={{ fontSize: 10 }} tickCount={3} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Area type="monotone" dataKey="count" stroke="#166534" fill="#86efac" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

const TreatmentDashboard = ({ data }) => {
  const therapyRecoveryData = countBy(data, "Treatment Outcome").map((d, i) => ({ ...d, color: getColor(i) }));
  
  const therapyGroups = {};
  data.forEach(r => {
    const t = r["Therapy"];
    const out = r["Treatment Outcome"];
    const dur = Number(r["Duration of Treatment"]) || 0;
    if (t) {
      if (!therapyGroups[t]) therapyGroups[t] = { name: t, impPat: 0, impDur: 0, noPat: 0, noDur: 0, recPat: 0, recDur: 0 };
      if (out === "Improving") { therapyGroups[t].impPat++; therapyGroups[t].impDur += dur; }
      else if (out === "No Improvement") { therapyGroups[t].noPat++; therapyGroups[t].noDur += dur; }
      else if (out === "Recovered") { therapyGroups[t].recPat++; therapyGroups[t].recDur += dur; }
    }
  });

  const tableData = Object.values(therapyGroups).map(t => ({
    name: t.name,
    impPat: t.impPat, impDur: t.impPat ? (t.impDur / t.impPat).toFixed(2) : 0,
    noPat: t.noPat, noDur: t.noPat ? (t.noDur / t.noPat).toFixed(2) : 0,
    recPat: t.recPat, recDur: t.recPat ? (t.recDur / t.recPat).toFixed(2) : 0,
  }));

  const totalImpPat = tableData.reduce((acc, t) => acc + t.impPat, 0);
  const sumImpDur = tableData.reduce((acc, t) => acc + (t.impPat * Number(t.impDur)), 0);
  const totalNoPat = tableData.reduce((acc, t) => acc + t.noPat, 0);
  const sumNoDur = tableData.reduce((acc, t) => acc + (t.noPat * Number(t.noDur)), 0);
  const totalRecPat = tableData.reduce((acc, t) => acc + t.recPat, 0);
  const sumRecDur = tableData.reduce((acc, t) => acc + (t.recPat * Number(t.recDur)), 0);

  const durationPieData = countBy(data, "Therapy").map((d, i) => ({ ...d, color: getColor(i) }));
  const therapyDistributionData = countBy(data, "Therapy");
  const doshaSkinData = countBy(data, "Skin Type");
  
  const impRate = (totalImpPat / (data.length || 1) * 100).toFixed(2);
  const recRate = (totalRecPat / (data.length || 1) * 100).toFixed(2);
  const mostUsedTherapy = therapyDistributionData[0]?.name || "N/A";
  const totalDur = data.reduce((acc, r) => acc + (Number(r["Duration of Treatment"]) || 0), 0);
  const avgDur = (totalDur / (data.length || 1)).toFixed(2);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Top Cards */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="Improvement Rate" value={`${impRate}%`} />
        <StatCard title="Most Used Therapy" value={mostUsedTherapy} />
        <StatCard title="Average Treatment Duration" value={avgDur} />
        <StatCard title="Recovery Rate" value={`${recRate}%`} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
         <ChartCard title="Therapy vs Recovery" className="h-64" xLabel="Count of Therapy" yLabel="Treatment Outcome">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={therapyRecoveryData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e0e0e0" />
                <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={80} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#308a55" barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <div className="h-64 border border-[#bc9d82] rounded-md bg-white overflow-hidden text-[10px] md:text-sm overflow-y-auto">
             <table className="w-full text-center border-collapse text-xs">
                <thead className="sticky top-0 bg-white shadow-sm z-10">
                   <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="p-2 border-r border-gray-300 text-left">Treatment Outcome</th>
                      <th className="p-2 border-r border-gray-300" colSpan="2">Improving</th>
                      <th className="p-2 border-r border-gray-300" colSpan="2">No Improvement</th>
                      <th className="p-2" colSpan="2">Recovered</th>
                   </tr>
                   <tr className="border-b border-gray-300 bg-gray-50">
                      <th className="p-2 border-r border-gray-300 text-left font-medium">Therapy</th>
                      <th className="p-2 font-medium">Total Patients</th>
                      <th className="p-2 border-r border-gray-300 font-medium">Avg Duration</th>
                      <th className="p-2 font-medium">Total Patients</th>
                      <th className="p-2 border-r border-gray-300 font-medium">Avg Duration</th>
                      <th className="p-2 font-medium">Total Patients</th>
                      <th className="p-2 font-medium">Avg Duration</th>
                   </tr>
                </thead>
                <tbody>
                   {tableData.map((row, i) => (
                      <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                         <td className="p-2 border-r border-gray-300 text-left">{row.name}</td>
                         <td className="p-2">{row.impPat}</td><td className="p-2 border-r border-gray-300">{row.impDur}</td>
                         <td className="p-2">{row.noPat}</td><td className="p-2 border-r border-gray-300">{row.noDur}</td>
                         <td className="p-2">{row.recPat}</td><td className="p-2">{row.recDur}</td>
                      </tr>
                   ))}
                   <tr className="font-bold border-t-2 border-gray-300 bg-gray-50 sticky bottom-0">
                      <td className="p-2 border-r border-gray-300 text-left">Total</td>
                      <td className="p-2">{totalImpPat}</td><td className="p-2 border-r border-gray-300">{(totalImpPat?sumImpDur/totalImpPat:0).toFixed(2)}</td>
                      <td className="p-2">{totalNoPat}</td><td className="p-2 border-r border-gray-300">{(totalNoPat?sumNoDur/totalNoPat:0).toFixed(2)}</td>
                      <td className="p-2">{totalRecPat}</td><td className="p-2">{(totalRecPat?sumRecDur/totalRecPat:0).toFixed(2)}</td>
                   </tr>
                </tbody>
             </table>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 h-64">
           <ChartCard title="Treatment Duration by Therapy" className="h-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={durationPieData}
                  innerRadius="0%"
                  outerRadius="70%"
                  dataKey="value"
                  stroke="#fff"
                  cx="30%"
                  label={({ name, percent }) => `${(percent * 100).toFixed(2)}%`}
                  labelLine={false}
                >
                  {durationPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend layout="vertical" verticalAlign="middle" align="right"
                        iconType="circle"
                        wrapperStyle={{ fontSize: '10px' }}/>
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Therapy Distribution" className="h-full" xLabel="Therapy" yLabel="Total Patients">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={therapyDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-35} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#308a55" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          <ChartCard title="Doshas by Skin Type" className="h-full" xLabel="Count of Doshas" yLabel="Skin Type">
             <ResponsiveContainer width="100%" height="100%">
              <BarChart data={doshaSkinData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e0e0e0" />
                <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={60} axisLine={false} tickLine={false} />
                <Tooltip />
                <Bar dataKey="value" fill="#308a55" barSize={15} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
      </div>

    </div>
  );
};

const StatCard = ({ title, value }) => (
  <div className="border border-[#bc9d82] rounded-md bg-white p-4 shadow-sm flex flex-col items-center justify-center">
    <div className="text-gray-600 text-[11px] self-start mb-2 font-medium bg-white">{title}</div>
    <div className="text-3xl lg:text-4xl font-semibold text-gray-800 tracking-tight">{value}</div>
  </div>
);

const ChartCard = ({ title, children, className, xLabel, yLabel }) => (
  <div className={`border border-[#bc9d82] rounded-md bg-white p-3 shadow-sm flex flex-col relative ${className}`}>
    <div className="text-sm font-medium text-gray-700 bg-white z-10">{title}</div>
    <div className="flex-1 mt-2 relative">
       {children}
       {yLabel && (
         <div className="absolute top-1/2 -left-4 -translate-y-1/2 -rotate-90 text-[9px] text-gray-500 whitespace-nowrap">
           {yLabel}
         </div>
       )}
       {xLabel && (
         <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 text-[9px] text-gray-500 whitespace-nowrap">
           {xLabel}
         </div>
       )}
    </div>
  </div>
);

const SidebarFilter = ({ title, options, value, onChange }) => (
  <div className="flex flex-col mb-4">
    <label className="text-white text-xs mb-1 font-medium">{title}</label>
    <div className="relative">
      <select 
        value={value} 
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white text-gray-800 text-sm rounded px-2 py-1.5 appearance-none focus:outline-none focus:ring-1 focus:ring-green-400"
      >
        <option value="All">All</option>
        {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
    </div>
  </div>
);

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Home");
  const [rawData, setRawData] = useState([]);
  
  // Parse CSV on mount
  useEffect(() => {
    Papa.parse("/data.csv", {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
         setRawData(results.data);
      }
    });
  }, []);

  const homeFiltersKeys = [
    "Gender", "Age of Patient", "Disease Category", "Sleep Patterns", "Doshas"
  ];
  const treatmentFiltersKeys = [
    "Therapy", "Ayurvedic Herbs", "Treatment Outcome", "Consultation Type", "Season of Treatment"
  ];

  // Global filters
  const [filters, setFilters] = useState({});
  const currentFiltersKeys = activeTab === "Home" ? homeFiltersKeys : treatmentFiltersKeys;

  const handleFilterChange = (key, val) => {
    setFilters(prev => ({ ...prev, [key]: val }));
  };

  const handleReset = () => {
    setFilters({});
  };

  // Filter the data based on current slicers
  const filteredData = useMemo(() => {
    return rawData.filter(row => {
      for (let key in filters) {
        if (filters[key] && filters[key] !== "All") {
          if (row[key] !== filters[key]) return false;
        }
      }
      return true;
    });
  }, [rawData, filters]);

  // Pre-calculate unique options for all filters to prevent recalculating on every render
  const filterOptionsCache = useMemo(() => {
    const cache = {};
    const allKeys = [...homeFiltersKeys, ...treatmentFiltersKeys];
    
    allKeys.forEach(key => {
      const opts = new Set();
      rawData.forEach(row => {
        if (row[key]) opts.add(row[key]);
      });
      cache[key] = Array.from(opts).sort();
    });
    
    return cache;
  }, [rawData]);

  const getFilterOptions = (key) => filterOptionsCache[key] || [];

  return (
    <div className="flex-1 bg-gray-50 flex flex-col h-[calc(100vh)] overflow-hidden">
      
      {/* Top Heading Section */}
      <div className="h-16 shrink-0 bg-[#F4F4F4] flex items-center px-6 justify-between border-b border-gray-200">
        <div className="flex items-center gap-3">
          <img src="/images/logo.jpg" alt="Logo" className="h-10 w-12 object-cover" />
          <h1 className="text-2xl font-semibold text-[#166534]">Ayurvedic Health & Dosha Analysis</h1>
        </div>
        
        <div className="flex gap-4 items-center">
            <button
               onClick={() => { setActiveTab("Home"); setFilters({}); }}
               className={`w-40 py-1.5 rounded-full border border-gray-400 transition-colors text-sm font-medium ${activeTab === "Home" ? "bg-gray-200 text-gray-800" : "bg-gray-100/50 text-gray-500"}`}
            >
               Home
            </button>
            <button
               onClick={() => { setActiveTab("Treatment Analysis"); setFilters({}); }}
               className={`w-40 py-1.5 rounded-full border border-gray-400 transition-colors text-sm font-medium ${activeTab === "Treatment Analysis" ? "bg-gray-200 text-gray-800" : "bg-gray-100/50 text-gray-500"}`}
            >
               Treatment Analysis
            </button>
        </div>

        <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-gray-700">Reset</span>
            <button onClick={handleReset} className="border border-gray-400 bg-[#E8E8E8] rounded-full px-4 py-0.5 mt-0.5 flex items-center justify-center hover:bg-gray-200">
               <RotateCcw className="w-3.5 h-3.5 text-gray-700 font-bold" />
            </button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden p-3 gap-3">
        {/* Deep Green PowerBI Left Sidebar */}
        <div className="w-56 shrink-0 bg-[#358A59] rounded-tr-3xl flex flex-col p-4 shadow-md overflow-y-auto">
            <div className="bg-white rounded-full flex items-center gap-2 px-3 py-2 mb-6 shadow-sm">
               <div className="p-1 rounded-full"><Filter className="text-orange-400 w-4 h-4" /></div>
               <span className="font-medium text-sm text-gray-800">Filters Menu</span>
            </div>

            <div className="flex-1">
               {currentFiltersKeys.map(f => (
                 <SidebarFilter 
                   key={f} 
                   title={f} 
                   options={getFilterOptions(f)} 
                   value={filters[f] || "All"} 
                   onChange={(val) => handleFilterChange(f, val)} 
                 />
               ))}
            </div>
        </div>

        {/* Dashboard Content area */}
        <div className="flex-1 overflow-y-auto pr-2">
           {rawData.length === 0 ? (
             <div className="flex items-center justify-center h-full text-gray-500">Loading data...</div>
           ) : (
             activeTab === "Home" ? <HomeDashboard data={filteredData} /> : <TreatmentDashboard data={filteredData} />
           )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
