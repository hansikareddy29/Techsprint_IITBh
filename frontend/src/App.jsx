// // import React, { useState, useEffect } from 'react';
// // import axios from 'axios';
// // import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// // import { Activity, Cpu, Battery, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

// // const API_BASE = "http://localhost:8080/api";

// // export default function App() {
// //   const [deviceId, setDeviceId] = useState("");
// //   const [devices, setDevices] = useState([]);
// //   const [history, setHistory] = useState([]);
// //   const [stats, setStats] = useState({});
// //   const [aiReport, setAiReport] = useState(null);

// //   useEffect(() => {
// //     axios.get(`${API_BASE}/logs/list-devices`).then(res => {
// //       setDevices(res.data.devices);
// //       if (res.data.devices.length > 0) setDeviceId(res.data.devices[0]);
// //     });
// //   }, []);

// //   useEffect(() => {
// //     if (!deviceId) return;
// //     const fetch = async () => {
// //       try {
// //         const [h, s, a] = await Promise.all([
// //           axios.get(`${API_BASE}/logs/history/${deviceId}`),
// //           axios.get(`${API_BASE}/logs/stats/${deviceId}`),
// //           axios.get(`${API_BASE}/ai/diagnosis/${deviceId}`)
// //         ]);
// //         setHistory(h.data.slice(-20));
// //         setStats(s.data);
// //         setAiReport(a.data);
// //       } catch (e) { console.error(e); }
// //     };
// //     fetch();
// //     const inv = setInterval(fetch, 10000);
// //     return () => clearInterval(inv);
// //   }, [deviceId]);

// //   return (
// //     <div className="min-h-screen bg-slate-50 p-6">
// //       <div className="max-w-7xl mx-auto space-y-6">
// //         <header className="flex justify-between items-center">
// //             <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2"><Activity/> VoltGuard AI</h1>
// //             <select className="p-2 rounded border" onChange={(e)=>setDeviceId(e.target.value)} value={deviceId}>
// //                 {devices.map(d => <option key={d}>{d}</option>)}
// //             </select>
// //         </header>

// //         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// //             <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100">
// //                 <div className="text-xs font-bold text-slate-400 uppercase">Average CPU</div>
// //                 <div className="text-3xl font-black">{stats.avgCpu}%</div>
// //             </div>
// //             <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
// //                 <div className="text-xs font-bold text-slate-400 uppercase">Live Battery</div>
// //                 <div className="text-3xl font-black">{stats.lastBattery}%</div>
// //             </div>
// //             <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 text-red-600 font-bold">
// //                 <div className="text-xs font-bold text-slate-400 uppercase">Total Alerts</div>
// //                 <div className="text-3xl font-black">{stats.totalAlerts}</div>
// //             </div>
// //         </div>

// //         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
// //             <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm h-[400px]">
// //                 <ResponsiveContainer width="100%" height="100%">
// //                     <AreaChart data={history}>
// //                         <CartesianGrid strokeDasharray="3 3" vertical={false} />
// //                         <XAxis dataKey="timestamp" hide />
// //                         <YAxis domain={[0, 100]} />
// //                         <Tooltip />
// //                         <Area type="monotone" dataKey="cpu_load" stroke="#6366f1" fill="#e0e7ff" strokeWidth={3} />
// //                     </AreaChart>
// //                 </ResponsiveContainer>
// //             </div>

// //             <div className="bg-indigo-600 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between">
// //                 <div>
// //                     <div className="text-5xl font-black mb-1">{aiReport?.overallScore || "--"}/100</div>
// //                     <div className="text-xs uppercase font-bold opacity-70 tracking-widest mb-6">AI Health Score</div>
// //                     <p className="text-sm opacity-90 leading-relaxed mb-6 italic">"{aiReport?.summary || 'Waiting for system logs...'}"</p>
                    
