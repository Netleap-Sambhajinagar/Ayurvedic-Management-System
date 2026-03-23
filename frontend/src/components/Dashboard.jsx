import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { PieChart,Pie,Cell,BarChart,Bar,XAxis,YAxis,CartesianGrid,Tooltip,ResponsiveContainer,AreaChart,Area,Legend } from "recharts";
import { Filter, RotateCcw, ChevronDown, RefreshCw, X } from "lucide-react";
import { PATIENTS_API } from "../config";

const COLORS = ["#276749","#c1694f","#0ea5e9","#1d3557","#d97706","#6b21a8","#334155","#be185d"];
const getColor = i => COLORS[i%COLORS.length];

function countBy(data,keyFn) {
  const r={};
  data.forEach(row=>{const v=typeof keyFn==="function"?keyFn(row):row[keyFn];if(v!==undefined&&v!==null&&v!==""){r[v]=(r[v]||0)+1;}});
  return Object.entries(r).map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value);
}
const DOSHA_MAP={"Thin, difficulty gaining weight":"Vata","Medium build, muscular":"Pitta","Broad, easily gains weight":"Kapha"};
const SKIN_MAP={"Dry, rough, cold":"Vata Skin","Warm, sensitive, prone to redness/acne":"Pitta Skin","Soft, thick, oily":"Kapha Skin"};
const SLEEP_MAP={"Light, easily disturbed":"Light Sleep","Moderate, may wake once":"Moderate Sleep","Deep and long":"Deep Sleep"};

const tip = { contentStyle:{ fontFamily:"var(--font-sans)", fontSize:11, borderRadius:12, border:"1px solid var(--border)", boxShadow:"var(--shadow-sm)" } };

const StatCard = ({ title, value, sub, delay="" }) => (
  <div className={`card flex flex-col items-center justify-center text-center p-3 sm:p-4 anim-up ${delay}`}>
    <div className="text-[10px] sm:text-[11px] mb-1 sm:mb-2 uppercase tracking-widest font-medium" style={{ color:"var(--mist)" }}>{title}</div>
    <div className="text-3xl sm:text-4xl anim-count" style={{ fontFamily:"var(--font-serif)", color:"var(--forest)", fontWeight:500 }}>{value}</div>
    {sub && <div className="text-[10px] mt-1" style={{ color:"var(--sand)" }}>{sub}</div>}
  </div>
);

const ChartCard = ({ title, children, className="" }) => (
  <div className={`card p-4 flex flex-col anim-up ${className}`}>
    <div className="text-xs sm:text-sm mb-3 uppercase tracking-widest font-medium" style={{ color:"var(--mist)" }}>{title}</div>
    <div className="flex-1">{children}</div>
  </div>
);

