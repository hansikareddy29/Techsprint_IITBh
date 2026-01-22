import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Cpu, Battery, CheckCircle, AlertCircle, RefreshCw, Zap, ShieldCheck } from 'lucide-react';

const API_BASE = "http://localhost:8080/api";

export default function App() {
  const [deviceId, setDeviceId] = useState(localStorage.getItem('my_device_id') || "");
  const [devices, setDevices] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [aiReport, setAiReport] = useState(null);
  const [loading, setLoading] = useState(true);

  // 1. Fetch available devices list once on load
  useEffect(() => {
    axios.get(`${API_BASE}/logs/list-devices`)
      .then(res => {
        const foundDevices = res.data.devices || [];
        setDevices(foundDevices);
        if (!deviceId && foundDevices.length > 0) {
          setDeviceId(foundDevices[0]);
          localStorage.setItem('my_device_id', foundDevices[0]);
        }
      });
  }, []);

  // 2. FETCH TELEMETRY (Hardware Stats) - Fast Polling
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
      } catch (e) { console.error("Telemetry fetch error", e); }
    };

    fetchStats();
    // Hardware data refreshes every 10 seconds (safe)
    const statsInterval = setInterval(fetchStats, 3600000); 
    
    return () => clearInterval(statsInterval);
  }, [deviceId]);

  // 3. FETCH AI DIAGNOSIS - Separate and SLOW
  useEffect(() => {
    if (!deviceId) return;

    const fetchAI = () => {
        setAiReport(null); // Clear old report to show loading
        axios.get(`${API_BASE}/ai/diagnosis/${deviceId}`)
          .then(res => setAiReport(res.data))
          .catch((err) => {
            console.error("AI Error:", err);
            setAiReport({ summary: "AI limit reached or server error. Check backend logs." });
          });
    };

    fetchAI();
    // We do NOT set an interval for AI. 
    // It only runs ONCE when deviceId changes.
  }, [deviceId]);

  const handleDeviceChange = (id) => {
    setDeviceId(id);
    localStorage.setItem('my_device_id', id);
  };

  if (loading && !deviceId) return <div className="p-20 text-center"><RefreshCw className="animate-spin mx-auto"/> Loading VoltGuard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex justify-between items-center bg-white p-6 rounded-3xl shadow-sm">
          <div className="flex items-center gap-3">
            <Activity className="text-indigo-600" size={32}/>
            <h1 className="text-xl font-black">VoltGuard Dashboard</h1>
          </div>
          
          <div className="flex items-center gap-3 bg-slate-100 p-2 rounded-2xl">
            <ShieldCheck size={18} className="text-indigo-500"/>
            <select 
              value={deviceId} 
              onChange={(e) => handleDeviceChange(e.target.value)}
              className="bg-transparent font-bold outline-none text-slate-700"
            >
              {devices.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
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

        {/* Chart and AI Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-[2rem] shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2"><Zap size={18} className="text-yellow-500"/> Performance Trend</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="timestamp" hide />
                  <YAxis hide />
                  <Tooltip />
                  <Area type="monotone" dataKey="cpu_load" stroke="#6366f1" fill="#6366f133" strokeWidth={3} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-indigo-600 text-white p-8 rounded-[2rem] shadow-xl relative">
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-black text-2xl">AI Health: {aiReport?.overallScore || "--"}</h4>
              <button 
                onClick={() => window.location.reload()} 
                className="bg-white/10 p-2 rounded-lg hover:bg-white/20 transition"
                title="Refresh AI"
              >
                <RefreshCw size={16}/>
              </button>
            </div>
            
            {aiReport ? (
              <>
                <p className="text-sm italic opacity-90 mb-6">"{aiReport.summary}"</p>
                <div className="space-y-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-60">High Drain Apps</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {aiReport.culprits?.map(c => <span key={c} className="bg-white/20 px-2 py-1 rounded-md text-xs">{c}</span>)}
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase opacity-60">Action Plan</p>
                    <ul className="text-xs space-y-2 mt-2">
                      {aiReport.actionPlan?.map(s => <li key={s} className="flex gap-2"><CheckCircle size={12}/> {s}</li>)}
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-48 opacity-50">
                <RefreshCw className="animate-spin mb-2" size={32}/>
                <p className="text-xs font-bold uppercase">Generating Report...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}