// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import { Activity, RefreshCw, Zap, ShieldCheck, CheckCircle, Smartphone } from 'lucide-react';

// const API_BASE = "http://localhost:8080/api";

// export default function App() {
//   // Automatically retrieve the last used device from browser memory
//   const [deviceId, setDeviceId] = useState(localStorage.getItem('selected_device') || "");
//   const [devices, setDevices] = useState([]);
//   const [history, setHistory] = useState([]);
//   const [stats, setStats] = useState({});
//   const [aiReport, setAiReport] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // 1. Fetch all available devices
//   useEffect(() => {
//     axios.get(`${API_BASE}/logs/list-devices`)
//       .then(res => {
//         const found = res.data.devices || [];
//         setDevices(found);
//         // If nothing is saved in memory, auto-pick the first one found
//         if (!deviceId && found.length > 0) {
//           handleDeviceChange(found[0]);
//         }
//       });
//   }, []);

//   // 2. Fetch Stats and Chart data (Every 5 minutes)
//   useEffect(() => {
//     if (!deviceId) return;
//     const fetchStats = async () => {
//       try {
//         const [hRes, sRes] = await Promise.all([
//           axios.get(`${API_BASE}/logs/history/${deviceId}`),
//           axios.get(`${API_BASE}/logs/stats/${deviceId}`)
//         ]);
//         setHistory(hRes.data);
//         setStats(sRes.data);
//         setLoading(false);
//       } catch (e) { console.error("Telemetry fetch error", e); }
//     };

//     fetchStats();
//     const statsInterval = setInterval(fetchStats, 300000); 
//     return () => clearInterval(statsInterval);
//   }, [deviceId]);

//   // 3. Fetch AI Analysis
//   useEffect(() => {
//     if (!deviceId) return;
//     setAiReport(null);
//     axios.get(`${API_BASE}/ai/diagnosis/${deviceId}`)
//       .then(res => setAiReport(res.data))
//       .catch(() => setAiReport({ summary: "AI currently busy." }));
//   }, [deviceId]);

//   const handleDeviceChange = (id) => {
//     setDeviceId(id);
//     localStorage.setItem('selected_device', id); // Memory: Automatic detection for next time
//   };

//   if (!deviceId && devices.length === 0) return <div className="p-20 text-center">Waiting for Python Agent to send data...</div>;

//   return (
//     <div className="min-h-screen bg-slate-50 p-6 font-sans">
//       <div className="max-w-6xl mx-auto space-y-6">
        
//         {/* Header */}
//         <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm">
//           <div className="flex items-center gap-3">
//             <Activity className="text-indigo-600" size={32}/>
//             <h1 className="text-xl font-black">VoltGuard Dashboard</h1>
//           </div>
          
//           <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl">
//             <Smartphone size={18} className="text-indigo-500"/>
//             <select 
//               value={deviceId} 
//               onChange={(e) => handleDeviceChange(e.target.value)}
//               className="bg-transparent font-bold outline-none text-slate-700"
//             >
//               {devices.map(d => <option key={d} value={d}>{d}</option>)}
//             </select>
//           </div>
//         </div>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-indigo-500">
//             <p className="text-xs font-bold text-slate-400 uppercase">Avg CPU Load</p>
//             <h2 className="text-3xl font-black">{stats.avgCpu || 0}%</h2>
//           </div>
//           <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-emerald-500">
//             <p className="text-xs font-bold text-slate-400 uppercase">Live Battery</p>
//             <h2 className="text-3xl font-black">{stats.lastBattery || 0}%</h2>
//           </div>
//           <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-red-500">
//             <p className="text-xs font-bold text-slate-400 uppercase">Total Alerts</p>
//             <h2 className="text-3xl font-black">{stats.totalAlerts || 0}</h2>
//           </div>
//         </div>

//         {/* Charts and AI Section */}
//         <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//           <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm">
//             <h3 className="font-bold mb-4 flex items-center gap-2"><Zap size={18} className="text-yellow-500"/> Performance Trend</h3>
//             <div className="h-64">
//               <ResponsiveContainer width="100%" height="100%">
//                 <AreaChart data={history}>
//                   <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
//                   <XAxis dataKey="timestamp" hide />
//                   <YAxis hide />
//                   <Tooltip />
//                   <Area type="monotone" dataKey="cpu_load" stroke="#6366f1" fill="#6366f133" strokeWidth={3} />
//                 </AreaChart>
//               </ResponsiveContainer>
//             </div>
//           </div>

//           <div className="bg-indigo-600 text-white p-8 rounded-[2rem] shadow-xl">
//             <h4 className="font-black text-2xl mb-4">AI Health: {aiReport?.overallScore || "--"}</h4>
//             {aiReport ? (
//               <div className="space-y-4">
//                 <p className="text-sm italic opacity-90">"{aiReport.summary}"</p>
//                 <div>
//                   <p className="text-[10px] font-bold uppercase opacity-60">Action Plan</p>
//                   <ul className="text-xs space-y-2 mt-2">
//                     {aiReport.actionPlan?.map((s, index) => (
//                       <li key={index} className="flex gap-2">
//                         <CheckCircle size={12}/> 
//                         {/* Rendering Fix: Handles both objects and strings from AI */}
//                         {typeof s === 'object' ? (s.description || s.step || JSON.stringify(s)) : s}
//                       </li>
//                     ))}
//                   </ul>
//                 </div>
//               </div>
//             ) : <RefreshCw className="animate-spin mx-auto mt-10" size={32}/>}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, RefreshCw, Zap, CheckCircle, Smartphone } from 'lucide-react';

