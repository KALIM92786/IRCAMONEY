import React, { useState, useEffect } from 'react';
import api from '@/api/axios';
import { FileText, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export default function SystemLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const response = await api.get('/api/admin/logs');
        setLogs(response.data);
      } catch (error) {
        console.error('Failed to fetch system logs', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, []);

  const getIcon = (level) => {
    switch (level) {
      case 'error': return <AlertCircle className="text-red-500" size={18} />;
      case 'warn': return <AlertTriangle className="text-orange-500" size={18} />;
      default: return <Info className="text-blue-500" size={18} />;
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <FileText className="text-emerald-500" /> System Logs
      </h1>

      <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden font-mono text-sm">
        <div className="p-4 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
          <span className="text-slate-400">/var/log/ircamoney/system.log</span>
          <div className="flex gap-2">
            <span className="w-3 h-3 rounded-full bg-red-500"></span>
            <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
            <span className="w-3 h-3 rounded-full bg-green-500"></span>
          </div>
        </div>
        <div className="p-4 space-y-2 max-h-[600px] overflow-y-auto text-xs">
          {loading ? (
            <div className="text-slate-400">Loading logs...</div>
          ) : (
            logs.map((log) => (
            <div key={log.id} className="flex gap-4 items-start hover:bg-slate-800/50 p-1 rounded">
              <span className="text-slate-500 shrink-0">{new Date(log.created_at).toLocaleString()}</span>
              <span className="shrink-0 pt-0.5">{getIcon(log.level)}</span>
              <span className={`
                ${log.level === 'error' ? 'text-red-400' : 
                  log.level === 'warn' ? 'text-orange-400' : 'text-slate-300'}
              `}>
                {log.message}
              </span>
            </div>
          ))
          )}
        </div>
      </div>
    </div>
  );
}