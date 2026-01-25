// src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  Activity, RefreshCw, Zap, ShieldAlert,
  Cpu, ShieldCheck, Waves, Fingerprint,
  Sun, Moon
} from 'lucide-react';

const API_BASE = "https://voltguardai-f0g0.onrender.com/api";

function createAxiosWithToken(userToken) {
  const instance = axios.create({
    baseURL: API_BASE
  });
  instance.interceptors.request.use((config) => {
    if (userToken) {
      config.headers['x-voltguard-user-token'] = userToken;
    }
    return config;
  });
  return instance;
}

export default function App() {
  const [userToken, setUserToken] = useState(
    localStorage.getItem('voltguard_user_token') || ""
  );
  const [deviceId, setDeviceId] = useState("");
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [aiReport, setAiReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDark, setIsDark] = useState(localStorage.getItem('theme') === 'dark');

  const api = createAxiosWithToken(userToken);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  // 0. On first load, if no userToken, ask user to paste one
  useEffect(() => {
    if (!userToken) {
      const manual = prompt("Enter your VoltGuard user token (same as in your agent):");
      if (manual) {
        const trimmed = manual.trim();
        setUserToken(trimmed);
        localStorage.setItem('voltguard_user_token', trimmed);
      }
    }
  }, []); // only once

  // 1. Auto-detect device for this userToken
  useEffect(() => {
    if (!userToken) {
      setLoading(false);
      return;
    }

    const detectDevice = async () => {
      try {
        const res = await api.get('/logs/get-my-device');
        if (res.data.deviceId) {
          setDeviceId(res.data.deviceId);
          localStorage.setItem('selected_device', res.data.deviceId);
        } else {
          setDeviceId("");
        }
      } catch (e) {
        console.error("Detection Error", e);
      } finally {
        setLoading(false);
      }
    };

    detectDevice();
    // Periodically re-check if no device yet
    const interval = setInterval(() => {
      if (!deviceId) detectDevice();
    }, 10000);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userToken]);

  // 2. Fetch data when deviceId is known
  useEffect(() => {
    if (!deviceId || !userToken) return;

    const fetchData = async () => {
      try {
        const [hRes, sRes] = await Promise.all([
          api.get(`/logs/history/${deviceId}`),
          api.get(`/logs/stats/${deviceId}`)
        ]);
        setHistory(hRes.data || []);
        setStats(sRes.data || {});
      } catch (e) {
        console.error(e);
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [deviceId, userToken, api]);

  // 3. AI report
  useEffect(() => {
    if (!deviceId || !userToken) return;
    setAiReport(null);
    api.get(`/ai/diagnosis/${deviceId}`)
      .then(res => setAiReport(res.data))
      .catch(() => setAiReport({ summary: "AI analyzing hardware patterns..." }));
  }, [deviceId, userToken, api]);

  if (loading && !deviceId) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${isDark ? 'bg-[#0a0a0c]' : 'bg-[#6366F1]'}`}>
        <div className="text-center">
          <Activity className="text-white mx-auto mb-4 animate-spin" size={64} />
          <h2 className="text-xl font-black text-white tracking-widest uppercase italic">
            Establishing Neural Link...
          </h2>
          <p className="text-white/50 text-[10px] mt-2 font-bold uppercase tracking-widest">
            Ensure Python Agent is Running and token matches
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen w-full flex flex-col items-center py-10 px-4 transition-colors duration-700 font-sans relative overflow-x-hidden ${isDark ? 'bg-[#0a0a0c] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* Background Mesh */}
      <div className="absolute inset-0 pointer-events-none">
        <div className={`absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full blur-[140px] opacity-10 ${isDark ? 'bg-indigo-600' : 'bg-indigo-200'}`} />
        <div className={`absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[140px] opacity-10 ${isDark ? 'bg-violet-600' : 'bg-violet-200'}`} />
      </div>

      <div className="w-full max-w-6xl space-y-8 relative z-10">
        {/* HEADER */}
        <header className={`flex justify-between items-center p-6 rounded-[2.5rem] border backdrop-blur-2xl shadow-2xl ${isDark ? 'bg-white/5 border-white/10 shadow-black/40' : 'bg-white border-slate-200 shadow-xl shadow-slate-100'}`}>
          <div className="flex items-center gap-6">
            <div className="bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] p-4 rounded-2xl shadow-lg transform rotate-3">
              <Activity className="text-white" size={24} />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] bg-clip-text text-transparent uppercase italic leading-none">
                VoltGuard.AI
              </h1>
              <div className="flex items-center gap-2 mt-1">
                <span className={`h-2 w-2 rounded-full animate-pulse ${deviceId ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className="text-[10px] font-black opacity-60 uppercase tracking-widest leading-none">
                  {deviceId ? 'Secure Link Active' : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className={`p-3 rounded-full border transition-all hover:scale-105 active:scale-95 ${
                isDark ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-100 border-slate-200 text-indigo-600 shadow-sm'
              }`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className={`hidden md:flex items-center gap-4 p-2.5 px-6 rounded-2xl border ${isDark ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
              <Fingerprint size={16} className="text-[#6366F1]" />
              <div className="flex flex-col text-right">
                <span className="text-[8px] font-black opacity-30 uppercase tracking-widest leading-none">
                  User Token
                </span>
                <span className="font-bold text-xs tracking-tight uppercase mt-1 max-w-[150px] truncate">
                  {userToken || "Not set"}
                </span>
              </div>
            </div>
          </div>
        </header>

        {!deviceId ? (
          <div className={`p-20 rounded-[3.5rem] border text-center ${isDark ? 'bg-white/5 border-white/10' : 'bg-white border-slate-100'}`}>
            <Cpu size={48} className="mx-auto mb-6 opacity-20" />
            <h2 className="text-2xl font-black uppercase italic tracking-widest mb-2">
              No Device Linked
            </h2>
            <p className="text-sm opacity-50 font-bold max-w-md mx-auto">
              Make sure your <code className="bg-indigo-500/20 px-2 py-1 rounded">VOLTGUARD_USER_TOKEN</code> in the agent matches the token you entered in this browser, and the agent is running.
            </p>
          </div>
        ) : (
          <>
            {/* METRICS */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { label: 'System Load', val: stats.avgCpu, unit: '%', icon: Cpu, color: 'text-[#6366F1]' },
                { label: 'Battery Health', val: stats.batteryHealth, unit: '%', icon: ShieldCheck, color: 'text-emerald-500' },
                { label: 'Incident Log', val: stats.totalAlerts, unit: '', icon: ShieldAlert, color: 'text-red-500' }
              ].map((item, i) => (
                <div
                  key={i}
                  className={`p-8 rounded-[3rem] border transition-all h-48 flex flex-col justify-between ${
                    isDark ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white border-slate-100 shadow-xl'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-black opacity-40 uppercase tracking-widest leading-none">
                      {item.label}
                    </span>
                    <item.icon size={22} className={item.color} />
                  </div>
                  <h2 className="text-5xl font-black mt-2 leading-none">
                    {item.val || 0}
                    <span className="text-2xl opacity-20 ml-1 font-medium">{item.unit}</span>
                  </h2>
                  <div className="mt-4 h-1.5 w-full rounded-full bg-slate-500/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-1000 ${item.color.replace('text', 'bg')}`}
                      style={{ width: `${Math.min(item.val || 0, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* PERFORMANCE + AI */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              <div className={`lg:col-span-8 p-10 rounded-[3.5rem] border flex flex-col min-h-[480px] ${
                isDark ? 'bg-white/5 border-white/10 shadow-2xl' : 'bg-white border-slate-100 shadow-xl'
              }`}>
                <div className="flex justify-between items-center mb-10">
                  <h3 className="font-black text-lg flex items-center gap-4 uppercase italic tracking-wider opacity-80">
                    <Zap size={22} className="text-amber-500 fill-amber-500" /> Performance Pulse
                  </h3>
                  <span className="text-[10px] font-black px-5 py-2 rounded-full border border-indigo-500/20 text-indigo-500">
                    LIVE FEED
                  </span>
                </div>
                <div className="flex-grow w-full min-h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                      <defs>
                        <linearGradient id="voltGlow" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid
                        strokeDasharray="8 8"
                        vertical={false}
                        stroke={isDark ? "#ffffff05" : "#00000005"}
                      />
                      <XAxis dataKey="timestamp" hide />
                      <YAxis domain={[0, 100]} hide />
                      <Tooltip
                        contentStyle={{
                          borderRadius: '24px',
                          border: 'none',
                          backgroundColor: isDark ? '#1a1a1c' : '#fff',
                          padding: '16px'
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="cpu_load"
                        stroke="#6366F1"
                        strokeWidth={5}
                        fill="url(#voltGlow)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-4 bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] text-white p-10 rounded-[3.5rem] shadow-2xl flex flex-col relative overflow-hidden">
                <div className="absolute top-[-10%] right-[-10%] opacity-20 rotate-12">
                  <Waves size={400} />
                </div>
                <div className="flex justify-between items-start mb-10 relative z-10">
                  <div>
                    <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-white/60">
                      Health Score
                    </h4>
                    <p className="text-7xl font-black mt-2">
                      {aiReport?.overallScore || "--"}
                    </p>
                  </div>
                  <ShieldCheck size={28} className="text-white/40" />
                </div>
                {aiReport ? (
                  <div className="space-y-6 flex-grow relative z-10 overflow-y-auto pr-2">
                    <div className="bg-white/10 p-5 rounded-[2rem] border border-white/20 backdrop-blur-md">
                      <p className="text-sm font-bold leading-relaxed italic">
                        "{aiReport.summary}"
                      </p>
                    </div>
                    <ul className="space-y-6">
                      {aiReport.actionPlan?.map((s, i) => (
                        <li key={i} className="flex gap-4 items-start">
                          <div className="shrink-0 bg-white text-indigo-600 h-8 w-8 rounded-xl flex items-center justify-center font-black text-xs">
                            {i + 1}
                          </div>
                          <div className="flex flex-col">
                            <p className="font-black text-[10px] uppercase tracking-wider text-white leading-none">
                              {typeof s === 'object' ? s.step : 'Task'}
                            </p>
                            <p className="text-[11px] text-white/70 mt-2 font-bold leading-tight">
                              {typeof s === 'object' ? s.description : s}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center flex-grow relative z-10">
                    <RefreshCw className="animate-spin opacity-40 mb-4" size={40} />
                    <p className="text-[10px] font-black opacity-40 uppercase tracking-widest">
                      Neural Link Syncing
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {/* FOOTER */}
        <footer className={`flex justify-between items-center p-6 px-12 rounded-[2.5rem] border text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? 'bg-black/40 border-white/5 text-white/20' : 'bg-slate-50 border-slate-200 text-slate-400'}`}>
          <span>Status: Secure</span>
          <span>Last Sync: {new Date().toLocaleTimeString()}</span>
        </footer>
      </div>
    </div>
  );
}
