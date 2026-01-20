import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Activity, Cpu, Battery, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const API_BASE = "http://10.50.3.159:8080/api";

export default function App() {
  const [deviceId, setDeviceId] = useState("");
  const [devices, setDevices] = useState([]);
  const [history, setHistory] = useState([]);
  const [stats, setStats] = useState({});
  const [aiReport, setAiReport] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE}/logs/list-devices`).then(res => {
      setDevices(res.data.devices);
      if (res.data.devices.length > 0) setDeviceId(res.data.devices[0]);
    });
  }, []);

  useEffect(() => {
    if (!deviceId) return;
    const fetch = async () => {
      try {
        const [h, s, a] = await Promise.all([
          axios.get(`${API_BASE}/logs/history/${deviceId}`),
          axios.get(`${API_BASE}/logs/stats/${deviceId}`),
          axios.get(`${API_BASE}/ai/diagnosis/${deviceId}`)
        ]);
        setHistory(h.data.slice(-20));
        setStats(s.data);
        setAiReport(a.data);
      } catch (e) { console.error(e); }
    };
    fetch();
    const inv = setInterval(fetch, 10000);
    return () => clearInterval(inv);
  }, [deviceId]);

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-indigo-600 flex items-center gap-2"><Activity/> VoltGuard AI</h1>
            <select className="p-2 rounded border" onChange={(e)=>setDeviceId(e.target.value)} value={deviceId}>
                {devices.map(d => <option key={d}>{d}</option>)}
            </select>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-indigo-100">
                <div className="text-xs font-bold text-slate-400 uppercase">Average CPU</div>
                <div className="text-3xl font-black">{stats.avgCpu}%</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-emerald-100">
                <div className="text-xs font-bold text-slate-400 uppercase">Live Battery</div>
                <div className="text-3xl font-black">{stats.lastBattery}%</div>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-red-100 text-red-600 font-bold">
                <div className="text-xs font-bold text-slate-400 uppercase">Total Alerts</div>
                <div className="text-3xl font-black">{stats.totalAlerts}</div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} />
                        <XAxis dataKey="timestamp" hide />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Area type="monotone" dataKey="cpu_load" stroke="#6366f1" fill="#e0e7ff" strokeWidth={3} />
                    </AreaChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-indigo-600 text-white p-8 rounded-3xl shadow-xl flex flex-col justify-between">
                <div>
                    <div className="text-5xl font-black mb-1">{aiReport?.overallScore || "--"}/100</div>
                    <div className="text-xs uppercase font-bold opacity-70 tracking-widest mb-6">AI Health Score</div>
                    <p className="text-sm opacity-90 leading-relaxed mb-6 italic">"{aiReport?.summary || 'Waiting for system logs...'}"</p>
                    
                    <div className="space-y-4">
                        <div className="text-xs font-bold uppercase opacity-60">Action Plan</div>
                        {aiReport?.actionPlan?.map((step, i) => (
                            <div key={i} className="flex gap-2 text-sm"><CheckCircle size={16}/> {step}</div>
                        ))}
                    </div>
                </div>
                <div className="mt-8 pt-4 border-t border-white/10 text-xs opacity-60">Prediction: {aiReport?.prediction}</div>
            </div>
        </div>
      </div>
    </div>
  );
}