// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import { Activity, RefreshCw, Zap, CheckCircle, Smartphone } from 'lucide-react';

// const API_BASE = "http://localhost:8080/api";



// export default function App() {
//   const [deviceId, setDeviceId] = useState(localStorage.getItem('selected_device') || "");
//   const [userDevices, setUserDevices] = useState([]);
//   const [history, setHistory] = useState([]);
//   const [stats, setStats] = useState({});
//   const [aiReport, setAiReport] = useState(null);
//   const [loading, setLoading] = useState(true);

//   // 1. Fetch ONLY devices belonging to the current user
//   useEffect(() => {
    
//     axios.get(`${API_BASE}/logs/list-devices?owner=${deviceId}`)
//       .then(res => {
//         const found = res.data.devices || [];
        
//         const myDevices = found.filter(id => id.includes(deviceId));
        
//         setUserDevices(myDevices);

//         if (!deviceId && myDevices.length > 0) {
//           handleDeviceChange(myDevices[0]);
//         }
//       })
//       .catch(err => console.error("Error fetching user devices", err));
//   }, []);

//   // 2. Fetch Stats and Chart data
//   useEffect(() => {
//     if (!deviceId) return;
//     const fetchStats = async () => {
//       try {
//         setLoading(true);
//         const [hRes, sRes] = await Promise.all([
//           axios.get(`${API_BASE}/logs/history/${deviceId}`),
//           axios.get(`${API_BASE}/logs/stats/${deviceId}`)
//         ]);
//         setHistory(hRes.data);
//         setStats(sRes.data);
//         setLoading(false);
//       } catch (e) { 
//         console.error("Telemetry fetch error", e);
//         setLoading(false);
//       }
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
//       .catch(() => setAiReport({ summary: "AI analysis unavailable for this device." }));
//   }, [deviceId]);

//   const handleDeviceChange = (id) => {
//     setDeviceId(id);
//     localStorage.setItem('selected_device', id);
//   };

//   if (!deviceId && userDevices.length === 0) {
//     return (
//       <div className="flex items-center justify-center min-h-screen">
//         <div className="text-center p-10 bg-white rounded-3xl shadow-xl">
//           <RefreshCw className="animate-spin mx-auto mb-4 text-indigo-600" size={48}/>
//           <h2 className="text-xl font-bold text-slate-700">Connecting to your device...</h2>
//           <p className="text-slate-400 mt-2">Make sure the VoltGuard agent is running on your machine.</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-slate-50 p-6 font-sans">
//       <div className="max-w-6xl mx-auto space-y-6">
        
//         {/* Header */}
//         <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm">
//           <div className="flex items-center gap-3">
//             <Activity className="text-indigo-600" size={32}/>
//             <h1 className="text-xl font-black">VoltGuard Dashboard</h1>
//           </div>
          
//           <div className="flex items-center gap-3 bg-slate-100 p-2 px-4 rounded-2xl">
//             <Smartphone size={18} className="text-indigo-500"/>
//             <span className="text-xs font-bold text-slate-400 uppercase mr-2">Your Device:</span>
//             {userDevices.length > 1 ? (
//               <select 
//                 value={deviceId} 
//                 onChange={(e) => handleDeviceChange(e.target.value)}
//                 className="bg-transparent font-bold outline-none text-slate-700 cursor-pointer"
//               >
//                 {userDevices.map(d => <option key={d} value={d}>{d}</option>)}
//               </select>
//             ) : (
//               <span className="font-bold text-slate-700">{deviceId}</span>
//             )}
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
            
//             {/* Display the reason below the number */}
//             <div className="mt-3 pt-2 border-t border-slate-50">
//                 <p className="text-[10px] font-bold text-slate-400 uppercase">Latest Remark:</p>
//                 <p className={`text-xs font-bold ${stats.totalAlerts > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
//                     {stats.latestAlertReason}
//                 </p>
//             </div>
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
//                   <YAxis domain={[0, 100]} hide />
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
//   <p className="text-sm italic opacity-90">"{aiReport.summary}"</p>
//   <div>
//     <p className="text-[10px] font-bold uppercase opacity-60">Action Plan</p>
    
    
//           <ul className="text-xs space-y-5 mt-4">
//             {aiReport.actionPlan?.map((s, index) => (
//               <li key={index} className="flex gap-3">
//                 {/* Icon stays aligned to the top */}
//                 <CheckCircle size={16} className="shrink-0 text-emerald-400 mt-0.5"/> 
                
//                 <div className="flex flex-col">
//                   {/* 1. THE HIGHLIGHT (The 'step' field) */}
//                   <p className="font-bold text-[13px] leading-tight tracking-tight text-white">
//                     {typeof s === 'object' ? s.step : "Recommendation"}
//                   </p>
                  
//                   {/* 2. THE EXPLANATION (The 'description' field) */}
//                   <p className="opacity-70 mt-1.5 leading-normal text-slate-100">
//                     {typeof s === 'object' ? s.description : s}
//                   </p>
//                 </div>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>
//             ) : (
//               <div className="flex flex-col items-center justify-center py-10">
//                 <RefreshCw className="animate-spin mb-4" size={32}/>
//                 <p className="text-sm opacity-70">Analyzing system health...</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


//2.Suneetha

// 