// //                     <div className="space-y-4">
// //                         <div className="text-xs font-bold uppercase opacity-60">Action Plan</div>
// //                         {aiReport?.actionPlan?.map((step, i) => (
// //                             <div key={i} className="flex gap-2 text-sm"><CheckCircle size={16}/> {step}</div>
// //                         ))}
// //                     </div>
// //                 </div>
// //                 <div className="mt-8 pt-4 border-t border-white/10 text-xs opacity-60">Prediction: {aiReport?.prediction}</div>
// //             </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import { Activity, Cpu, Battery, CheckCircle, AlertCircle, RefreshCw, AppWindow, Zap } from 'lucide-react';

// // Using localhost to connect to your Docker backend on the same machine
// const API_BASE = "http://localhost:8080/api";

// export default function App() {
//   const [deviceId, setDeviceId] = useState("");
//   const [devices, setDevices] = useState([]);
//   const [history, setHistory] = useState([]);
//   const [stats, setStats] = useState({});
//   const [aiReport, setAiReport] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // 1. Fetch available devices on load
//   useEffect(() => {
//     axios.get(`${API_BASE}/logs/list-devices`)
//       .then(res => {
//         if (res.data.devices && res.data.devices.length > 0) {
//           setDevices(res.data.devices);
//           setDeviceId(res.data.devices[0]);
//         }
//       })
//       .catch(err => console.error("Could not fetch devices:", err));
//   }, []);

//   // 2. Fetch data for the selected device
//   useEffect(() => {
//     if (!deviceId) return;

//     const fetchAllData = async () => {
//       try {
//         const [historyRes, statsRes, aiRes] = await Promise.all([
//           axios.get(`${API_BASE}/logs/history/${deviceId}`),
//           axios.get(`${API_BASE}/logs/stats/${deviceId}`),
//           axios.get(`${API_BASE}/ai/diagnosis/${deviceId}`)
//         ]);

//         // Take last 30 data points for the chart
//         setHistory(historyRes.data.slice(-30));
//         setStats(statsRes.data);
//         setAiReport(aiRes.data);
//         setLoading(false);
//       } catch (e) {
//         console.error("Data Fetch Error:", e);
//       }
//     };

//     fetchAllData();
//     const interval = setInterval(fetchAllData, 10000); // Auto-refresh every 10s
//     return () => clearInterval(interval);
//   }, [deviceId]);

//   if (!deviceId) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-slate-50">
//         <div className="text-center">
//           <RefreshCw className="animate-spin mx-auto text-indigo-600 mb-4" size={48} />
//           <h2 className="text-xl font-semibold text-slate-700">Connecting to VoltGuard Agent...</h2>
//           <p className="text-slate-500">Make sure your Python script is running.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 p-4 md:p-8">
//       <div className="max-w-7xl mx-auto space-y-6">
        
//         {/* HEADER */}
//         <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
//             <div className="flex items-center gap-3">
//               <div className="p-3 bg-indigo-600 rounded-2xl text-white">
//                 <Activity size={28}/>
//               </div>
//               <div>
//                 <h1 className="text-2xl font-black text-slate-800 tracking-tight">VoltGuard AI</h1>
//                 <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Hardware Intelligence</p>
//               </div>
//             </div>
            
//             <div className="flex items-center gap-3">
//               <span className="text-sm font-semibold text-slate-500">Active Device:</span>
//               <select 
//                 className="bg-slate-100 border-none rounded-xl px-4 py-2 font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none"
//                 onChange={(e) => setDeviceId(e.target.value)} 
//                 value={deviceId}
//               >
//                 {devices.map(d => <option key={d} value={d}>{d}</option>)}
//               </select>
//             </div>
//         </header>

