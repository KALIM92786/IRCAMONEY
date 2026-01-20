import React from 'react';
import { Activity, Server, Database, Cpu } from 'lucide-react';

const HealthCard = ({ title, status, metric, icon: Icon }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-lg">
        <Icon className="text-emerald-500" size={24} />
      </div>
      <span className={`px-2 py-1 rounded text-xs font-bold ${status === 'Healthy' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-600'}`}>
        {status}
      </span>
    </div>
    <h3 className="text-slate-500 dark:text-slate-400 font-medium mb-1">{title}</h3>
    <p className="text-2xl font-bold text-slate-900 dark:text-white">{metric}</p>
  </div>
);

export default function SystemHealth() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Activity className="text-emerald-500" /> System Health
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <HealthCard 
          title="API Status" 
          status="Healthy" 
          metric="99.9% Uptime" 
          icon={Server} 
        />
        <HealthCard 
          title="Database" 
          status="Healthy" 
          metric="12ms Latency" 
          icon={Database} 
        />
        <HealthCard 
          title="Sync Engine" 
          status="Healthy" 
          metric="3.0s Interval" 
          icon={Activity} 
        />
        <HealthCard 
          title="Server Load" 
          status="Healthy" 
          metric="24% CPU" 
          icon={Cpu} 
        />
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Service Status</h3>
        <div className="space-y-4">
          {['Authentication Service', 'RoboForex Connector', 'WebSocket Server', 'Notification Service'].map((service) => (
            <div key={service} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
              <span className="font-medium text-slate-700 dark:text-slate-300">{service}</span>
              <div className="flex items-center gap-2 text-emerald-500 text-sm font-bold"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> Operational</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}