//3.Suneetha
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import { 
//   Activity, RefreshCw, Zap, CheckCircle, Smartphone, Search, Menu, 
//   Mic, Plus, ArrowUpRight, MoreVertical, Sun, Moon 
// } from 'lucide-react';

// const API_BASE = "http://localhost:8080/api";

// export default function App() {
//   const [deviceId, setDeviceId] = useState(localStorage.getItem('selected_device') || "");
//   const [userDevices, setUserDevices] = useState([]);
//   const [history, setHistory] = useState([]);
//   const [stats, setStats] = useState({});
//   const [aiReport, setAiReport] = useState(null);
//   const [loading, setLoading] = useState(true);
  
//   // Theme State
//   const [isDark, setIsDark] = useState(localStorage.getItem('theme') !== 'light');

//   useEffect(() => {
//     localStorage.setItem('theme', isDark ? 'dark' : 'light');
//   }, [isDark]);

//   // --- LOGIC PRESERVED ---
//   useEffect(() => {
//     axios.get(`${API_BASE}/logs/list-devices?owner=${deviceId}`)
//       .then(res => {
//         const found = res.data.devices || [];
//         const myDevices = found.filter(id => id.includes(deviceId));
//         setUserDevices(myDevices);
//         if (!deviceId && myDevices.length > 0) handleDeviceChange(myDevices[0]);
//       })
//       .catch(err => console.error("Error fetching user devices", err));
//   }, []);

//   useEffect(() => {
//     if (!deviceId) return;
//     const fetchStats = async () => {
//       try {
//         setLoading(true);
//         const [hRes, sRes] = await Promise.all([
//           axios.get(`${API_BASE}/logs/history/${deviceId}`),
//           axios.get(`${API_BASE}/logs/stats/${deviceId}`)
//         ]);
//         setHistory(hRes.data);
//         setStats(sRes.data);
//         setLoading(false);
//       } catch (e) { console.error(e); setLoading(false); }
//     };
//     fetchStats();
//     const statsInterval = setInterval(fetchStats, 300000); 
//     return () => clearInterval(statsInterval);
//   }, [deviceId]);

//   useEffect(() => {
//     if (!deviceId) return;
//     setAiReport(null);
//     axios.get(`${API_BASE}/ai/diagnosis/${deviceId}`)
//       .then(res => setAiReport(res.data))
//       .catch(() => setAiReport({ summary: "AI analysis unavailable." }));
//   }, [deviceId]);

//   const handleDeviceChange = (id) => {
//     setDeviceId(id);
//     localStorage.setItem('selected_device', id);
//   };

//   // Dynamic Theme Classes
//   const theme = {
//     bg: isDark ? 'bg-[#050505] text-white' : 'bg-slate-50 text-slate-900',
//     card: isDark ? 'bg-[#121212] border-white/10' : 'bg-white border-slate-200 shadow-sm',
//     input: isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-slate-100 border-slate-200',
//     textMuted: isDark ? 'text-zinc-500' : 'text-slate-400',
//     aiBubble: isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-slate-50 border-slate-200',
//     chartGrid: isDark ? '#ffffff05' : '#00000005',
//   };

//   if (!deviceId && userDevices.length === 0) {
//     return (
//       <div className={`flex items-center justify-center min-h-screen ${theme.bg}`}>
//         <RefreshCw className="animate-spin text-purple-500" size={48}/>
//       </div>
//     );
//   }

//   return (
//     <div className={`min-h-screen transition-colors duration-500 font-sans ${theme.bg}`}>
//       {/* Background Decorative Glows (Only in Dark Mode) */}
//       {isDark && (
//         <>
//           <div className="fixed top-0 right-0 w-[500px] h-[500px] bg-purple-600/10 blur-[120px] rounded-full -z-10" />
//           <div className="fixed bottom-0 left-0 w-[400px] h-[400px] bg-pink-600/5 blur-[100px] rounded-full -z-10" />
//         </>
//       )}

//       <div className="max-w-5xl mx-auto p-6 space-y-8">
        
//         {/* Header */}
//         <header className="flex justify-between items-center">
//           <div className={`p-2 rounded-full border ${theme.card}`}>
//             <Menu size={20} />
//           </div>
          
//           <div className="flex items-center gap-3">
//             {/* Theme Toggle */}
//             <button 
//               onClick={() => setIsDark(!isDark)}
//               className={`p-2 rounded-full transition-all border ${theme.card} hover:scale-110`}
//             >
//               {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-indigo-600" />}
//             </button>
//             <button className={`${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'} px-6 py-2 rounded-full font-bold text-sm transition`}>
//               VoltGuard Pro
//             </button>
//           </div>
//         </header>

//         {/* Hero */}
//         <section>
//           <h1 className="text-4xl font-semibold tracking-tight">
//             Analyze, protect,<br /> <span className={theme.textMuted}>be optimized</span>
//           </h1>
//           <div className="mt-6 relative max-w-md">
//              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`} size={18} />
//              <input 
//               disabled
//               placeholder="Search history..." 
//               className={`w-full border rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none ${theme.input}`}
//              />
//           </div>
//         </section>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className={`border p-6 rounded-[2.5rem] relative group ${theme.card} border-l-4 ${!isDark && 'border-l-indigo-500'}`}>
//             <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted}`}>CPU Load</p>
//             <h2 className="text-3xl font-bold mt-2">{stats.avgCpu || 0}%</h2>
//             <ArrowUpRight className="absolute top-6 right-6 opacity-30 group-hover:opacity-100 transition" size={18} />
//           </div>
//           <div className={`border p-6 rounded-[2.5rem] relative group ${theme.card} border-l-4 ${!isDark && 'border-l-emerald-500'}`}>
//             <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted}`}>Battery</p>
//             <h2 className="text-3xl font-bold mt-2">{stats.lastBattery || 0}%</h2>
//             <ArrowUpRight className="absolute top-6 right-6 opacity-30 group-hover:opacity-100 transition" size={18} />
//           </div>
//           <div className={`border p-6 rounded-[2.5rem] relative group ${theme.card}`}>
//             <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted}`}>Device</p>
//             <select 
//               value={deviceId} 
//               onChange={(e) => handleDeviceChange(e.target.value)}
//               className="bg-transparent font-bold text-lg mt-1 outline-none text-purple-500 cursor-pointer w-full appearance-none"
//             >
//               {userDevices.map(d => <option key={d} value={d} className={isDark ? "bg-black" : "bg-white"}>{d}</option>)}
//             </select>
//           </div>
//         </div>

//         {/* Performance Trend */}
//         <div className={`border p-8 rounded-[2.5rem] ${theme.card}`}>
//           <div className="flex justify-between items-center mb-6">
//             <h3 className="font-bold flex items-center gap-2"><Zap size={18} className="text-yellow-500"/> Performance</h3>
//             <span className={`text-[10px] px-3 py-1 rounded-full ${isDark ? 'bg-white/5 text-zinc-400' : 'bg-slate-100 text-slate-500'}`}>LIVE</span>
//           </div>
//           <div className="h-48">
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={history}>
//                 <defs>
//                   <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
//                     <stop offset="5%" stopColor="#a855f7" stopOpacity={0.3}/>
//                     <stop offset="95%" stopColor="#a855f7" stopOpacity={0}/>
//                   </linearGradient>
//                 </defs>
//                 <CartesianGrid vertical={false} stroke={theme.chartGrid} />
//                 <XAxis dataKey="timestamp" hide />
//                 <YAxis domain={[0, 100]} hide />
//                 <Tooltip contentStyle={{backgroundColor: isDark ? '#1a1a1a' : '#fff', border: 'none', borderRadius: '12px'}} />
//                 <Area type="monotone" dataKey="cpu_load" stroke="#a855f7" fill="url(#colorCpu)" strokeWidth={3} />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* AI Section */}
//         <div className="space-y-4">
//           <h3 className={`text-xs font-bold uppercase tracking-widest px-2 ${theme.textMuted}`}>AI Analysis</h3>
//           <div className={`border rounded-[2.5rem] p-6 space-y-6 ${theme.card}`}>
//             <div className="flex flex-col gap-4">
//               {/* User Bubble */}
//               <div className="self-end bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-3xl rounded-tr-none max-w-[80%] text-sm font-medium text-white shadow-lg">
//                 System health check requested.
//               </div>

//               {/* AI Bubble */}
//               <div className={`p-6 rounded-3xl rounded-tl-none border max-w-[90%] ${theme.aiBubble}`}>
//                 {!aiReport ? (
//                    <div className="flex items-center gap-3 italic text-sm"><RefreshCw className="animate-spin" size={16} /> Analyzing...</div>
//                 ) : (
//                   <div className="space-y-4">
//                     <div className="flex items-center gap-2">
//                       <div className="w-6 h-6 bg-gradient-to-tr from-orange-400 to-pink-500 rounded-full flex items-center justify-center">
//                         <Zap size={10} className="text-white" />
//                       </div>
//                       <span className={`text-[10px] font-black uppercase ${theme.textMuted}`}>VoltGuard AI</span>
//                     </div>
//                     <p className="leading-relaxed text-[15px]">{aiReport.summary}</p>
//                     <div className="grid grid-cols-1 gap-3 mt-4">
//                       {aiReport.actionPlan?.map((s, i) => (
//                         <div key={i} className={`flex gap-4 p-4 rounded-2xl border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100'}`}>
//                           <CheckCircle size={18} className="text-purple-500 shrink-0 mt-0.5" />
//                           <div>
//                             <p className="font-bold text-sm">{typeof s === 'object' ? s.step : "Task"}</p>
//                             <p className={`text-xs mt-1 ${theme.textMuted}`}>{typeof s === 'object' ? s.description : s}</p>
//                           </div>
//                         </div>
//                       ))}
//                     </div>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Input Mockup */}
//             <div className={`border rounded-full py-4 px-6 flex items-center justify-between text-sm ${theme.input}`}>
//                  <span className={theme.textMuted}>Ask VoltGuard...</span>
//                  <div className="flex gap-4 opacity-40"><Mic size={18} /><Plus size={18} /></div>
//             </div>
//           </div>
//         </div>

//         {/* Footer Remark */}
//         <div className={`flex items-center justify-between p-6 rounded-[2rem] border ${theme.card}`}>
//           <div>
//             <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted}`}>Latest Alert</p>
//             <p className={`text-sm font-bold mt-1 ${stats.totalAlerts > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
//               {stats.latestAlertReason || "All systems operational"}
//             </p>
//           </div>
//           <div className={`h-10 w-10 rounded-full flex items-center justify-center ${isDark ? 'bg-white/5' : 'bg-slate-100'}`}>
//              <MoreVertical size={16} className={theme.textMuted} />
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }

