import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, AreaChart, Area, Legend,
} from "recharts";
import { Filter, RotateCcw, ChevronDown, RefreshCw } from "lucide-react";

import { PATIENTS_API } from "../config";
const BASE = PATIENTS_API;
const COLORS = ["#1b814c","#8a5840","#0ea5e9","#1d3557","#d97706","#6b21a8","#334155","#be185d"];
const getColor = (i) => COLORS[i % COLORS.length];

function countBy(data, keyFn) {
  const result = {};
  data.forEach((row) => {
    const val = typeof keyFn === "function" ? keyFn(row) : row[keyFn];
    if (val !== undefined && val !== null && val !== "") {
      result[val] = (result[val] || 0) + 1;
    }
  });
  return Object.entries(result).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
}

const DOSHA_MAP = {
  "Thin, difficulty gaining weight": "Vata",
  "Medium build, muscular": "Pitta",
  "Broad, easily gains weight": "Kapha",
};
const SKIN_MAP = {
  "Dry, rough, cold": "Vata Skin",
  "Warm, sensitive, prone to redness/acne": "Pitta Skin",
  "Soft, thick, oily": "Kapha Skin",
};
const SLEEP_MAP = {
  "Light, easily disturbed": "Light Sleep",
  "Moderate, may wake once": "Moderate Sleep",
  "Deep and long": "Deep Sleep",
};

const StatCard = ({ title, value, sub }) => (
  <div className="border border-[#bc9d82] rounded-md bg-white p-4 shadow-sm flex flex-col items-center justify-center">
    <div className="text-gray-500 text-[11px] self-start mb-2 font-medium">{title}</div>
    <div className="text-3xl lg:text-4xl font-semibold text-gray-800 tracking-tight">{value}</div>
    {sub && <div className="text-[10px] text-gray-400 mt-1">{sub}</div>}
  </div>
);

const ChartCard = ({ title, children, className, xLabel, yLabel }) => (
  <div className={`border border-[#bc9d82] rounded-md bg-white p-3 shadow-sm flex flex-col relative ${className}`}>
    <div className="text-sm font-medium text-gray-700">{title}</div>
    <div className="flex-1 mt-2 relative">
      {children}
      {yLabel && <div className="absolute top-1/2 -left-4 -translate-y-1/2 -rotate-90 text-[9px] text-gray-400 whitespace-nowrap">{yLabel}</div>}
      {xLabel && <div className="absolute bottom-[-5px] left-1/2 -translate-x-1/2 text-[9px] text-gray-400 whitespace-nowrap">{xLabel}</div>}
    </div>
  </div>
);