//         {/* TOP METRICS */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//             <div className="bg-white p-6 rounded-3xl shadow-sm border border-indigo-50 flex items-center justify-between">
//                 <div>
//                   <div className="text-xs font-bold text-slate-400 uppercase mb-1">Avg CPU Load</div>
//                   <div className="text-3xl font-black text-slate-800">{stats.avgCpu || 0}%</div>
//                 </div>
//                 <Cpu className="text-indigo-200" size={40}/>
//             </div>
//             <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-50 flex items-center justify-between">
//                 <div>
//                   <div className="text-xs font-bold text-slate-400 uppercase mb-1">Battery Level</div>
//                   <div className="text-3xl font-black text-slate-800">{stats.lastBattery || 0}%</div>
//                 </div>
//                 <Battery className="text-emerald-300" size={40}/>
//             </div>
//             <div className="bg-white p-6 rounded-3xl shadow-sm border border-red-50 flex items-center justify-between">
//                 <div>
//                   <div className="text-xs font-bold text-slate-400 uppercase mb-1">System Alerts</div>
//                   <div className="text-3xl font-black text-red-500">{stats.totalAlerts || 0}</div>
//                 </div>
//                 <AlertCircle className="text-red-200" size={40}/>
//             </div>
//         </div>

//         {/* MAIN ANALYSIS SECTION */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
//             {/* REAL-TIME CHART */}
//             <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
//                 <div className="flex justify-between items-center mb-8">
//                   <h3 className="font-bold text-slate-700 flex items-center gap-2">
//                     <Zap size={18} className="text-yellow-500"/> Live Performance Trend
//                   </h3>
//                   <span className="text-[10px] bg-slate-100 text-slate-500 px-3 py-1 rounded-full font-bold uppercase">Real-time Telemetry</span>
//                 </div>
//                 <div className="h-[350px] w-full">
//                   <ResponsiveContainer width="100%" height="100%">
//                       <AreaChart data={history}>
//                           <defs>
//                             <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
//                               <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
//                               <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
//                             </linearGradient>
//                           </defs>
//                           <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//                           <XAxis dataKey="timestamp" hide />
//                           <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
//                           <Tooltip 
//                             contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
//                           />
//                           <Area 
//                             type="monotone" 
//                             dataKey="cpu_load" 
//                             stroke="#6366f1" 
//                             fillOpacity={1} 
//                             fill="url(#colorCpu)" 
//                             strokeWidth={4} 
//                           />
//                       </AreaChart>
//                   </ResponsiveContainer>
//                 </div>
//             </div>

//             {/* AI DIAGNOSIS CARD */}
//             <div className="bg-indigo-600 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between relative overflow-hidden">
//                 {/* Decorative background element */}
//                 <div className="absolute top-[-20%] right-[-20%] w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
                
//                 <div className="relative z-10">
//                     <div className="flex justify-between items-start mb-6">
//                       <div>
//                           <div className="text-6xl font-black mb-1 leading-none">{aiReport?.overallScore || "--"}</div>
//                           <div className="text-[10px] uppercase font-bold opacity-70 tracking-[0.2em]">Health Score</div>
//                       </div>
//                       <div className="bg-white/20 p-2 rounded-xl backdrop-blur-md">
//                         <Activity size={24}/>
//                       </div>
//                     </div>

//                     <div className="bg-black/20 p-5 rounded-2xl mb-6 backdrop-blur-sm border border-white/10">
//                       <p className="text-sm font-medium leading-relaxed italic opacity-95">
//                         "{aiReport?.summary || 'Connecting to Gemini AI for analysis...'}"
//                       </p>
//                     </div>
                    
//                     <div className="space-y-6">
//                         {/* CULPRITS */}
//                         <div>
//                           <div className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-3 flex items-center gap-2">
//                             <AppWindow size={14}/> Primary Culprits
//                           </div>
//                           <div className="flex flex-wrap gap-2">
//                               {aiReport?.culprits?.map((app, i) => (
//                                   <span key={i} className="px-3 py-1 bg-white text-indigo-700 rounded-lg text-xs font-bold shadow-sm">
//                                     {app}
//                                   </span>
//                               )) || <span className="text-xs opacity-50">Calculating...</span>}
//                           </div>
//                         </div>