const FilterSelect = ({ title, options, value, onChange }) => (
  <div className="mb-4">
    <label className="block text-xs mb-1.5 uppercase tracking-widest font-medium" style={{ color:"rgba(255,255,255,.6)" }}>{title}</label>
    <div className="relative">
      <select value={value} onChange={e=>onChange(e.target.value)}
        className="w-full text-sm rounded-xl px-3 py-2 appearance-none outline-none"
        style={{ background:"rgba(255,255,255,.94)", color:"var(--ink)", fontFamily:"var(--font-sans)", border:"none" }}>
        <option value="All">All</option>
        {options.map(o=><option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none" style={{ color:"var(--sage)" }}/>
    </div>
  </div>
);

const HomeDashboard = ({ data }) => {
  const doshaData=countBy(data,r=>DOSHA_MAP[r.bodyBuild]||r.bodyBuild).map((d,i)=>({...d,color:getColor(i)}));
  const vikritiData=countBy(data,"vikritiType").filter(d=>d.name).slice(0,6);
  const sleepData=countBy(data,r=>SLEEP_MAP[r.sleepPattern]||r.sleepPattern);
  let totalAge=0;const ageObj={};
  data.forEach(r=>{const a=Number(r.age);if(a){ageObj[a]=(ageObj[a]||0)+1;totalAge+=a;}});
  const avgAge=data.length?(totalAge/data.length).toFixed(1):0;
  const ageData=Object.entries(ageObj).map(([age,count])=>({age:Number(age),count})).sort((a,b)=>a.age-b.age);
  const opdCount=data.filter(p=>p.isOpd==="yes").length;
  const followupCount=data.filter(p=>p.isFollowup==="yes").length;
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <StatCard title="Total Patients" value={data.length} delay="d-75"/>
        <StatCard title="Average Age" value={avgAge} sub="years" delay="d-150"/>
        <StatCard title="Dominant Dosha" value={doshaData[0]?.name||"N/A"} delay="d-225"/>
        <StatCard title="Common Vikriti" value={vikritiData[0]?.name||"N/A"} delay="d-300"/>
        <StatCard title="OPD / Followups" value={`${opdCount} / ${followupCount}`} delay="d-400"/>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="hidden lg:flex card p-5 flex-col anim-up d-150">
          <div className="rounded-2xl overflow-hidden flex items-center justify-center mb-4 h-36"
            style={{ background:"linear-gradient(145deg,var(--forest),var(--sage))" }}>
            <div className="text-center text-white">
              <div className="text-4xl mb-2 anim-leaf inline-block">🌿</div>
              <div className="text-lg font-light" style={{ fontFamily:"var(--font-serif)" }}>Ayurveda Care</div>
              <div className="text-xs opacity-60 mt-1">Health & Dosha Analysis</div>
            </div>
          </div>
          <p className="text-xs leading-relaxed mb-3" style={{ color:"var(--mist)" }}>
            Ayurveda focuses on balancing the body's doshas through lifestyle, herbal medicine, and dietary guidance.
          </p>
          <div>
            <p className="text-[10px] uppercase tracking-widest font-medium mb-2" style={{ color:"var(--sand)" }}>Key Recommendations</p>
            <ul className="space-y-1.5">
              {["Monitor severe Vikriti imbalances closely","Ashwagandha & Triphala for common conditions","Balanced diet + daily yoga practice"].map((t,i)=>(
                <li key={i} className="flex items-start gap-2 text-xs" style={{ color:"var(--mist)" }}>
                  <span className="mt-0.5 w-1.5 h-1.5 rounded-full shrink-0" style={{ background:"var(--mint)" }}/>
                  {t}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <ChartCard title="Dosha (Prakriti) Distribution" className="h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart><Pie data={doshaData} innerRadius="38%" outerRadius="68%" dataKey="value" stroke="none">
              {doshaData.map((e,i)=><Cell key={i} fill={e.color}/>)}
            </Pie><Tooltip {...tip}/><Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{ fontSize:"10px",fontFamily:"var(--font-sans)" }}/></PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Vikriti Distribution" className="h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={vikritiData} layout="vertical" margin={{top:8,right:10,left:8,bottom:16}}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(39,103,73,.08)"/>
              <XAxis type="number" tick={{fontSize:10,fontFamily:"var(--font-sans)",fill:"var(--mist)"}} axisLine={false} tickLine={false}/>
              <YAxis dataKey="name" type="category" tick={{fontSize:9,fontFamily:"var(--font-sans)",fill:"var(--sage)"}} width={82} axisLine={false} tickLine={false}/>
              <Tooltip {...tip}/>
              <Bar dataKey="value" fill="var(--fern)" barSize={13} radius={[0,6,6,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-4">
        <ChartCard title="Sleep Patterns" className="h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sleepData} margin={{top:8,right:10,left:-22,bottom:30}}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(39,103,73,.08)"/>
              <XAxis dataKey="name" tick={{fontSize:9,fontFamily:"var(--font-sans)",fill:"var(--sage)"}} angle={-20} textAnchor="end"/>
              <YAxis tick={{fontSize:10,fontFamily:"var(--font-sans)",fill:"var(--mist)"}} axisLine={false} tickLine={false}/>
              <Tooltip {...tip}/>
              <Bar dataKey="value" fill="var(--sage)" radius={[5,5,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Age Distribution" className="h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={ageData} margin={{top:8,right:10,left:-22,bottom:16}}>
              <defs>
                <linearGradient id="ag" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--fern)" stopOpacity={0.22}/>
                  <stop offset="95%" stopColor="var(--fern)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(39,103,73,.08)"/>
              <XAxis dataKey="age" tick={{fontSize:10,fontFamily:"var(--font-sans)",fill:"var(--mist)"}}/>
              <YAxis tick={{fontSize:10,fontFamily:"var(--font-sans)",fill:"var(--mist)"}} axisLine={false} tickLine={false}/>
              <Tooltip {...tip}/>
              <Area type="monotone" dataKey="count" stroke="var(--forest)" strokeWidth={2} fill="url(#ag)"/>
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
    </div>
  );
};

const TreatmentDashboard = ({ data }) => {
  const statusData=[{name:"OPD Completed",value:data.filter(p=>p.isOpd==="yes").length},{name:"Appointments",value:data.filter(p=>p.isAppointed==="yes").length},{name:"Follow-ups",value:data.filter(p=>p.isFollowup==="yes").length}].map((d,i)=>({...d,color:getColor(i)}));
  const bsMap={};data.forEach(r=>{const b=DOSHA_MAP[r.bodyBuild]||r.bodyBuild||"Unknown";const s=r.severity||"Unknown";if(!bsMap[b])bsMap[b]={name:b,Sthula:0,Madhyama:0,Sukshma:0};if(s in bsMap[b])bsMap[b][s]++;});
  const bsData=Object.values(bsMap);
  const skinData=countBy(data,r=>SKIN_MAP[r.skinType]||r.skinType);
  const digData=countBy(data,r=>({"Irregular, bloating/gas common":"Irregular (Vata)","Strong but prone to acidity":"Acidity (Pitta)","Slow, heavy after meals":"Slow (Kapha)"})[r.digestion]||r.digestion);
  const stressData=countBy(data,r=>({"Feel anxious or fearful":"Anxious (Vata)","Become irritable or angry":"Irritable (Pitta)","Withdraw or feel dull":"Withdrawn (Kapha)"})[r.stressResponse]||r.stressResponse);
  const opdC=data.filter(p=>p.isOpd==="yes").length;const fuC=data.filter(p=>p.isFollowup==="yes").length;const apC=data.filter(p=>p.isAppointed==="yes").length;
  const tRate=data.length?((opdC/data.length)*100).toFixed(1):0;const fRate=data.length?((fuC/data.length)*100).toFixed(1):0;
  const topV=countBy(data,"vikritiType").filter(d=>d.name)[0]?.name||"N/A";
  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="OPD Rate" value={`${tRate}%`} delay="d-75"/>
        <StatCard title="Top Vikriti" value={topV} delay="d-150"/>
        <StatCard title="Follow-up Rate" value={`${fRate}%`} delay="d-225"/>
        <StatCard title="Active Appts" value={apC} delay="d-300"/>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <ChartCard title="Patient Status" className="h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart><Pie data={statusData} innerRadius="0%" outerRadius="62%" dataKey="value" stroke="#fff" cx="35%" label={({percent})=>`${(percent*100).toFixed(0)}%`} labelLine={false}>
              {statusData.map((e,i)=><Cell key={i} fill={e.color}/>)}
            </Pie><Tooltip {...tip}/><Legend layout="vertical" verticalAlign="middle" align="right" iconType="circle" wrapperStyle={{fontSize:"10px",fontFamily:"var(--font-sans)"}}/></PieChart>
          </ResponsiveContainer>
        </ChartCard>
        <ChartCard title="Dosha vs Severity" className="h-56 sm:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={bsData} margin={{top:8,right:10,left:-22,bottom:16}}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(39,103,73,.08)"/>
              <XAxis dataKey="name" tick={{fontSize:10,fontFamily:"var(--font-sans)",fill:"var(--sage)"}}/>
              <YAxis tick={{fontSize:10,fontFamily:"var(--font-sans)",fill:"var(--mist)"}} axisLine={false} tickLine={false}/>
              <Tooltip {...tip}/><Legend wrapperStyle={{fontSize:"10px",fontFamily:"var(--font-sans)"}}/>
              <Bar dataKey="Sthula" stackId="a" fill="#1b814c" barSize={28}/>
              <Bar dataKey="Madhyama" stackId="a" fill="#8a5840" barSize={28}/>
              <Bar dataKey="Sukshma" stackId="a" fill="#0ea5e9" barSize={28} radius={[4,4,0,0]}/>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pb-4">
        {[
          {title:"Skin Types", data:skinData, color:"var(--sage)", layout:"vertical"},
          {title:"Digestion Patterns", data:digData, color:"var(--terracotta)"},
          {title:"Stress Responses", data:stressData, color:"var(--earth)"},
        ].map(({title,data:d,color,layout})=>(
          <ChartCard key={title} title={title} className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              {layout==="vertical" ? (
                <BarChart data={d} layout="vertical" margin={{top:8,right:10,left:8,bottom:16}}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(39,103,73,.08)"/>
                  <XAxis type="number" tick={{fontSize:10,fontFamily:"var(--font-sans)",fill:"var(--mist)"}} axisLine={false} tickLine={false}/>
                  <YAxis dataKey="name" type="category" tick={{fontSize:9,fontFamily:"var(--font-sans)",fill:"var(--sage)"}} width={82} axisLine={false} tickLine={false}/>
                  <Tooltip {...tip}/><Bar dataKey="value" fill={color} barSize={13} radius={[0,5,5,0]}/>
                </BarChart>
              ) : (
                <BarChart data={d} margin={{top:8,right:10,left:-22,bottom:34}}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(39,103,73,.08)"/>
                  <XAxis dataKey="name" tick={{fontSize:9,fontFamily:"var(--font-sans)",fill:"var(--sage)"}} angle={-25} textAnchor="end"/>
                  <YAxis tick={{fontSize:10,fontFamily:"var(--font-sans)",fill:"var(--mist)"}} axisLine={false} tickLine={false}/>
                  <Tooltip {...tip}/><Bar dataKey="value" fill={color} radius={[5,5,0,0]}/>
                </BarChart>
              )}
            </ResponsiveContainer>
          </ChartCard>
        ))}
      </div>
    </div>
  );
};

export default function Dashboard() {
  const [tab, setTab] = useState("Home");
  const [rawData, setRawData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(null);
  const [filters, setFilters] = useState({});
  const [filterOpen, setFilterOpen] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try { const r=await axios.get(PATIENTS_API); setRawData(r.data); setLastRefreshed(new Date()); }
    catch(e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(()=>{ fetchData(); },[]);

  const homeDefs=[{key:"bodyBuild",label:"Dosha",mapFn:v=>DOSHA_MAP[v]||v},{key:"sleepPattern",label:"Sleep",mapFn:v=>SLEEP_MAP[v]||v},{key:"vikritiType",label:"Vikriti",mapFn:v=>v},{key:"severity",label:"Severity",mapFn:v=>v}];
  const treatDefs=[{key:"isOpd",label:"OPD",mapFn:v=>v==="yes"?"Completed":"Pending"},{key:"isFollowup",label:"Follow-up",mapFn:v=>v==="yes"?"Scheduled":"None"},{key:"skinType",label:"Skin Type",mapFn:v=>SKIN_MAP[v]||v},{key:"severity",label:"Severity",mapFn:v=>v}];
  const curDefs=tab==="Home"?homeDefs:treatDefs;

  const optCache=useMemo(()=>{
    const c={};[...homeDefs,...treatDefs].forEach(({key,mapFn})=>{const s=new Set();rawData.forEach(r=>{const v=r[key];if(v!==null&&v!==undefined&&v!=="")s.add(mapFn(v));});c[key]=Array.from(s).sort();});return c;
  },[rawData,tab]);

  const filtered=useMemo(()=>rawData.filter(row=>{for(const {key,mapFn} of curDefs){const fv=filters[key];if(fv&&fv!=="All"&&mapFn(row[key])!==fv)return false;}return true;}),[rawData,filters,tab]);

  const activeCount=Object.values(filters).filter(v=>v&&v!=="All").length;

  const FilterPanel = () => (
    <>
      <div className="flex items-center gap-2 px-3 py-2 mb-5 rounded-xl" style={{ background:"rgba(255,255,255,.12)" }}>
        <Filter className="w-4 h-4 text-white/70"/>
        <span className="text-sm font-medium text-white" style={{ fontFamily:"var(--font-sans)" }}>Filters</span>
      </div>
      <div className="flex-1">
        {curDefs.map(({key,label})=>(
          <FilterSelect key={key} title={label} options={optCache[key]||[]} value={filters[key]||"All"}
            onChange={v=>setFilters(p=>({...p,[key]:v}))}/>
        ))}
      </div>
      <div className="mt-4 rounded-xl p-3 text-center" style={{ background:"rgba(0,0,0,.18)" }}>
        <div className="flex items-center justify-center gap-1.5 mb-1">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse inline-block"/>
          <span className="text-xs font-medium text-white">Live</span>
        </div>
        <p className="text-xs" style={{ color:"rgba(255,255,255,.6)" }}>{rawData.length} total · {filtered.length} shown</p>
      </div>
    </>
  );

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden" style={{ background:"var(--parchment)" }}>
      {/* Header */}
      <div className="shrink-0 px-4 sm:px-6 py-3 sm:h-16 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b"
        style={{ background:"white", borderColor:"var(--border)" }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background:"linear-gradient(135deg,var(--forest),var(--fern))" }}>
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
            </svg>
          </div>
          <div>
            <h1 className="text-base sm:text-xl font-light" style={{ fontFamily:"var(--font-serif)", color:"var(--forest)" }}>
              Ayurvedic Health & Dosha Analysis
            </h1>
            {lastRefreshed && <p className="text-[10px]" style={{ color:"var(--mist)" }}>Updated {lastRefreshed.toLocaleTimeString("en-IN")}</p>}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex p-1 rounded-full gap-1" style={{ background:"rgba(39,103,73,.08)" }}>
            {["Home","Treatment"].map(t=>(
              <button key={t} onClick={()=>{setTab(t==="Treatment"?"Treatment Analysis":t);setFilters({});}}
                className="px-3 sm:px-4 py-1.5 rounded-full text-xs sm:text-sm transition-all"
                style={{
                  fontFamily:"var(--font-sans)", fontWeight:500,
                  background:tab===(t==="Treatment"?"Treatment Analysis":t)?"white":"transparent",
                  color:tab===(t==="Treatment"?"Treatment Analysis":t)?"var(--forest)":"var(--mist)",
                  boxShadow:tab===(t==="Treatment"?"Treatment Analysis":t)?"var(--shadow-sm)":"none",
                }}>
                {t}
              </button>
            ))}
          </div>
          <button onClick={fetchData} disabled={loading} className="btn-ghost px-2.5 py-1.5 gap-1 text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${loading?"animate-spin":""}`}/>
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button onClick={()=>setFilters({})} className="btn-ghost px-2.5 py-1.5 gap-1 text-xs">
            <RotateCcw className="w-3.5 h-3.5"/>
            <span className="hidden sm:inline">Reset</span>
          </button>
          <button onClick={()=>setFilterOpen(true)} className="btn-primary lg:hidden px-3 py-1.5 text-xs relative" style={{ borderRadius:"50px" }}>
            <Filter className="w-3.5 h-3.5"/> Filters
            {activeCount>0 && <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">{activeCount}</span>}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {filterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={()=>setFilterOpen(false)}/>
          <div className="absolute right-0 top-0 h-full w-72 flex flex-col p-4 shadow-2xl overflow-y-auto anim-right"
            style={{ background:"linear-gradient(160deg,var(--forest),var(--fern))" }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-white">Filters</span>
              <button onClick={()=>setFilterOpen(false)} className="text-white/70 hover:text-white"><X className="w-5 h-5"/></button>
            </div>
            <FilterPanel/>
            <button onClick={()=>setFilterOpen(false)} className="mt-4 w-full bg-white py-2.5 rounded-xl text-sm font-medium"
              style={{ color:"var(--forest)" }}>Apply</button>
          </div>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-1 overflow-hidden p-2 sm:p-3 gap-3">
        {/* Sidebar filter */}
        <div className="hidden lg:flex w-52 shrink-0 rounded-2xl flex-col p-4 overflow-y-auto anim-left"
          style={{ background:"linear-gradient(160deg,var(--forest) 0%,var(--fern) 100%)" }}>
          <FilterPanel/>
        </div>
        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background:"rgba(39,103,73,.1)" }}>
                <RefreshCw className="w-6 h-6 animate-spin" style={{ color:"var(--fern)" }}/>
              </div>
              <p className="text-sm" style={{ color:"var(--mist)" }}>Loading patient data…</p>
            </div>
          ) : rawData.length===0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <div className="text-5xl anim-float">🌿</div>
              <p className="text-xl" style={{ fontFamily:"var(--font-serif)", color:"var(--forest)" }}>No patient data found</p>
              <p className="text-sm" style={{ color:"var(--mist)" }}>Add patients to see analytics</p>
            </div>
          ) : tab==="Home" ? <HomeDashboard data={filtered}/> : <TreatmentDashboard data={filtered}/>}
        </div>
      </div>
    </div>
  );
}