const SidebarFilter = ({ title, options, value, onChange }) => (
  <div className="flex flex-col mb-4">
    <label className="text-white text-xs mb-1 font-medium">{title}</label>
    <div className="relative">
      <select value={value} onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white text-gray-800 text-sm rounded px-2 py-1.5 appearance-none focus:outline-none focus:ring-1 focus:ring-green-400">
        <option value="All">All</option>
        {options.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
    </div>
  </div>
);

const HomeDashboard = ({ data }) => {
  const doshaData = countBy(data, (r) => DOSHA_MAP[r.bodyBuild] || r.bodyBuild).map((d, i) => ({ ...d, color: getColor(i) }));
  const vikritiData = countBy(data, "vikritiType").filter((d) => d.name).slice(0, 6);
  const sleepData = countBy(data, (r) => SLEEP_MAP[r.sleepPattern] || r.sleepPattern);
  let totalAge = 0;
  const ageDataObj = {};
  data.forEach((r) => {
    const age = Number(r.age);
    if (age) { ageDataObj[age] = (ageDataObj[age] || 0) + 1; totalAge += age; }
  });
  const avgAge = data.length ? (totalAge / data.length).toFixed(1) : 0;
  const ageData = Object.entries(ageDataObj).map(([age, count]) => ({ age: Number(age), count })).sort((a, b) => a.age - b.age);
  const opdCount = data.filter((p) => p.isOpd === "yes").length;
  const followupCount = data.filter((p) => p.isFollowup === "yes").length;

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="grid grid-cols-5 gap-4">
        <StatCard title="Total Patients" value={data.length} />
        <StatCard title="Average Age" value={avgAge} sub="years" />
        <StatCard title="Dominant Dosha" value={doshaData[0]?.name || "N/A"} />
        <StatCard title="Common Vikriti" value={vikritiData[0]?.name || "N/A"} />
        <StatCard title="OPD / Follow-ups" value={`${opdCount} / ${followupCount}`} />
      </div>
      <div className="grid grid-cols-3 gap-4 flex-1 pb-4">
        <div className="col-span-1 border border-[#bc9d82] rounded-md bg-white p-4 flex flex-col overflow-y-auto">
          <div className="w-full h-44 rounded-lg overflow-hidden bg-gradient-to-br from-green-800 to-green-600 flex items-center justify-center mb-4">
            <div className="text-center text-white px-4">
              <div className="text-4xl mb-2">🌿</div>
              <div className="text-lg font-bold">Ayurveda Care</div>
              <div className="text-xs opacity-80 mt-1">Health & Dosha Analysis</div>
            </div>
          </div>
          <div className="text-sm text-gray-700 space-y-3 flex-1">
            <p>Ayurveda focuses on balancing the body's doshas and recommends lifestyle changes, herbal medicines, and dietary control.</p>
            <div>
              <span className="font-bold block mb-1">Condition-Specific Recommendations</span>
              <ul className="list-disc pl-4 space-y-1 text-xs text-gray-600">
                <li>Monitor severe Vikriti imbalance patients closely.</li>
                <li>Herbal treatments like Ashwagandha & Triphala are commonly recommended.</li>
                <li>Patients should follow a balanced diet and regular yoga practice.</li>
              </ul>
            </div>
            <div>
              <span className="font-bold">ACTION:</span>
              <p className="text-xs text-gray-600 mt-1">Severe patients should consult an Ayurvedic practitioner for proper treatment.</p>
            </div>
          </div>
        </div>
        <div className="col-span-1 flex flex-col gap-4">
          <ChartCard title="Dosha (Prakriti) Distribution" className="flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={doshaData} innerRadius="40%" outerRadius="70%" dataKey="value" stroke="none">
                  {doshaData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip /><Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{ fontSize: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Sleep Pattern Distribution" className="flex-1" xLabel="Sleep Patterns" yLabel="Patient Count">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sleepData} margin={{ top: 10, right: 10, left: -20, bottom: 30 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip /><Bar dataKey="value" fill="#308a55" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
        <div className="col-span-1 flex flex-col gap-4">
          <ChartCard title="Vikriti (Disease Type) Distribution" className="flex-1" xLabel="Total Patients" yLabel="Vikriti Type">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={vikritiData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e0e0e0" />
                <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={90} axisLine={false} tickLine={false} />
                <Tooltip /><Bar dataKey="value" fill="#308a55" barSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          <ChartCard title="Age Group Distribution" className="flex-1" xLabel="Age of Patient" yLabel="Patient Count">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={ageData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
                <XAxis dataKey="age" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <Tooltip /><Area type="monotone" dataKey="count" stroke="#166534" fill="#86efac" />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>
    </div>
  );
};

const TreatmentDashboard = ({ data }) => {
  const statusData = [
    { name: "OPD Completed", value: data.filter((p) => p.isOpd === "yes").length },
    { name: "Appointments", value: data.filter((p) => p.isAppointed === "yes").length },
    { name: "Follow-ups", value: data.filter((p) => p.isFollowup === "yes").length },
  ].map((d, i) => ({ ...d, color: getColor(i) }));

  const buildSeverityMap = {};
  data.forEach((r) => {
    const build = DOSHA_MAP[r.bodyBuild] || r.bodyBuild || "Unknown";
    const sev = r.severity || "Unknown";
    if (!buildSeverityMap[build]) buildSeverityMap[build] = { name: build, Sthula: 0, Madhyama: 0, Sukshma: 0 };
    if (sev in buildSeverityMap[build]) buildSeverityMap[build][sev]++;
  });
  const buildSeverityData = Object.values(buildSeverityMap);
  const skinData = countBy(data, (r) => SKIN_MAP[r.skinType] || r.skinType);
  const digestionData = countBy(data, (r) => {
    const map = { "Irregular, bloating/gas common": "Irregular (Vata)", "Strong but prone to acidity": "Acidity (Pitta)", "Slow, heavy after meals": "Slow (Kapha)" };
    return map[r.digestion] || r.digestion;
  });
  const stressData = countBy(data, (r) => {
    const map = { "Feel anxious or fearful": "Anxious (Vata)", "Become irritable or angry": "Irritable (Pitta)", "Withdraw or feel dull": "Withdrawn (Kapha)" };
    return map[r.stressResponse] || r.stressResponse;
  });
  const opdCount = data.filter((p) => p.isOpd === "yes").length;
  const followupCount = data.filter((p) => p.isFollowup === "yes").length;
  const appointedCount = data.filter((p) => p.isAppointed === "yes").length;
  const treatmentRate = data.length ? ((opdCount / data.length) * 100).toFixed(1) : 0;
  const followupRate = data.length ? ((followupCount / data.length) * 100).toFixed(1) : 0;
  const topVikriti = countBy(data, "vikritiType").filter((d) => d.name)[0]?.name || "N/A";

  return (
    <div className="flex flex-col h-full gap-4">
      <div className="grid grid-cols-4 gap-4">
        <StatCard title="OPD Completion Rate" value={`${treatmentRate}%`} />
        <StatCard title="Most Common Vikriti" value={topVikriti} />
        <StatCard title="Follow-up Rate" value={`${followupRate}%`} />
        <StatCard title="Active Appointments" value={appointedCount} />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <ChartCard title="Patient Status Breakdown" className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusData} innerRadius="0%" outerRadius="65%" dataKey="value" stroke="#fff" cx="35%"
                label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {statusData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip /><Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{ fontSize: "10px" }} />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Dosha vs Severity" className="h-64" xLabel="Dosha Type" yLabel="Patient Count">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={buildSeverityData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip /><Legend wrapperStyle={{ fontSize: "10px" }} />
              <Bar dataKey="Sthula" stackId="a" fill="#1b814c" barSize={30} />
              <Bar dataKey="Madhyama" stackId="a" fill="#8a5840" barSize={30} />
              <Bar dataKey="Sukshma" stackId="a" fill="#0ea5e9" barSize={30} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <div className="grid grid-cols-3 gap-4 pb-4 h-64">
        <ChartCard title="Skin Type Distribution" className="h-full" xLabel="Count" yLabel="Skin Type">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={skinData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e0e0e0" />
              <XAxis type="number" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 9 }} width={80} axisLine={false} tickLine={false} />
              <Tooltip /><Bar dataKey="value" fill="#308a55" barSize={15} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Digestion Patterns" className="h-full" xLabel="Digestion Type" yLabel="Count">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={digestionData} margin={{ top: 10, right: 10, left: -20, bottom: 35 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip /><Bar dataKey="value" fill="#d97706" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Stress Response Patterns" className="h-full" xLabel="Stress Type" yLabel="Count">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stressData} margin={{ top: 10, right: 10, left: -20, bottom: 35 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e0e0" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip /><Bar dataKey="value" fill="#6b21a8" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("Home");
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [filters, setFilters] = useState({});

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(BASE);
      setRawData(res.data);
      setLastRefreshed(new Date());
    } catch (err) {
      console.error("Failed to fetch patients:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const homeFilterDefs = [
    { key: "bodyBuild", label: "Dosha (Body Build)", mapFn: (v) => DOSHA_MAP[v] || v },
    { key: "sleepPattern", label: "Sleep Pattern", mapFn: (v) => SLEEP_MAP[v] || v },
    { key: "vikritiType", label: "Vikriti Type", mapFn: (v) => v },
    { key: "severity", label: "Severity", mapFn: (v) => v },
  ];
  const treatmentFilterDefs = [
    { key: "isOpd", label: "OPD Status", mapFn: (v) => (v === "yes" ? "Completed" : "Pending") },
    { key: "isFollowup", label: "Follow-up", mapFn: (v) => (v === "yes" ? "Scheduled" : "None") },
    { key: "skinType", label: "Skin Type", mapFn: (v) => SKIN_MAP[v] || v },
    { key: "severity", label: "Severity", mapFn: (v) => v },
  ];
  const currentFilterDefs = activeTab === "Home" ? homeFilterDefs : treatmentFilterDefs;

  const filterOptionsCache = useMemo(() => {
    const cache = {};
    [...homeFilterDefs, ...treatmentFilterDefs].forEach(({ key, mapFn }) => {
      const opts = new Set();
      rawData.forEach((row) => {
        const v = row[key];
        if (v !== null && v !== undefined && v !== "") opts.add(mapFn(v));
      });
      cache[key] = Array.from(opts).sort();
    });
    return cache;
  }, [rawData]);

  const filteredData = useMemo(() => {
    return rawData.filter((row) => {
      for (const { key, mapFn } of currentFilterDefs) {
        const filterVal = filters[key];
        if (filterVal && filterVal !== "All") {
          if (mapFn(row[key]) !== filterVal) return false;
        }
      }
      return true;
    });
  }, [rawData, filters, activeTab]);

  const handleTabSwitch = (tab) => { setActiveTab(tab); setFilters({}); };

  return (
    <div className="flex-1 bg-gray-50 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <div className="h-16 shrink-0 bg-[#F4F4F4] flex items-center px-6 justify-between border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-green-600 flex items-center justify-center">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#166534] leading-tight">Ayurvedic Health & Dosha Analysis</h1>
            {lastRefreshed && <p className="text-[10px] text-gray-400">Last updated: {lastRefreshed.toLocaleTimeString("en-IN")}</p>}
          </div>
        </div>
        <div className="flex gap-3 items-center">
          <button onClick={() => handleTabSwitch("Home")}
            className={`w-40 py-1.5 rounded-full border border-gray-400 transition-colors text-sm font-medium ${activeTab === "Home" ? "bg-gray-200 text-gray-800" : "bg-gray-100/50 text-gray-500"}`}>
            Home
          </button>
          <button onClick={() => handleTabSwitch("Treatment Analysis")}
            className={`w-40 py-1.5 rounded-full border border-gray-400 transition-colors text-sm font-medium ${activeTab === "Treatment Analysis" ? "bg-gray-200 text-gray-800" : "bg-gray-100/50 text-gray-500"}`}>
            Treatment Analysis
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={fetchData} disabled={loading}
            className="flex items-center gap-1.5 text-xs text-green-700 border border-green-300 rounded-full px-3 py-1 hover:bg-green-50 transition">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <div className="flex flex-col items-center">
            <span className="text-xs font-semibold text-gray-700">Reset</span>
            <button onClick={() => setFilters({})}
              className="border border-gray-400 bg-[#E8E8E8] rounded-full px-4 py-0.5 mt-0.5 flex items-center justify-center hover:bg-gray-200">
              <RotateCcw className="w-3.5 h-3.5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden p-3 gap-3">
        {/* Filter Sidebar */}
        <div className="w-52 shrink-0 bg-[#358A59] rounded-tr-3xl flex flex-col p-4 shadow-md overflow-y-auto">
          <div className="bg-white rounded-full flex items-center gap-2 px-3 py-2 mb-5 shadow-sm">
            <Filter className="text-orange-400 w-4 h-4" />
            <span className="font-medium text-sm text-gray-800">Filters Menu</span>
          </div>
          <div className="flex-1">
            {currentFilterDefs.map(({ key, label }) => (
              <SidebarFilter key={key} title={label} options={filterOptionsCache[key] || []}
                value={filters[key] || "All"} onChange={(val) => setFilters((prev) => ({ ...prev, [key]: val }))} />
            ))}
          </div>
          <div className="mt-4 bg-green-800 rounded-xl p-3 text-white text-xs text-center">
            <div className="font-semibold mb-1">🔴 Live Data</div>
            <div className="opacity-80">{rawData.length} total patients</div>
            <div className="opacity-80">{filteredData.length} shown</div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto pr-1">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
              <RefreshCw className="w-8 h-8 animate-spin text-green-600" />
              <span>Loading patient data...</span>
            </div>
          ) : rawData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
              <div className="text-5xl">🌿</div>
              <span className="text-lg font-medium">No patient data found</span>
              <span className="text-sm">Add patients to see analytics</span>
            </div>
          ) : activeTab === "Home" ? (
            <HomeDashboard data={filteredData} />
          ) : (
            <TreatmentDashboard data={filteredData} />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
