import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Activity, RefreshCw, Zap, CheckCircle, Smartphone, 
  ShieldAlert, Cpu, ShieldCheck, Waves, Fingerprint, 
  Sun, Moon 
} from 'lucide-react';

const API_BASE = "https://voltguardai-f0g0.onrender.com/api";

export default function App() {
  // --- CORE LOGIC ---
  const [deviceId, setDeviceId] = useState(localStorage.getItem('selected_device') || "");
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [aiReport, setAiReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  useEffect(() => {
    const initApp = async () => {
      try {
        const detectRes = await axios.get(`${API_BASE}/logs/get-my-device`);
        let currentId = detectRes.data.deviceId;
        if (!currentId) {
          const listRes = await axios.get(`${API_BASE}/logs/list-devices`);
          currentId = localStorage.getItem('selected_device') || listRes.data.devices?.[0];
        }
        if (currentId) {
          setDeviceId(currentId);
          localStorage.setItem('selected_device', currentId);
        } else { setLoading(false); }
      } catch (e) { setLoading(false); }
    };
    initApp();
  }, []);

  useEffect(() => {
    if (!deviceId) return;
    const fetchStats = async () => {
      try {
        const [hRes, sRes] = await Promise.all([
          axios.get(`${API_BASE}/logs/history/${deviceId}`),
          axios.get(`${API_BASE}/logs/stats/${deviceId}`)
        ]);
        setHistory(hRes.data);
        setStats(sRes.data);
        setLoading(false);
      } catch (e) { console.error(e); }
    };
    fetchStats();
    const interval = setInterval(fetchStats, 300000); 
    return () => clearInterval(interval);
  }, [deviceId]);

  useEffect(() => {
    if (!deviceId) return;
    setAiReport(null);
    axios.get(`${API_BASE}/ai/diagnosis/${deviceId}`)
      .then(res => setAiReport(res.data))
      .catch(() => setAiReport({ summary: "Neural system paused." }));
  }, [deviceId]);

  if (!deviceId && loading) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-[#0a0a0c]' : 'bg-[#6366F1]'}`}>
        <div className="text-center animate-pulse">
          <Activity className="text-white mx-auto mb-4" size={64}/>
          <h2 className="text-xl font-black text-white tracking-widest uppercase italic">VoltGuard Link...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full flex flex-col items-center py-10 px-4 transition-colors duration-700 font-sans relative overflow-x-hidden
      ${isDark ? 'bg-[#0a0a0c] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Background Mesh Glows */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[140px] opacity-10 transition-colors duration-1000 ${isDark ? 'bg-indigo-600' : 'bg-indigo-200'}`}></div>
        <div className={`absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] opacity-10 transition-colors duration-1000 ${isDark ? 'bg-violet-600' : 'bg-violet-200'}`}></div>
      </div>

      <div className="w-full max-w-6xl space-y-8 relative z-10">
        
        {/* HEADER */}
        <header className={`flex justify-between items-center p-6 rounded-[2.5rem] border backdrop-blur-2xl shadow-2xl transition-all
          ${isDark ? 'bg-white/5 border-white/10 shadow-black/40' : 'bg-white border-slate-200 shadow-xl shadow-slate-100'}`}>
          
          <div className="flex items-center gap-6">
            <div className="bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] p-4 rounded-2xl shadow-lg transform rotate-3">
              <Activity className="text-white" size={24}/>
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent uppercase italic leading-none">VoltGuard.AI</h1>
              <div className="flex items-center gap-2 mt-1">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest leading-none">Neural Link Active</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
             <button onClick={toggleTheme} className={`flex items-center gap-3 px-5 py-2.5 rounded-full border transition-all hover:scale-105 active:scale-95
                ${isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-indigo-600 shadow-sm'}`}>
                {isDark ? <Sun size={16} className="text-yellow-400" /> : <Moon size={16} className="text-indigo-600" />}
                <span className="text-[10px] font-black uppercase tracking-widest hidden sm:inline">{isDark ? 'Bright' : 'Deep'}</span>
             </button>

             <a href="/downloads/VoltGuard_Agent.zip" download className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white rounded-full transition-all hover:scale-105 shadow-lg group">
               <Zap size={16} className="group-hover:animate-pulse fill-current" />
               <span className="text-[10px] font-black uppercase tracking-widest">Sync Device</span>
             </a>

            <div className={`hidden sm:flex items-center gap-4 p-2.5 px-6 rounded-2xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
              <Fingerprint size={16} className="text-[#6366F1]"/>
              <div className="flex flex-col text-right">
                <span className="text-[8px] font-black opacity-30 uppercase tracking-widest leading-none">Hardware ID</span>
                <span className="font-bold text-xs tracking-tight uppercase mt-1 truncate max-w-[120px]">{deviceId || "Unknown"}</span>
              </div>
            </div>
          </div>
        </header>

        {/* METRICS ROW */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { label: 'System Load', val: stats.avgCpu, unit: '%', icon: Cpu, color: 'text-[#6366F1]', bg: 'bg-[#6366F1]/10' },
            { label: 'Battery Health', val: stats.batteryHealth, unit: '%', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
            { label: 'Incident Log', val: stats.totalAlerts, unit: '', icon: ShieldAlert, color: 'text-red-500', bg: 'bg-red-500/10' }
          ].map((item, i) => (
            <div key={i} className={`p-8 rounded-[3rem] border transition-all flex flex-col justify-between h-48 group
              ${isDark ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'}`}>
              <div className="flex justify-between items-start">
                <span className="text-[10px] font-black opacity-40 uppercase tracking-widest leading-none">{item.label}</span>
                <item.icon size={22} className={`${item.color} group-hover:scale-110 transition-transform`}/>
              </div>
              <h2 className="text-5xl font-black mt-2 leading-none">{item.val || 0}<span className="text-2xl opacity-20 ml-1 font-medium">{item.unit}</span></h2>
              <div className="mt-4 h-1.5 w-full rounded-full bg-slate-500/10 overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-1000 ${item.color.replace('text','bg')}`} style={{width: `${Math.min(item.val || 0, 100)}%`}}></div>
              </div>
            </div>
          ))}
        </div>

        {/* --- PERFORMANCE STREAM + AI DIAGNOSTIC GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* CHART BOX */}
          <div className={`lg:col-span-8 p-10 rounded-[3.5rem] border flex flex-col transition-all min-h-[480px]
            ${isDark ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white border-slate-100 shadow-xl'}`}>
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-black text-lg flex items-center gap-4 uppercase italic tracking-wider opacity-80">
                <Zap size={22} className="text-amber-500 fill-amber-500"/> Performance Pulse
              </h3>
              <span className={`text-[10px] font-black px-5 py-2 rounded-full border ${isDark ? 'bg-white/5 border-white/10 text-white/40' : 'bg-slate-50 border-slate-200 text-indigo-500'}`}>
                LIVE FEED
              </span>
            </div>
            <div className="flex-grow w-full h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="voltGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={isDark ? 0.4 : 0.2}/>
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="8 8" vertical={false} stroke={isDark ? "#ffffff05" : "#00000005"} />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', backgroundColor: isDark ? '#1a1a1c' : '#fff', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.5)', padding: '16px' }} />
                  <Area type="monotone" dataKey="cpu_load" stroke="#6366F1" strokeWidth={5} fill="url(#voltGlow)" animationDuration={2000} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI DIAGNOSTIC - BRAND GRADIENT */}
          <div className="lg:col-span-4 bg-gradient-to-br from-[#6366F1] via-[#7C3AED] to-[#8B5CF6] text-white p-10 rounded-[3.5rem] shadow-2xl flex flex-col relative overflow-hidden group">
            <div className="absolute top-[-10%] right-[-10%] opacity-20 rotate-12 group-hover:rotate-45 transition-transform duration-[3000ms]">
               <Waves size={400} />
            </div>

            <div className="flex justify-between items-start mb-10 relative z-10">
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60 leading-none">Health Score</h4>
                <p className="text-7xl font-black mt-2 drop-shadow-2xl">{aiReport?.overallScore || "--"}</p>
              </div>
              <ShieldCheck size={28} className="text-white/40"/>
            </div>
            
            {aiReport ? (
              <div className="space-y-8 flex-grow relative z-10 overflow-y-auto no-scrollbar pr-2">
                <div className="bg-white/10 p-6 rounded-[2rem] border border-white/20 backdrop-blur-md shadow-inner ring-1 ring-white/10">
                  <p className="text-sm italic leading-relaxed font-bold tracking-tight text-white/95">"{aiReport.summary}"</p>
                </div>
                
                <ul className="space-y-8">
                  {aiReport.actionPlan?.map((s, index) => (
                    <li key={index} className="flex gap-6 items-start group/item">
                      <div className="shrink-0 bg-white text-indigo-700 h-9 w-9 rounded-2xl flex items-center justify-center font-black text-sm shadow-xl transition-all group-hover/item:rotate-12">
                        {index + 1}
                      </div>
                      <div className="flex flex-col">
                        <p className="font-black text-[12px] uppercase tracking-wider text-white drop-shadow-sm leading-none">
                          {typeof s === 'object' ? s.step : 'Strategy'}
                        </p>
                        <p className="text-[11px] text-white/70 mt-3 leading-relaxed font-bold">
                          {typeof s === 'object' ? s.description : s}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-grow py-20 relative z-10">
                <RefreshCw className="animate-spin opacity-40 mb-4" size={48}/>
                <p className="text-[10px] font-black opacity-40 uppercase tracking-[0.3em]">Processing Logs</p>
              </div>
            )}

            <div className="mt-8 pt-8 border-t border-white/10 relative z-10 text-center">
               <p className="text-[10px] font-black text-white/40 uppercase tracking-[0.25em] italic">Enhanced by Historical Analyst</p>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer className={`flex justify-between items-center p-6 px-12 rounded-[2.5rem] border text-[10px] font-black uppercase tracking-[0.2em] transition-all w-full
          ${isDark ? 'bg-black/40 border-white/5 text-white/20' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          <span>OS: DETECTED</span>
          <span>Security: AES-256</span>
          <span>Last Sync: {new Date().toLocaleTimeString()}</span>
        </footer>
      </div>
    </div>
  );
}
