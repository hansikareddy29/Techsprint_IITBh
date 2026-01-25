import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, RefreshCw, Zap, CheckCircle, Smartphone, ShieldAlert, Cpu, ShieldCheck, Waves, Fingerprint } from 'lucide-react';

const API_BASE = "http://localhost:8080/api";

export default function App() {
  const [deviceId, setDeviceId] = useState(localStorage.getItem('selected_device') || "");
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [aiReport, setAiReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. AUTO-DETECT DEVICE (Privacy-Safe IP Detection)
  useEffect(() => {
    const initApp = async () => {
      try {
        // Find which machine is currently active on this IP
        const detectRes = await axios.get(`${API_BASE}/logs/get-my-device`);
        let currentId = detectRes.data.deviceId;

        // If IP detection fails, fallback to memory, then to first found
        if (!currentId) {
          const listRes = await axios.get(`${API_BASE}/logs/list-devices`);
          currentId = localStorage.getItem('selected_device') || listRes.data.devices?.[0];
        }

        if (currentId) {
          setDeviceId(currentId);
          localStorage.setItem('selected_device', currentId);
        } else {
          setLoading(false);
        }
      } catch (e) {
        console.error("System detection failed", e);
        setLoading(false);
      }
    };
    initApp();
  }, []);

  // 2. Fetch Stats and History
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

  // 3. AI Diagnosis
  useEffect(() => {
    if (!deviceId) return;
    setAiReport(null);
    axios.get(`${API_BASE}/ai/diagnosis/${deviceId}`)
      .then(res => setAiReport(res.data))
      .catch(() => setAiReport({ summary: "Neural analysis paused." }));
  }, [deviceId]);

  if (!deviceId && loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="text-center p-12 bg-white rounded-[3rem] shadow-2xl border border-slate-100">
          <div className="bg-gradient-to-tr from-indigo-500 to-violet-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
            <RefreshCw className="animate-spin text-white" size={40}/>
          </div>
          <h2 className="text-2xl font-black text-slate-800 tracking-tight">Detecting System</h2>
          <p className="text-slate-400 mt-2 max-w-xs mx-auto">Establishing secure handshake with hardware agent...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/30 p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto space-y-10">
        
        {/* Updated Navbar (Dropdown Removed) */}
        <header className="flex flex-col md:flex-row justify-between items-center bg-white/60 backdrop-blur-xl p-6 rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-white/80">
          <div className="flex items-center gap-5">
            <div className="bg-gradient-to-br from-indigo-600 to-violet-700 p-3.5 rounded-2xl shadow-indigo-300 shadow-xl transform rotate-3">
              <Activity className="text-white" size={30}/>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent italic">
                VOLTGUARD.AI
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">System Link Active</p>
              </div>
            </div>
          </div>
          
          {/* Read-Only Device Badge */}
          <div className="mt-6 md:mt-0 flex items-center gap-4 bg-white/80 p-3 px-6 rounded-2xl border border-slate-200/50 shadow-sm transition-all hover:border-indigo-200">
            <Fingerprint size={20} className="text-indigo-500 animate-pulse"/>
            <div className="flex flex-col min-w-[120px]">
              <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Secure Hardware ID</span>
              <span className="font-black text-sm text-slate-800 tracking-tight">
                {deviceId || "Searching..."}
              </span>
            </div>
          </div>
        </header>

        {/* Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group bg-white p-8 rounded-[3rem] shadow-lg shadow-slate-200/40 hover:-translate-y-2 transition-all duration-500 border border-white relative overflow-hidden">
            <div className="absolute -bottom-4 -right-4 p-10 opacity-5 group-hover:scale-110 transition-transform">
              <Cpu size={120} />
            </div>
            <div className="bg-indigo-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
              <Cpu className="text-indigo-600" size={24} />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">CPU Performance</p>
            <h2 className="text-6xl font-black text-slate-800 mt-2 leading-none">{stats.avgCpu || 0}<span className="text-2xl text-slate-200 font-medium ml-1">%</span></h2>
          </div>

          <div className="group bg-white p-8 rounded-[3rem] shadow-lg shadow-slate-200/40 hover:-translate-y-2 transition-all duration-500 border border-white relative overflow-hidden">
             <div className="absolute -bottom-4 -right-4 p-10 opacity-5 group-hover:scale-110 transition-transform">
              <ShieldCheck size={120} />
            </div>
            <div className="bg-emerald-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck className="text-emerald-600" size={24} />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Battery Health</p>
            <h2 className="text-6xl font-black text-slate-800 mt-2 leading-none">{stats.batteryHealth || 0}<span className="text-2xl text-slate-200 font-medium ml-1">%</span></h2>
          </div>

          <div className="group bg-white p-8 rounded-[3rem] shadow-lg shadow-slate-200/40 hover:-translate-y-2 transition-all duration-500 border border-red-50 relative overflow-hidden">
             <div className="absolute -bottom-4 -right-4 p-10 opacity-5 group-hover:scale-110 transition-transform">
              <ShieldAlert size={120} />
            </div>
            <div className="bg-red-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
              <ShieldAlert className="text-red-600" size={24} />
            </div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Incident Log</p>
            <h2 className="text-6xl font-black text-red-600 mt-2 leading-none">{stats.totalAlerts || 0}</h2>
            <p className="text-xs font-black text-slate-500 truncate mt-4 border-t border-slate-50 pt-3">
                {stats.latestAlertReason || "Monitoring History..."}
            </p>
          </div>
        </div>

        {/* Chart and AI */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          
          <div className="lg:col-span-8 bg-white p-10 rounded-[3.5rem] shadow-xl shadow-slate-200/60 border border-white">
            <div className="flex justify-between items-center mb-10">
              <h3 className="font-black text-xl flex items-center gap-4">
                <div className="p-3 bg-amber-50 rounded-2xl text-amber-500 shadow-sm">
                    <Zap size={24} className="fill-amber-500"/>
                </div>
                Performance Stream
              </h3>
              <div className="bg-slate-50 px-5 py-2 rounded-full text-xs font-black text-indigo-500 tracking-widest uppercase border border-slate-100">
                Live Pulse
              </div>
            </div>
            
            <div className="h-[380px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="glowCpu" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6}/>
                      <stop offset="95%" stopColor="#818cf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="6 6" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis domain={[0, 100]} hide />
                  <Tooltip contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)' }} />
                  <Area type="monotone" dataKey="cpu_load" stroke="url(#glowCpu)" strokeWidth={5} fill="url(#glowCpu)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="lg:col-span-4 bg-gradient-to-br from-indigo-600 via-indigo-700 to-violet-800 text-white p-10 rounded-[3.5rem] shadow-2xl shadow-indigo-400 flex flex-col relative overflow-hidden">
            <div className="absolute -top-10 -right-10 opacity-10">
                <Waves size={300} strokeWidth={1} />
            </div>

            <div className="flex justify-between items-start mb-10 relative z-10">
              <div>
                <h4 className="text-[11px] font-black uppercase tracking-[0.25em] text-white/50">Overall Health</h4>
                <p className="text-7xl font-black mt-2 drop-shadow-lg">{aiReport?.overallScore || "--"}</p>
              </div>
              <div className="bg-white/20 p-4 rounded-[2rem] backdrop-blur-md border border-white/20">
                <ShieldCheck size={30}/>
              </div>
            </div>
            
            {aiReport ? (
              <div className="space-y-10 flex-grow relative z-10">
                <div className="bg-white/10 p-7 rounded-[2rem] border border-white/10 backdrop-blur-md shadow-inner">
                  <p className="text-sm italic leading-relaxed font-bold tracking-tight">"{aiReport.summary}"</p>
                </div>
                
                <div className="space-y-6">
                  <h5 className="text-[11px] font-black uppercase tracking-[0.25em] text-white/50">Prescribed Plan</h5>
                  <ul className="space-y-8">
                    {aiReport.actionPlan?.map((s, index) => (
                      <li key={index} className="flex gap-5 items-start">
                        <div className="shrink-0 bg-white text-indigo-700 h-9 w-9 rounded-2xl flex items-center justify-center font-black text-sm shadow-xl">
                          {index + 1}
                        </div>
                        <div className="flex flex-col">
                          <p className="font-black text-sm tracking-tight leading-none uppercase">{typeof s === 'object' ? s.step : "Strategy"}</p>
                          <p className="text-[12px] text-white/70 mt-2 leading-relaxed font-bold">{typeof s === 'object' ? s.description : s}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-grow py-32 relative z-10">
                <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin mb-6"></div>
                <p className="text-sm font-black opacity-50 uppercase tracking-widest">Neural Link Syncing...</p>
              </div>
            )}

            <div className="mt-auto pt-8 border-t border-white/10 text-center relative z-10">
               <p className="text-[10px] font-black text-white/30 uppercase tracking-[0.2em] italic">Analyzed by Global Analyst Service</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}