const API_BASE = "http://localhost:8080/api";

// In a real app, this would come from your Authentication state/context
const CURRENT_USER_ID = "HansikaReddy"; 

export default function App() {
  const [deviceId, setDeviceId] = useState(localStorage.getItem('selected_device') || "");
  const [userDevices, setUserDevices] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [aiReport, setAiReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch ONLY devices belonging to the current user
  useEffect(() => {
    // TIP: Your backend endpoint should be updated to support filtering by user
    // Example: /logs/list-devices?user=HansikaReddy
    axios.get(`${API_BASE}/logs/list-devices?owner=${CURRENT_USER_ID}`)
      .then(res => {
        const found = res.data.devices || [];
        
        // Filter on frontend as a fallback if your backend isn't filtered yet
        // (Note: Real security must happen on the Backend)
        const myDevices = found.filter(id => id.includes(CURRENT_USER_ID) || id === deviceId);
        
        setUserDevices(myDevices);

        if (!deviceId && myDevices.length > 0) {
          handleDeviceChange(myDevices[0]);
        }
      })
      .catch(err => console.error("Error fetching user devices", err));
  }, []);

  // 2. Fetch Stats and Chart data
  useEffect(() => {
    if (!deviceId) return;
    const fetchStats = async () => {
      try {
        setLoading(true);
        const [hRes, sRes] = await Promise.all([
          axios.get(`${API_BASE}/logs/history/${deviceId}`),
          axios.get(`${API_BASE}/logs/stats/${deviceId}`)
        ]);
        setHistory(hRes.data);
        setStats(sRes.data);
        setLoading(false);
      } catch (e) { 
        console.error("Telemetry fetch error", e);
        setLoading(false);
      }
    };

    fetchStats();
    const statsInterval = setInterval(fetchStats, 300000); 
    return () => clearInterval(statsInterval);
  }, [deviceId]);

  // 3. Fetch AI Analysis
  useEffect(() => {
    if (!deviceId) return;
    setAiReport(null);
    axios.get(`${API_BASE}/ai/diagnosis/${deviceId}`)
      .then(res => setAiReport(res.data))
      .catch(() => setAiReport({ summary: "AI analysis unavailable for this device." }));
  }, [deviceId]);

  const handleDeviceChange = (id) => {
    setDeviceId(id);
    localStorage.setItem('selected_device', id);
  };

  if (!deviceId && userDevices.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-10 bg-white rounded-3xl shadow-xl">
          <RefreshCw className="animate-spin mx-auto mb-4 text-indigo-600" size={48}/>
          <h2 className="text-xl font-bold text-slate-700">Connecting to your device...</h2>
          <p className="text-slate-400 mt-2">Make sure the VoltGuard agent is running on your machine.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <Activity className="text-indigo-600" size={32}/>
            <h1 className="text-xl font-black">VoltGuard Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-100 p-2 px-4 rounded-2xl">
            <Smartphone size={18} className="text-indigo-500"/>
            <span className="text-xs font-bold text-slate-400 uppercase mr-2">Your Device:</span>
            {userDevices.length > 1 ? (
              <select 
                value={deviceId} 
                onChange={(e) => handleDeviceChange(e.target.value)}
                className="bg-transparent font-bold outline-none text-slate-700 cursor-pointer"
              >
                {userDevices.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            ) : (
              <span className="font-bold text-slate-700">{deviceId}</span>
            )}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-indigo-500">
            <p className="text-xs font-bold text-slate-400 uppercase">Avg CPU Load</p>
            <h2 className="text-3xl font-black">{stats.avgCpu || 0}%</h2>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-emerald-500">
            <p className="text-xs font-bold text-slate-400 uppercase">Live Battery</p>
            <h2 className="text-3xl font-black">{stats.lastBattery || 0}%</h2>
          </div>
          <div className="bg-white p-6 rounded-3xl shadow-sm border-l-4 border-red-500">
            <p className="text-xs font-bold text-slate-400 uppercase">Total Alerts</p>
            <h2 className="text-3xl font-black">{stats.totalAlerts || 0}</h2>
          </div>
        </div>

        {/* Charts and AI Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Zap size={18} className="text-yellow-500"/> Performance Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip />
                  <Area type="monotone" dataKey="cpu_load" stroke="#6366f1" fill="#6366f133" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-indigo-600 text-white p-8 rounded-[2rem] shadow-xl">
            <h4 className="font-black text-2xl mb-4">AI Health: {aiReport?.overallScore || "--"}</h4>
            {aiReport ? (
              <div className="space-y-4">
                <p className="text-sm italic opacity-90">"{aiReport.summary}"</p>
                <div>
                  <p className="text-[10px] font-bold uppercase opacity-60">Action Plan</p>
                  <ul className="text-xs space-y-2 mt-2">
                    {aiReport.actionPlan?.map((s, index) => (
                      <li key={index} className="flex gap-2">
                        <CheckCircle size={12} className="shrink-0 mt-0.5"/> 
                        <span>{typeof s === 'object' ? (s.description || s.step) : s}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10">
                <RefreshCw className="animate-spin mb-4" size={32}/>
                <p className="text-sm opacity-70">Analyzing system health...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}