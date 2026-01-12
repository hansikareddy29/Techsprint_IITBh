import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area 
} from 'recharts';
import { 
  Battery, Activity, ShieldAlert, Cpu, Zap, HardDrive, LayoutDashboard, Info 
} from 'lucide-react';

// --- MOCK DATA (Shows the UI even if Backend is offline) ---
const mockHistory = [
  { time: '10:00', health: 90, temp: 32 },
  { time: '11:00', health: 89.8, temp: 35 },
  { time: '12:00', health: 89.8, temp: 42 },
  { time: '13:00', health: 88.5, temp: 38 },
  { time: '14:00', health: 88.5, temp: 34 },
];

const App = () => {
  const [stats, setStats] = useState({
    battery_percent: "--",
    health: "--",
    cycles: "--",
    cpu_load: "--",
    temp: "--",
    top_apps: [],
    thermal_state: "Normal"
  });
  const [diagnosis, setDiagnosis] = useState("Waiting for hardware telemetry...");
  const deviceId = "Harshitha_Mac_Station"; // Matches Member 1's script

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        // Replace with your Member 2's backend URL later
        const res = await axios.get(`http://localhost:5001/api/stats/${deviceId}`);
        if (res.data) setStats(res.data);
        
        const diagRes = await axios.get(`http://localhost:5001/api/diagnosis/${deviceId}`);
        if (diagRes.data) setDiagnosis(diagRes.data.diagnosis);
      } catch (err) {
        console.log("Backend offline. Showing live layout with mock data.");
      }
    };

    fetchTelemetry();
    const interval = setInterval(fetchTelemetry, 30000); // Auto-refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0f172a] text-slate-200 font-sans p-4 md:p-8">
      {/* Header */}
      <nav className="max-w-7xl mx-auto flex justify-between items-center mb-10">
        <div className="flex items-center gap-3">
          <div className="bg-emerald-500 p-2 rounded-lg">
            <Battery className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">VoltGuard<span className="text-emerald-500">AI</span></h1>
        </div>
        <div className="flex items-center gap-4">
          <span className="hidden md:inline text-sm text-slate-400">System Status: <span className="text-emerald-400 font-medium">Monitoring Active</span></span>
          <button className="bg-slate-800 hover:bg-slate-700 px-4 py-2 rounded-lg text-sm transition-all border border-slate-700">
            Manual Upload
          </button>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto space-y-6">
        {/* Top Grid: Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          {/* Health Card */}
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl backdrop-blur-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500"><Activity size={20}/></div>
              <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded">HEALTHY</span>
            </div>
            <h3 className="text-slate-400 text-sm font-medium">Battery Health</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-bold text-white">{stats.health || "86"}</span>
              <span className="text-xl text-slate-500">%</span>
            </div>
            <p className="text-xs text-slate-500 mt-2">Cycles: {stats.cycles || "232"}</p>
          </div>

          {/* CPU Load Card */}
          <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl">
            <div className="flex justify-between items-start mb-4">
              <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500"><Cpu size={20}/></div>
            </div>
            <h3 className="text-slate-400 text-sm font-medium">CPU Performance</h3>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-4xl font-bold text-white">{stats.cpu_load || "12"}</span>
              <span className="text-xl text-slate-500">%</span>
            </div>
            <div className="flex gap-1 mt-3">
              {stats.top_apps.length > 0 ? stats.top_apps.map(app => (
                <span key={app} className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">{app}</span>
              )) : <span className="text-[10px] text-slate-500 italic">No heavy apps detected</span>}
            </div>
          </div>

          {/* AI DIAGNOSIS BOX (THE WINNING COMPONENT) */}
          <div className="md:col-span-2 bg-gradient-to-br from-emerald-600/20 to-emerald-900/20 border border-emerald-500/30 p-6 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10"><ShieldAlert size={80}/></div>
            <div className="flex items-center gap-2 mb-3 text-emerald-400 font-bold uppercase tracking-wider text-xs">
              <ShieldAlert size={16}/> AI Insight Engine
            </div>
            <h2 className="text-xl font-semibold text-white mb-2 italic">"The Reason"</h2>
            <p className="text-emerald-100/80 leading-relaxed text-sm">
              {diagnosis || "Your battery health at 86% is primarily affected by high cycle accumulation and thermal stress from Electron-based apps like VS Code and Chrome. We recommend charging between 20-80% to slow down future degradation."}
            </p>
          </div>
        </div>

        {/* Bottom Grid: Graphs & Secondary Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Chart */}
          <div className="md:col-span-2 bg-slate-800/50 border border-slate-700 p-8 rounded-3xl">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <LayoutDashboard size={18} className="text-emerald-500"/> Degradation Timeline
            </h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockHistory}>
                  <defs>
                    <linearGradient id="colorHealth" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                  <XAxis dataKey="time" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[80, 100]} stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '12px' }}
                    itemStyle={{ color: '#10b981' }}
                  />
                  <Area type="monotone" dataKey="health" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorHealth)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Deep Logs / Environmental Info */}
          <div className="space-y-6">
            <div className="bg-slate-800/50 border border-slate-700 p-6 rounded-3xl">
              <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4">Environment</h4>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Zap size={14}/> Thermal State</span>
                  <span className="text-sm font-medium text-emerald-400">Nominal</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><HardDrive size={14}/> Disk Load</span>
                  <span className="text-sm font-medium">Moderate</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-400 flex items-center gap-2"><Info size={14}/> Last Audit</span>
                  <span className="text-sm font-medium italic">10 mins ago</span>
                </div>
              </div>
            </div>
            
            <div className="bg-blue-600 p-6 rounded-3xl text-white shadow-lg shadow-blue-500/20">
              <h4 className="font-bold mb-1">Battery Tip</h4>
              <p className="text-sm text-blue-100 opacity-90">Heat is the #1 enemy. Avoid using heavy apps while charging in warm environments.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;