//4.Suneetha
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import { 
//   Activity, RefreshCw, Zap, CheckCircle, Smartphone, Search, Menu, 
//   Mic, Plus, ArrowUpRight, MoreVertical, Sun, Moon, Send 
// } from 'lucide-react';

// const API_BASE = "http://localhost:8080/api";

// export default function App() {
//   const [deviceId, setDeviceId] = useState(localStorage.getItem('selected_device') || "");
//   const [userDevices, setUserDevices] = useState([]);
//   const [history, setHistory] = useState([]);
//   const [stats, setStats] = useState({});
//   const [aiReport, setAiReport] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [isDark, setIsDark] = useState(localStorage.getItem('theme') !== 'light');

//   // --- NEW FUNCTIONAL STATES ---
//   const [searchQuery, setSearchQuery] = useState("");
//   const [chatInput, setChatInput] = useState("");
//   const [isListening, setIsListening] = useState(false);
//   const [chatMessages, setChatMessages] = useState([
//     { role: 'ai', text: "Hello! I'm VoltGuard AI. I've analyzed your system health below. You can ask me follow-up questions here." }
//   ]);

//   useEffect(() => {
//     localStorage.setItem('theme', isDark ? 'dark' : 'light');
//   }, [isDark]);

//   // --- VOICE RECORDER LOGIC ---
//   const handleMicClick = () => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) {
//       alert("Speech recognition not supported in this browser.");
//       return;
//     }
//     const recognition = new SpeechRecognition();
//     recognition.onstart = () => setIsListening(true);
//     recognition.onend = () => setIsListening(false);
//     recognition.onresult = (event) => {
//       setChatInput(event.results[0][0].transcript);
//     };
//     recognition.start();
//   };

//   // --- CHAT LOGIC ---
//   const handleSendMessage = async (e) => {
//     e.preventDefault();
//     if (!chatInput.trim()) return;

//     const userMsg = { role: 'user', text: chatInput };
//     setChatMessages(prev => [...prev, userMsg]);
//     const currentInput = chatInput;
//     setChatInput("");

//     try {
//       const res = await axios.post(`${API_BASE}/ai/ask`, { query: currentInput, deviceId });
//       setChatMessages(prev => [...prev, { role: 'ai', text: res.data.answer || res.data.summary }]);
//     } catch (err) {
//       setChatMessages(prev => [...prev, { role: 'ai', text: "I'm processing your request. Please check the health report below for immediate actions." }]);
//     }
//   };

//   // --- SEARCH FILTER LOGIC ---
//   const filteredHistory = history.filter(item => 
//     item.timestamp?.toLowerCase().includes(searchQuery.toLowerCase()) ||
//     item.cpu_load?.toString().includes(searchQuery)
//   );

//   // --- DATA FETCHING (Old Logic) ---
//   useEffect(() => {
//     axios.get(`${API_BASE}/logs/list-devices?owner=${deviceId}`)
//       .then(res => {
//         const found = res.data.devices || [];
//         const myDevices = found.filter(id => id.includes(deviceId));
//         setUserDevices(myDevices);
//         if (!deviceId && myDevices.length > 0) handleDeviceChange(myDevices[0]);
//       })
//       .catch(err => console.error(err));
//   }, []);

//   useEffect(() => {
//     if (!deviceId) return;
//     const fetchData = async () => {
//       try {
//         setLoading(true);
//         const [hRes, sRes, aRes] = await Promise.all([
//           axios.get(`${API_BASE}/logs/history/${deviceId}`),
//           axios.get(`${API_BASE}/logs/stats/${deviceId}`),
//           axios.get(`${API_BASE}/ai/diagnosis/${deviceId}`)
//         ]);
//         setHistory(hRes.data);
//         setStats(sRes.data);
//         setAiReport(aRes.data);
//         setLoading(false);
//       } catch (e) { console.error(e); setLoading(false); }
//     };
//     fetchData();
//   }, [deviceId]);

//   const handleDeviceChange = (id) => {
//     setDeviceId(id);
//     localStorage.setItem('selected_device', id);
//   };

//   const theme = {
//     bg: isDark ? 'bg-[#050505] text-white' : 'bg-slate-50 text-slate-900',
//     card: isDark ? 'bg-[#121212] border-white/10' : 'bg-white border-slate-200 shadow-sm',
//     input: isDark ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-slate-900',
//     textMuted: isDark ? 'text-zinc-500' : 'text-slate-400',
//     aiBubble: isDark ? 'bg-[#1a1a1a] border-white/10' : 'bg-slate-50 border-slate-200',
//   };

//   return (
//     <div className={`min-h-screen transition-colors duration-500 font-sans pb-10 ${theme.bg}`}>
//       <div className="max-w-5xl mx-auto p-6 space-y-8">
        
//         {/* Header */}
//         <header className="flex justify-between items-center">
//           <div className={`p-2 rounded-full border ${theme.card}`}><Menu size={20} /></div>
//           <div className="flex items-center gap-3">
//             <button onClick={() => setIsDark(!isDark)} className={`p-2 rounded-full border ${theme.card}`}>
//               {isDark ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-indigo-600" />}
//             </button>
//             <button className={`${isDark ? 'bg-white text-black' : 'bg-slate-900 text-white'} px-6 py-2 rounded-full font-bold text-sm`}>VoltGuard Pro</button>
//           </div>
//         </header>

//         {/* 1. Search (Functional) */}
//         <section>
//           <h1 className="text-4xl font-semibold tracking-tight">Protect & <span className={theme.textMuted}>Optimize</span></h1>
//           <div className="mt-6 relative max-w-md">
//              <Search className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme.textMuted}`} size={18} />
//              <input 
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               placeholder="Search history data..." 
//               className={`w-full border rounded-full py-3 pl-12 pr-4 text-sm focus:outline-none ${theme.input}`}
//              />
//           </div>
//         </section>

//         {/* Stats Grid */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
//           <div className={`border p-6 rounded-[2.5rem] ${theme.card}`}>
//             <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted}`}>Avg CPU</p>
//             <h2 className="text-3xl font-bold mt-2">{stats.avgCpu || 0}%</h2>
//           </div>
//           <div className={`border p-6 rounded-[2.5rem] ${theme.card}`}>
//             <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted}`}>Live Battery</p>
//             <h2 className="text-3xl font-bold mt-2">{stats.lastBattery || 0}%</h2>
//           </div>
//           <div className={`border p-6 rounded-[2.5rem] ${theme.card}`}>
//             <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted}`}>Current Device</p>
//             <select value={deviceId} onChange={(e) => handleDeviceChange(e.target.value)} className="bg-transparent font-bold mt-1 outline-none text-purple-500 w-full appearance-none">
//               {userDevices.map(d => <option key={d} value={d} className={isDark ? "bg-black" : "bg-white"}>{d}</option>)}
//             </select>
//           </div>
//         </div>

//         {/* Performance Chart */}
//         <div className={`border p-8 rounded-[2.5rem] ${theme.card}`}>
//            <h3 className="font-bold flex items-center gap-2 mb-6"><Zap size={18} className="text-yellow-500"/> Performance Trend</h3>
//            <div className="h-48">
//             <ResponsiveContainer width="100%" height="100%">
//               <AreaChart data={filteredHistory}>
//                 <CartesianGrid vertical={false} stroke={isDark ? "#ffffff05" : "#00000005"} />
//                 <Tooltip contentStyle={{backgroundColor: isDark ? '#1a1a1a' : '#fff', border: 'none', borderRadius: '12px'}} />
//                 <Area type="monotone" dataKey="cpu_load" stroke="#a855f7" fillOpacity={0.1} fill="#a855f7" strokeWidth={3} />
//               </AreaChart>
//             </ResponsiveContainer>
//           </div>
//         </div>

//         {/* 2. Old Feature: AI Action Plan + 3. New Feature: Chat */}
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
//           {/* AI HEALTH REPORT (Restored Old Feature) */}
//           <div className={`border rounded-[2.5rem] p-8 ${isDark ? 'bg-indigo-900/20 border-indigo-500/20' : 'bg-indigo-50 border-indigo-100'}`}>
//             <h4 className="font-black text-xl mb-4 flex items-center gap-2">
//               <Activity className="text-indigo-500" /> AI Health: {aiReport?.overallScore || "Analyzing..."}
//             </h4>
//             <p className="text-sm italic opacity-80 mb-6">"{aiReport?.summary || "Standby..."}"</p>
//             <div className="space-y-4">
//               {aiReport?.actionPlan?.map((s, index) => (
//                 <div key={index} className="flex gap-3 items-start">
//                   <CheckCircle size={16} className="text-emerald-500 mt-1 shrink-0" />
//                   <div>
//                     <p className="font-bold text-sm">{s.step || "Optimization"}</p>
//                     <p className="text-xs opacity-60">{s.description || s}</p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>

//           {/* AI CHAT (New Feature) */}
//           <div className={`border rounded-[2.5rem] p-6 flex flex-col h-[400px] ${theme.card}`}>
//             <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
//               {chatMessages.map((msg, i) => (
//                 <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
//                   <div className={`max-w-[85%] p-4 rounded-3xl text-sm ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-tr-none' : `${theme.aiBubble} rounded-tl-none border`}`}>
//                     {msg.text}
//                   </div>
//                 </div>
//               ))}
//             </div>
//             <form onSubmit={handleSendMessage} className="relative">
//               <input 
//                 value={chatInput} onChange={(e) => setChatInput(e.target.value)}
//                 placeholder={isListening ? "Listening..." : "Ask follow-up..."}
//                 className={`w-full border rounded-full py-4 pl-6 pr-20 text-sm focus:outline-none ${theme.input} ${isListening ? 'border-red-500' : ''}`}
//               />
//               <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
//                 <button type="button" onClick={handleMicClick} className={`p-2 rounded-full ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-zinc-500'}`}><Mic size={18} /></button>
//                 <button type="submit" className="p-2 text-purple-500"><Send size={18} /></button>
//               </div>
//             </form>
//           </div>
//         </div>

//         {/* Footer Remark */}
//         <div className={`flex items-center justify-between p-6 rounded-[2rem] border ${theme.card}`}>
//           <div>
//             <p className={`text-[10px] font-bold uppercase tracking-widest ${theme.textMuted}`}>Latest Remark</p>
//             <p className={`text-sm font-bold mt-1 ${stats.totalAlerts > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
//               {stats.latestAlertReason || "System operating normally"}
//             </p>
//           </div>
//           <MoreVertical size={16} className={theme.textMuted} />
//         </div>

//       </div>
//     </div>
//   );
// }

//5.Suneetha
// import React, { useState, useEffect, useMemo, useRef } from 'react';
// import axios from 'axios';
// import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
// import { 
//   Activity, RefreshCw, Zap, CheckCircle, Smartphone, Search, Menu, 
//   Mic, Plus, ArrowUpRight, MoreVertical, Sun, Moon, Send, AlertTriangle, Cpu
// } from 'lucide-react';

// const API_BASE = "http://localhost:8080/api";

// export default function App() {
//   // --- CORE STATES ---
//   const [deviceId, setDeviceId] = useState(localStorage.getItem('selected_device') || "");
//   const [userDevices, setUserDevices] = useState([]);
//   const [history, setHistory] = useState([]);
//   const [stats, setStats] = useState({});
//   const [aiReport, setAiReport] = useState(null);
//   const [isDark, setIsDark] = useState(localStorage.getItem('theme') !== 'light');
  
//   // --- UX STATES ---
//   const [searchQuery, setSearchQuery] = useState("");
//   const [chatInput, setChatInput] = useState("");
//   const [isListening, setIsListening] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);
//   const [chatMessages, setChatMessages] = useState([
//     { role: 'ai', text: "Systems online. I've performed a deep-scan of your hardware. How can I assist with optimization?" }
//   ]);

//   const chatEndRef = useRef(null);
//   const scrollToBottom = () => chatEndRef.current?.scrollIntoView({ behavior: "smooth" });

//   useEffect(() => {
//     localStorage.setItem('theme', isDark ? 'dark' : 'light');
//     scrollToBottom();
//   }, [isDark, chatMessages]);

//   // --- SMART SEARCH LOGIC (Real World Use-case) ---
//   const filteredHistory = useMemo(() => {
//     const query = searchQuery.toLowerCase();
//     return history.filter(item => {
//       if (query === "high" || query === "peak") return item.cpu_load > 70;
//       if (query === "low" || query === "critical") return item.battery_level < 25;
//       return item.timestamp?.toLowerCase().includes(query) || item.cpu_load?.toString().includes(query);
//     });
//   }, [searchQuery, history]);

//   // --- VOICE RECORDER (Gemini Style) ---
//   const startSpeech = () => {
//     const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//     if (!SpeechRecognition) return alert("Browser not supported");
    
//     const recognition = new SpeechRecognition();
//     recognition.continuous = false;
//     recognition.interimResults = false;

//     recognition.onstart = () => setIsListening(true);
//     recognition.onend = () => setIsListening(false);
//     recognition.onresult = (e) => {
//       const text = e.results[0][0].transcript;
//       setChatInput(text);
//       // Auto-send if it's a clear command
//       if(text.length > 5) handleSendMessage(null, text);
//     };
//     recognition.start();
//   };

//   // --- GEMINI-STYLE SMART CHAT ---
//   const handleSendMessage = async (e, directText = null) => {
//     if (e) e.preventDefault();
//     const text = directText || chatInput;
//     if (!text.trim()) return;

//     setChatMessages(prev => [...prev, { role: 'user', text }]);
//     setChatInput("");
//     setIsTyping(true);

//     try {
//       // Try real API first
//       const res = await axios.post(`${API_BASE}/ai/ask`, { query: text, deviceId, stats });
//       setChatMessages(prev => [...prev, { role: 'ai', text: res.data.answer }]);
//     } catch (err) {
//       // SMART FALLBACK (So it's never repetitive)
//       setTimeout(() => {
//         let response = "I'm analyzing that. Based on your current " + stats.avgCpu + "% CPU load, ";
//         if(text.toLowerCase().includes("battery")) response += "your battery is at " + stats.lastBattery + "%. I suggest lowering brightness.";
//         else if(text.toLowerCase().includes("slow")) response += "I detect background processes. Check the Action Plan for specific kill-commands.";
//         else response = "I've logged your query. My diagnosis shows " + (stats.totalAlerts > 0 ? "critical issues" : "a healthy system") + ". Check the checklist on the left.";
        
//         setChatMessages(prev => [...prev, { role: 'ai', text: response }]);
//       }, 1000);
//     } finally {
//       setIsTyping(false);
//     }
//   };

//   // --- DATA SYNC ---
//   useEffect(() => {
//     axios.get(`${API_BASE}/logs/list-devices?owner=${deviceId}`)
//       .then(res => {
//         const devices = res.data.devices || [];
//         setUserDevices(devices);
//         if (!deviceId && devices.length > 0) handleDeviceChange(devices[0]);
//       });
//   }, []);

//   useEffect(() => {
//     if (!deviceId) return;
//     const fetchAll = async () => {
//       const [h, s, a] = await Promise.all([
//         axios.get(`${API_BASE}/logs/history/${deviceId}`),
//         axios.get(`${API_BASE}/logs/stats/${deviceId}`),
//         axios.get(`${API_BASE}/ai/diagnosis/${deviceId}`)
//       ]);
//       setHistory(h.data); setStats(s.data); setAiReport(a.data);
//     };
//     fetchAll();
//   }, [deviceId]);

//   const handleDeviceChange = (id) => {
//     setDeviceId(id);
//     localStorage.setItem('selected_device', id);
//   };

//   const theme = {
//     bg: isDark ? 'bg-[#080808] text-white' : 'bg-slate-50 text-slate-900',
//     card: isDark ? 'bg-[#121212] border-white/5' : 'bg-white border-slate-200 shadow-sm',
//     bubble: isDark ? 'bg-[#1c1c1c]' : 'bg-slate-100',
//     input: isDark ? 'bg-[#181818] border-white/10' : 'bg-white border-slate-200 shadow-inner'
//   };

//   return (
//     <div className={`min-h-screen transition-all duration-700 pb-10 ${theme.bg}`}>
//       <div className="max-w-6xl mx-auto p-6 space-y-8">
        
//         {/* Header */}
//         <header className="flex justify-between items-center">
//           <div className="flex items-center gap-3">
//             <div className="w-10 h-10 bg-gradient-to-tr from-purple-600 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
//               <Zap size={22} className="text-white" />
//             </div>
//             <h1 className="text-xl font-black tracking-tighter uppercase italic">VoltGuard<span className="text-purple-500 font-light">AI</span></h1>
//           </div>
//           <div className="flex gap-4">
//             <button onClick={() => setIsDark(!isDark)} className={`p-3 rounded-2xl border transition-all hover:scale-110 ${theme.card}`}>
//               {isDark ? <Sun className="text-yellow-400" /> : <Moon className="text-indigo-600" />}
//             </button>
//             <div className={`flex items-center gap-2 px-4 rounded-2xl border ${theme.card}`}>
//               <Smartphone size={16} className="text-purple-500"/>
//               <select value={deviceId} onChange={(e)=>handleDeviceChange(e.target.value)} className="bg-transparent text-sm font-bold outline-none cursor-pointer">
//                 {userDevices.map(d => <option key={d} value={d} className="text-black">{d}</option>)}
//               </select>
//             </div>
//           </div>
//         </header>

//         {/* Real-World Search Section */}
//         <section className="space-y-4">
//           <div className="relative group max-w-2xl">
//             <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-purple-500 transition-colors" size={20} />
//             <input 
//               value={searchQuery} onChange={(e)=>setSearchQuery(e.target.value)}
//               placeholder="Search history... (Try 'Peak', 'Critical', or '14:30')" 
//               className={`w-full h-16 rounded-[2rem] pl-14 pr-6 text-sm focus:outline-none focus:ring-4 focus:ring-purple-500/10 border transition-all ${theme.input}`}
//             />
//             {searchQuery && (
//               <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[10px] font-bold text-purple-500 uppercase">
//                 {filteredHistory.length} Matches
//               </span>
//             )}
//           </div>
//         </section>

//         {/* Stats Summary */}
//         <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//           {[
//             { label: 'System Load', val: stats.avgCpu+'%', icon: Cpu, color: 'text-blue-500', bg: 'bg-blue-500/10' },
//             { label: 'Energy Capacity', val: stats.lastBattery+'%', icon: Zap, color: 'text-orange-500', bg: 'bg-orange-500/10' },
//             { label: 'Total Threats', val: stats.totalAlerts, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10' }
//           ].map((s, i) => (
//             <div key={i} className={`p-6 rounded-[2.5rem] border flex items-center gap-5 transition-transform hover:-translate-y-1 ${theme.card}`}>
//               <div className={`w-14 h-14 rounded-3xl ${s.bg} flex items-center justify-center ${s.color}`}>
//                 <s.icon size={24} />
//               </div>
//               <div>
//                 <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">{s.label}</p>
//                 <h2 className="text-3xl font-black">{s.val}</h2>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Main Interface Split */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
//           {/* Left: Performance & Action Plan */}
//           <div className="lg:col-span-7 space-y-8">
//             <div className={`p-8 rounded-[3rem] border ${theme.card}`}>
//               <h3 className="text-sm font-black mb-8 uppercase tracking-widest text-zinc-500 flex justify-between">
//                 Performance Telemetry <span>Live</span>
//               </h3>
//               <div className="h-64">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <AreaChart data={filteredHistory}>
//                     <defs>
//                       <linearGradient id="clr" x1="0" y1="0" x2="0" y2="1">
//                         <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
//                         <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
//                       </linearGradient>
//                     </defs>
//                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={isDark?"#ffffff05":"#00000005"} />
//                     <XAxis dataKey="timestamp" hide />
//                     <YAxis hide domain={[0, 100]} />
//                     <Tooltip contentStyle={{background: isDark?'#111':'#fff', border:'none', borderRadius:'15px'}} />
//                     <Area type="monotone" dataKey="cpu_load" stroke="#8b5cf6" fill="url(#clr)" strokeWidth={4} />
//                   </AreaChart>
//                 </ResponsiveContainer>
//               </div>
//             </div>

//             <div className={`p-8 rounded-[3rem] border ${isDark ? 'bg-purple-950/10 border-purple-500/20' : 'bg-purple-50 border-purple-200'}`}>
//               <h4 className="text-lg font-black mb-6 flex items-center gap-3">
//                 <CheckCircle className="text-purple-500" /> AI Optimization Plan
//               </h4>
//               <div className="grid gap-4">
//                 {aiReport?.actionPlan?.map((item, idx) => (
//                   <div key={idx} className={`p-5 rounded-2xl flex gap-4 items-start ${isDark ? 'bg-black/40' : 'bg-white shadow-sm'}`}>
//                     <div className="w-2 h-2 rounded-full bg-purple-500 mt-2 shrink-0" />
//                     <div>
//                       <p className="font-bold text-sm leading-tight">{item.step || "Recommended Optimization"}</p>
//                       <p className="text-xs opacity-60 mt-1 leading-relaxed">{item.description || item}</p>
//                     </div>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>

//           {/* Right: Gemini Style Chat */}
//           <div className={`lg:col-span-5 border rounded-[3rem] flex flex-col h-[750px] overflow-hidden ${theme.card}`}>
//             <div className="p-6 border-b border-white/5 flex items-center justify-between bg-black/5">
//               <span className="text-xs font-black tracking-widest uppercase">VoltGuard Core AI</span>
//               <div className="flex gap-1">
//                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
//                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/40" />
//               </div>
//             </div>

//             <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
//               {chatMessages.map((m, i) => (
//                 <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
//                   <div className={`max-w-[85%] p-5 rounded-[2rem] text-[14px] leading-relaxed shadow-sm transition-all hover:scale-[1.01] ${
//                     m.role === 'user' 
//                     ? 'bg-purple-600 text-white rounded-tr-none' 
//                     : `${theme.bubble} rounded-tl-none border border-white/5`
//                   }`}>
//                     {m.text}
//                   </div>
//                 </div>
//               ))}
//               {isTyping && <div className="text-[10px] font-bold text-purple-500 animate-bounce">AI is calculating...</div>}
//               <div ref={chatEndRef} />
//             </div>

//             <div className="p-6">
//               <form onSubmit={handleSendMessage} className="relative group">
//                 <input 
//                   value={chatInput} onChange={(e)=>setChatInput(e.target.value)}
//                   placeholder={isListening ? "Listening..." : "Ask Core AI..."}
//                   className={`w-full h-16 rounded-[2rem] pl-6 pr-28 text-sm focus:outline-none border transition-all ${theme.input} ${isListening ? 'ring-2 ring-red-500' : ''}`}
//                 />
//                 <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
//                   <button 
//                     type="button" onClick={startSpeech}
//                     className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'text-zinc-500 hover:bg-zinc-800'}`}
//                   >
//                     <Mic size={20} />
//                   </button>
//                   <button type="submit" className="p-3 bg-purple-600 text-white rounded-full hover:bg-purple-700 hover:scale-105 transition-all">
//                     <Send size={20} />
//                   </button>
//                 </div>
//               </form>
//             </div>
//           </div>

//         </div>

//         {/* Footer Remark */}
//         <div className={`p-6 rounded-[2rem] border flex items-center justify-between ${theme.card}`}>
//           <div className="flex items-center gap-4">
//              <div className={`w-3 h-3 rounded-full ${stats.totalAlerts > 0 ? 'bg-red-500 animate-ping' : 'bg-emerald-500'}`} />
//              <p className="text-sm font-bold">System Status: <span className={stats.totalAlerts > 0 ? 'text-red-500' : 'text-emerald-500'}>
//                {stats.latestAlertReason || "Optimal Condition"}
//              </span></p>
//           </div>
//           <button className="text-zinc-500 hover:text-white transition-colors"><MoreVertical size={20}/></button>
//         </div>
//       </div>
//     </div>
//   );
// }

//6.Suneetha
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Zap, CheckCircle, Smartphone, Sun, Moon, 
  AlertTriangle, Cpu, Activity, LayoutGrid, Terminal
} from 'lucide-react';

