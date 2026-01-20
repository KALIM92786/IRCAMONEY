import React, { useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import api from '@/api/axios';
import { useTrades } from '../context/TradeContext';
import { DollarSign, TrendingUp, Activity, PieChart, PlusCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const StatCard = ({ title, value, icon: Icon, trend, color }) => (
  <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
    <div className="flex items-center justify-between mb-4">
      <h3 className="text-slate-500 dark:text-slate-400 text-sm font-medium">{title}</h3>
      <div className={`p-2 rounded-lg ${color} bg-opacity-10`}>
        <Icon size={20} className={color.replace('bg-', 'text-')} />
      </div>
    </div>
    <div className="flex items-baseline gap-2">
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white">{value}</h2>
      {trend && (
        <span className={`text-xs font-medium ${trend >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
          {trend > 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
  </div>
);

export default function Dashboard() {
  const socket = useSocket();
  const [account, setAccount] = useState(null);
  const [price, setPrice] = useState({ bid: 0, ask: 0 });
  const { openTradeModal } = useTrades();
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    // Initial fetch
    api.get('/api/account').then(res => setAccount(res.data)).catch(console.error);
    
    // Mock chart data for visualization
    const mockData = Array.from({ length: 20 }, (_, i) => ({
      name: i,
      value: 10000 + Math.random() * 1000
    }));
    setChartData(mockData);

    if (socket) {
      socket.on('account_update', (data) => setAccount(data));
      socket.on('price_update', (data) => {
        if (data.ticker === 'XAUUSD') setPrice(data);
      });
    }

    return () => {
      if (socket) {
        socket.off('account_update');
        socket.off('price_update');
      }
    };
  }, [socket]);

  if (!account) return <div className="p-8 text-center">Loading Dashboard...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Dashboard</h1>
        <button 
          onClick={() => openTradeModal({ ticker: 'XAUUSD', side: 'buy', volume: 0.01 })}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition-colors"
        >
          <PlusCircle size={18} /> New Trade
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Balance" 
          value={`$${Number(account.balance).toLocaleString()}`} 
          icon={DollarSign} 
          color="bg-blue-500" 
        />
        <StatCard 
          title="Equity" 
          value={`$${Number(account.equity).toLocaleString()}`} 
          icon={TrendingUp} 
          color="bg-emerald-500" 
        />
        <StatCard 
          title="Margin" 
          value={`$${Number(account.margin).toLocaleString()}`} 
          icon={PieChart} 
          color="bg-purple-500" 
        />
        <StatCard 
          title="Free Margin" 
          value={`$${Number(account.free_margin).toLocaleString()}`} 
          icon={Activity} 
          color="bg-orange-500" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Equity Curve</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
                <XAxis dataKey="name" hide />
                <YAxis domain={['auto', 'auto']} hide />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
                />
                <Area type="monotone" dataKey="value" stroke="#10B981" fillOpacity={1} fill="url(#colorValue)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold mb-6 text-slate-900 dark:text-white">Live Quote (XAUUSD)</h3>
          <div className="flex flex-col items-center justify-center h-[200px] space-y-4">
            <div className="text-4xl font-mono font-bold text-slate-900 dark:text-white">
              {price.bid || 'Loading...'}
            </div>
            <div className="flex gap-4 text-sm">
              <span className="text-red-500">Sell: {price.bid}</span>
              <span className="text-emerald-500">Buy: {price.ask}</span>
            </div>
            <div className="text-xs text-slate-500">Spread: {price.ask && price.bid ? (price.ask - price.bid).toFixed(2) : '-'}</div>
          </div>
        </div>
      </div>
    </div>
  );
}