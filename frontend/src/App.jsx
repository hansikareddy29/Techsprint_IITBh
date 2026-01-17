import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { 
  Battery, Activity, ShieldAlert, Cpu, Zap, HardDrive, LayoutDashboard, Info, RefreshCw 
} from 'lucide-react';

const App = () => {
  // 1. STATE MANAGEMENT: Holds data from Hansika's Firebase
  const [stats, setStats] = useState({
    health: "--",
    cycles: "--",
    cpu_load: "--",
    top_apps: [],
    condition: "Normal",
    battery_percent: "--"
  });
  
  const [diagnosis, setDiagnosis] = useState("Waiting for hardware telemetry...");
  const [history, setHistory] = useState([
    { time: '10:00', health: 90 },
    { time: '11:00', health: 89.8 },
    { time: '12:00', health: 89.5 },
    { time: '13:00', health: 88.2 },
    { time: '14:00', health: 86 }
  ]);

  const deviceId = "Harshitha_Mac_Station"; 
  const SERVER_URL = "http://localhost:5001"; // Port matches Member 2's server

  // 2. AXIOS CONNECTION: The bridge to Member 2 (Hansika)
  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        // CALL 1: Get latest stats (Level, Health, Cycles, Apps)
        const res = await axios.get(`${SERVER_URL}/api/logs/latest/${deviceId}`);
        if (res.data) {
          setStats({
            health: res.data.health,
            cycles: res.data.cycles,
            cpu_load: res.data.cpu_load,
            top_apps: res.data.top_apps || [],
            condition: res.data.condition || "Normal",
            battery_percent: res.data.battery_percent || res.data.level
          });
        }
        
        // CALL 2: Get AI Diagnosis from Google Gemini
        const diagRes = await axios.get(`${SERVER_URL}/api/ai/diagnose/${deviceId}`);
        if (diagRes.data) {
          setDiagnosis(diagRes.data.diagnosis);
        }
      } catch (err) {
        console.log("Backend offline. Dashboard is waiting for Hansika's server...");
      }
    };

    fetchTelemetry();
    // Auto-refresh every 30 seconds to catch Harshitha's updates
    const interval = setInterval(fetchTelemetry, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-4 md:p-8">
      {/* HEADER SECTION */}
      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-xl shadow-lg shadow-emerald-500/20">
            <Battery className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white italic">
            VoltGuard<span className="text-emerald-500">AI</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline text-xs font-bold text-slate-500 uppercase tracking-widest bg-slate-900 border border-slate-800 px-4 py-2 rounded-full">
            Status: <span className="text-emerald-400">Monitoring Active</span>
          </span>
          <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm transition-all border border-slate-700 flex items-center gap-2">
            <RefreshCw size={14}/> Sync
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto space-y-6">
        {/* TOP STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Battery Health Card */}
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-[2rem] backdrop-blur-sm hover:border-emerald-500/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Activity size={20}/></div>
              <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">DEGRADATION AUDIT</span>
            </div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">Battery Integrity</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-black text-white">{stats.health}</span>
              <span className="text-xl text-emerald-500 font-bold">%</span>
            </div>
            <p className="text-xs text-slate-500 mt-4 font-bold uppercase">Cycles: {stats.cycles}</p>
          </div>

          {/* CPU Performance Card */}
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-[2rem] hover:border-blue-500/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Cpu size={20}/></div>
            </div>
            <h3 className="text-slate-400 text-xs font-bold uppercase tracking-widest">System Stress</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-5xl font-black text-white">{stats.cpu_load}</span>
              <span className="text-xl text-blue-500 font-bold">%</span>
            </div>
            <div className="flex gap-1 mt-4 flex-wrap">
              {stats.top_apps.length > 0 ? stats.top_apps.map(app => (
                <span key={app} className="text-[9px] bg-slate-700 px-2 py-0.5 rounded text-slate-300 font-bold uppercase">{app}</span>
              )) : <span className="text-[10px] text-slate-500 italic">Idle</span>}
            </div>
          </div>

          {/* AI DIAGNOSIS BOX (GEMINI BRAIN) */}
          <div className="md:col-span-2 bg-gradient-to-br from-emerald-600/20 to-emerald-900/30 border border-emerald-500/30 p-8 rounded-[2rem] relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 p-4 opacity-10 scale-150 rotate-12"><ShieldAlert size={100}/></div>
            <div className="flex items-center gap-2 mb-4 text-emerald-400 font-black uppercase tracking-[0.2em] text-[10px]">
              <ShieldAlert size={16}/> AI Insight Engine
            </div>
            <h2 className="text-2xl font-bold text-white mb-4 italic">"The Reason"</h2>
            <p className="text-emerald-100/90 leading-relaxed text-md font-medium">
              {diagnosis}
            </p>
          </div>
        </div>

        {/* BOTTOM SECTION: GRAPHS & LOGS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="md:col-span-2 bg-slate-800/50 border border-slate-700 p-8 rounded-[2.5rem]">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-10 flex items-center gap-2">
              <LayoutDashboard size={18} className="text-emerald-500"/> Degradation History Timeline
            </h3>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis domain={[80, 100]} hide />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '16px' }}
                    itemStyle={{ color: '#10b981', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="health" stroke="#10b981" strokeWidth={5} fillOpacity={1} fill="url(#colorHealth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Environmental Sidebar */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 p-8 rounded-[2.5rem]">
              <h4 className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-6">Environmental Telemetry</h4>
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-slate-700/50 pb-4">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Zap size={14}/> Thermal State</span>
                  <span className="text-sm font-black text-emerald-400 uppercase">Nominal</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-700/50 pb-4">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><HardDrive size={14}/> Disk Load</span>
                  <span className="text-sm font-bold text-slate-200">Moderate</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Info size={14}/> Last Audit</span>
                  <span className="text-sm font-medium italic text-slate-500 text-xs">Recently Synced</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-blue-500/20 relative overflow-hidden group">
              <Zap className="absolute -right-4 -bottom-4 text-blue-400 opacity-20 group-hover:scale-110 transition-transform" size={100}/>
              <h4 className="font-bold mb-2 flex items-center gap-2 text-lg">Pro Tip</h4>
              <p className="text-sm text-blue-100 opacity-95 leading-relaxed">
                Heat is the #1 enemy of Li-ion batteries. Avoid running intensive compiling or rendering while charging in warm rooms.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="mt-12 text-center text-[10px] text-slate-600 font-bold uppercase tracking-[0.3em] pb-8">
        Powered by Google Gemini AI & Firebase
      </footer>
    </div>
  );
};

export default App;