//                         {/* ACTION PLAN */}
//                         <div>
//                           <div className="text-[10px] font-black uppercase opacity-60 tracking-widest mb-3">AI Recovery Plan</div>
//                           <div className="space-y-3">
//                               {aiReport?.actionPlan?.map((step, i) => (
//                                   <div key={i} className="flex gap-3 text-sm items-start bg-white/5 p-2 rounded-lg border border-white/5">
//                                       <CheckCircle className="mt-0.5 flex-shrink-0 text-emerald-400" size={16}/> 
//                                       <span className="opacity-90">{step}</span>
//                                   </div>
//                               )) || <div className="text-xs opacity-50 italic">Generating solutions...</div>}
//                           </div>
//                         </div>
//                     </div>
//                 </div>

//                 <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
//                     <div className="text-[10px] opacity-60 uppercase font-black tracking-widest mb-2">Long-term Prediction</div>
//                     <div className="text-sm font-medium text-indigo-100 leading-snug">
//                       {aiReport?.prediction || "Analyzing usage patterns..."}
//                     </div>
//                 </div>
//             </div>

//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Cpu, Battery, CheckCircle, AlertCircle, RefreshCw, AppWindow, Zap } from 'lucide-react';

const API_BASE = "http://localhost:8080/api";

export default function App() {
  const [deviceId, setDeviceId] = useState("");
  const [devices, setDevices] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [aiReport, setAiReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch available devices list once on load
  useEffect(() => {
    axios.get(`${API_BASE}/logs/list-devices`)
      .then(res => {
        if (res.data.devices && res.data.devices.length > 0) {
          setDevices(res.data.devices);
          setDeviceId(res.data.devices[0]);
        }
      })
      .catch(err => console.error("Could not fetch device list:", err));
  }, []);

  // 2. Fetch hardware and AI data (Decoupled to prevent blocking)
  useEffect(() => {
    if (!deviceId) return;

    const fetchDashboardData = async () => {
      // --- PART A: Hardware Telemetry (History & Stats) ---
      // We do this first because it's the most important for the charts
      try {
        const [hRes, sRes] = await Promise.all([
          axios.get(`${API_BASE}/logs/history/${deviceId}`),
          axios.get(`${API_BASE}/logs/stats/${deviceId}`)
        ]);
        
        setHistory(hRes.data.slice(-30));
        setStats(sRes.data);
        setLoading(false);
        console.log("📈 Hardware data loaded successfully");
      } catch (e) {
        console.error("❌ Hardware Data Fetch Error:", e.message);
      }

      // --- PART B: AI Analysis (Diagnosis) ---
      // We do this SEPARATELY. If Gemini gives a 404/500 error, 
      // the rest of the dashboard will NOT crash.
      axios.get(`${API_BASE}/ai/diagnosis/${deviceId}`)
        .then(aiRes => {
          setAiReport(aiRes.data);
          console.log("🤖 AI Analysis received");
        })
        .catch(err => {
          console.warn("⚠️ AI Fetch Failed (likely API Key or Model error):", err.message);
          // Set a fallback message so the UI doesn't look broken
          setAiReport({
            overallScore: "--",
            summary: "AI analysis is currently unavailable. Real-time metrics are still active.",
            culprits: ["N/A"],
            actionPlan: ["Please check Gemini API Key in backend terminal"]
          });
        });
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000); // Live update every 10s
    return () => clearInterval(interval);
  }, [deviceId]);

  // Loading Screen
  if (loading && !deviceId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <RefreshCw className="animate-spin mx-auto text-indigo-600 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-slate-700">Connecting to VoltGuard...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-200">
                <Activity size={28}/>
              </div>
              <div>
                <h1 className="text-2xl font-black text-slate-800 tracking-tight">VoltGuard AI</h1>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Live Hardware Intelligence</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-slate-500">Device:</span>
              <select 
                className="bg-slate-100 border-none rounded-xl px-4 py-2 font-bold text-indigo-600 outline-none cursor-pointer"
                onChange={(e) => setDeviceId(e.target.value)} 
                value={deviceId}
              >
                {devices.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>
        </header>

        {/* TOP METRICS (STATS) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-indigo-50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Avg CPU Load</div>
                  <div className="text-4xl font-black text-slate-800">{stats.avgCpu || 0}%</div>
                </div>
                <div className="bg-indigo-50 p-4 rounded-2xl text-indigo-500"><Cpu size={32}/></div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-emerald-50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">Live Battery</div>
                  <div className="text-4xl font-black text-slate-800">{stats.lastBattery || 0}%</div>
                </div>
                <div className="bg-emerald-50 p-4 rounded-2xl text-emerald-500"><Battery size={32}/></div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-red-50 flex items-center justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1 tracking-wider">System Alerts</div>
                  <div className="text-4xl font-black text-red-500">{stats.totalAlerts || 0}</div>
                </div>
                <div className="bg-red-50 p-4 rounded-2xl text-red-500"><AlertCircle size={32}/></div>
            </div>
        </div>

        {/* MAIN SECTION: CHART + AI CARD */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* REAL-TIME TREND CHART */}
            <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-bold text-slate-700 flex items-center gap-2">
                    <Zap size={18} className="text-yellow-500"/> Performance Trend
                  </h3>
                </div>
                <div className="h-[380px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={history}>
                          <defs>
                            <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                              <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                          <XAxis dataKey="timestamp" hide />
                          <YAxis domain={[0, 100]} axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} />
                          <Tooltip 
                            contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                          />
                          <Area 
                            type="monotone" 
                            dataKey="cpu_load" 
                            stroke="#6366f1" 
                            fillOpacity={1} 
                            fill="url(#colorCpu)" 
                            strokeWidth={4} 
                          />
                      </AreaChart>
                  </ResponsiveContainer>
                </div>
            </div>

            {/* AI DIAGNOSIS CARD */}
            <div className="bg-indigo-600 text-white p-8 rounded-[2.5rem] shadow-2xl flex flex-col justify-between relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
                
                <div className="relative z-10">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                          <div className="text-6xl font-black mb-1">{aiReport?.overallScore || "--"}</div>
                          <div className="text-[10px] uppercase font-bold opacity-70 tracking-widest">Health Score</div>
                      </div>
                      <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                        <Activity size={24}/>
                      </div>
                    </div>

                    <div className="bg-black/20 p-5 rounded-2xl mb-6 border border-white/10">
                      <p className="text-sm font-medium leading-relaxed italic opacity-95">
                        "{aiReport?.summary || 'Analyzing system telemetry...'}"
                      </p>
                    </div>
                    
                    <div className="space-y-6">
                        <div>
                          <div className="text-[10px] font-black uppercase opacity-60 mb-3 flex items-center gap-2">
                            <AppWindow size={14}/> Top Culprits
                          </div>
                          <div className="flex flex-wrap gap-2">
                              {aiReport?.culprits?.map((app, i) => (
                                  <span key={i} className="px-3 py-1 bg-white/20 rounded-lg text-xs font-bold border border-white/20">
                                    {app}
                                  </span>
                              )) || <span className="text-xs opacity-50 italic tracking-wider">Monitoring processes...</span>}
                          </div>
                        </div>

                        <div>
                          <div className="text-[10px] font-black uppercase opacity-60 mb-3 tracking-widest">AI Action Plan</div>
                          <div className="space-y-3">
                              {aiReport?.actionPlan?.map((step, i) => (
                                  <div key={i} className="flex gap-3 text-sm items-start bg-white/5 p-2 rounded-xl">
                                      <CheckCircle className="mt-0.5 flex-shrink-0 text-emerald-400" size={16}/> 
                                      <span className="opacity-90 leading-tight">{step}</span>
                                  </div>
                              )) || <div className="text-xs opacity-50 italic">Generating advice...</div>}
                          </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                    <div className="text-[10px] opacity-60 uppercase font-black mb-1 tracking-widest">AI Prediction</div>
                    <div className="text-sm font-medium text-indigo-100 italic">
                      {aiReport?.prediction || "Trend analysis in progress..."}
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
}