const API_BASE = "http://localhost:8080/api";
const TARGET_DEVICE = "DESKTOP-T8JAV6I"; // Hardcoded for single-device focus

export default function App() {
  // --- CORE TELEMETRY STATES ---
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({ avgCpu: 0, lastBattery: 0, totalAlerts: 0 });
  const [aiReport, setAiReport] = useState(null);
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') !== 'light');

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
  }, [isDark]);

  // --- DATA FETCHING (Single Device Logic) ---
  useEffect(() => {
    const loadTelemetry = async () => {
      try {
        const [hRes, sRes, aRes] = await Promise.all([
          axios.get(`${API_BASE}/logs/history/${TARGET_DEVICE}`),
          axios.get(`${API_BASE}/logs/stats/${TARGET_DEVICE}`),
          axios.get(`${API_BASE}/ai/diagnosis/${TARGET_DEVICE}`)
        ]);
        setHistory(hRes.data);
        setStats(sRes.data);
        setAiReport(aRes.data);
      } catch(e) {
        console.error("Telemetry sync failed", e);
      }
    };

    loadTelemetry();
    const interval = setInterval(loadTelemetry, 10000); // Auto-refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const theme = {
    bg: isDark ? 'bg-[#050505] text-white' : 'bg-slate-50 text-slate-900',
    card: isDark ? 'bg-[#111111] border-white/5 shadow-2xl' : 'bg-white border-slate-200 shadow-sm',
    accent: isDark ? 'text-purple-400' : 'text-purple-600',
    muted: isDark ? 'text-zinc-500' : 'text-slate-400',
  };

  return (
    <div className={`min-h-screen transition-all duration-700 font-sans pb-12 ${theme.bg}`}>
      
      {/* Background Decorative Glow (Dark Mode Only) */}
      {isDark && <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-64 bg-purple-600/10 blur-[120px] -z-10 rounded-full" />}

      <div className="max-w-6xl mx-auto p-6 space-y-8">
        
        {/* Header Section */}
        <header className="flex justify-between items-center py-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/20">
              <Activity className="text-white" size={26} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter uppercase italic flex items-center gap-2">
                VoltGuard <span className="text-purple-500 not-italic font-light">PRO</span>
              </h1>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest opacity-50">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> Live Telemetry System
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button onClick={() => setIsDark(!isDark)} className={`p-3 rounded-2xl border transition-all hover:scale-105 active:scale-95 ${theme.card}`}>
              {isDark ? <Sun className="text-yellow-400" size={20} /> : <Moon className="text-indigo-600" size={20} />}
            </button>
            <div className={`flex items-center gap-3 px-6 py-3 rounded-2xl border ${theme.card}`}>
              <Smartphone size={18} className="text-purple-500"/>
              <span className="text-sm font-black tracking-tight uppercase">{TARGET_DEVICE}</span>
            </div>
          </div>
        </header>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Performance Visualization (Spans 8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            <div className={`p-8 rounded-[3rem] border h-[450px] flex flex-col ${theme.card}`}>
               <div className="flex justify-between items-center mb-10">
                  <div>
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-500">Resource Utilization</h3>
                    <p className="text-lg font-bold mt-1">Telemetry History (Real-time)</p>
                  </div>
                  <div className="flex gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-zinc-500 uppercase">Current Peak</p>
                        <p className="text-sm font-black text-purple-500">
                            {history.length > 0 ? Math.max(...history.map(h => h.cpu_load)) : 0}%
                        </p>
                    </div>
                  </div>
               </div>
               
               <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                      <defs>
                        <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid vertical={false} stroke={isDark ? "#ffffff05" : "#00000005"} strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" hide />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip 
                        contentStyle={{ background: isDark ? '#111' : '#fff', border: 'none', borderRadius: '15px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                        itemStyle={{ color: '#8b5cf6', fontWeight: 'bold' }}
                      />
                      <Area type="monotone" dataKey="cpu_load" stroke="#8b5cf6" fill="url(#cpuGrad)" strokeWidth={4} animationDuration={1500} />
                    </AreaChart>
                </ResponsiveContainer>
               </div>
            </div>

            {/* Quick Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
               <div className={`p-8 rounded-[2.5rem] border flex items-center gap-6 ${theme.card}`}>
                  <div className="w-16 h-16 rounded-3xl bg-purple-500/10 flex items-center justify-center text-purple-500">
                    <Cpu size={32} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-zinc-500 mb-1 tracking-widest">Processor Load</p>
                    <h2 className="text-4xl font-black">{stats.avgCpu}%</h2>
                  </div>
               </div>
               <div className={`p-8 rounded-[2.5rem] border flex items-center gap-6 ${theme.card}`}>
                  <div className="w-16 h-16 rounded-3xl bg-orange-500/10 flex items-center justify-center text-orange-500">
                    <Zap size={32} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-zinc-500 mb-1 tracking-widest">Energy Capacity</p>
                    <h2 className="text-4xl font-black">{stats.lastBattery}%</h2>
                  </div>
               </div>
            </div>
          </div>

          {/* Right Column: AI Insights & Status (Spans 4 cols) */}
          <div className="lg:col-span-4 space-y-8">
            <div className={`p-8 rounded-[3.5rem] border h-full flex flex-col ${isDark ? 'bg-purple-950/5 border-purple-500/10' : 'bg-purple-50 border-purple-100 shadow-xl'}`}>
               <div className="flex items-center gap-3 mb-8">
                  <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                    <Terminal size={20} />
                  </div>
                  <h4 className="font-black text-lg tracking-tight">Actionable Insights</h4>
               </div>

               <p className="text-sm italic opacity-60 mb-8 leading-relaxed">
                 "{aiReport?.summary || "Analyzing hardware telemetry for anomalies..."}"
               </p>

               <div className="flex-1 space-y-5 overflow-y-auto custom-scrollbar pr-2">
                  {aiReport?.actionPlan?.length > 0 ? (
                    aiReport.actionPlan.map((item, idx) => (
                      <div key={idx} className={`p-5 rounded-3xl flex gap-5 items-start transition-all hover:scale-[1.02] ${isDark ? 'bg-white/5 border border-white/5' : 'bg-white shadow-sm'}`}>
                        <CheckCircle size={20} className="text-purple-500 mt-1 shrink-0" />
                        <div>
                          <p className="font-bold text-sm leading-tight mb-1">{item.step || "Optimization"}</p>
                          <p className="text-[11px] opacity-60 leading-normal">{item.description || item}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-20 opacity-20">
                        <LayoutGrid size={48} />
                        <p className="text-xs font-bold mt-4">Standby for Analysis</p>
                    </div>
                  )}
               </div>

               <div className="mt-8 pt-6 border-t border-purple-500/10 flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-purple-500/50">Core AI v2.4</span>
                  <div className="flex gap-1">
                    <div className="w-1 h-1 rounded-full bg-purple-500" />
                    <div className="w-1 h-1 rounded-full bg-purple-500" />
                    <div className="w-1 h-1 rounded-full bg-purple-500/20" />
                  </div>
               </div>
            </div>
          </div>

        </div>

        {/* Unified Guard Status Footer */}
        <div className={`p-8 rounded-[3rem] border flex items-center justify-between relative overflow-hidden ${theme.card}`}>
          <div className="flex items-center gap-6 relative z-10">
            <div className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded-full ${stats.totalAlerts > 0 ? 'bg-red-500 shadow-[0_0_15px_rgba(239,68,68,0.5)] animate-pulse' : 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]'}`} />
                <span className="text-xs font-black uppercase tracking-[0.25em]">Guard System Status</span>
            </div>
            <div className="h-6 w-[1px] bg-white/10" />
            <p className="text-sm font-bold tracking-tight">
                Current Condition: <span className={stats.totalAlerts > 0 ? 'text-red-500' : 'text-emerald-500'}>
                    {stats.latestAlertReason || "All Systems Optimal"}
                </span>
            </p>
          </div>
          
          <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-widest opacity-30 relative z-10">
            <span>Threat Count: {stats.totalAlerts}</span>
            <AlertTriangle size={14} className={stats.totalAlerts > 0 ? 'text-red-500' : ''} />
          </div>

          {/* Background Decorative Element */}
          <div className={`absolute right-0 top-0 h-full w-48 opacity-10 ${isDark ? 'bg-gradient-to-l from-purple-500 to-transparent' : 'bg-gradient-to-l from-slate-200 to-transparent'}`} />
        </div>

      </div>
    </div>
  );
}