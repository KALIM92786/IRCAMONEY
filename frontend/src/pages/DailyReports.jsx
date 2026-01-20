import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import api from '@/api/axios';

export default function DailyReports() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/reports/daily');
        const formattedData = response.data.map(item => ({
          ...item,
          profit: parseFloat(item.profit),
          trades: parseInt(item.trades)
        }));
        setData(formattedData);
      } catch (error) {
        console.error('Failed to fetch daily reports', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Reports...</div>;

  const totalProfit = data.reduce((acc, curr) => acc + curr.profit, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Calendar className="text-emerald-500" /> Daily Reports
        </h1>
        <div className={`px-4 py-2 rounded-lg font-bold ${totalProfit >= 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700'}`}>
          Total (14d): ${totalProfit.toFixed(2)}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-[400px]">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Daily Profit/Loss</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis dataKey="date" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            />
            <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.profit >= 0 ? '#10B981' : '#EF4444'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.slice().reverse().map((day, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-center">
            <div>
              <p className="text-sm text-slate-500">{day.date}</p>
              <p className="text-xs text-slate-400">{day.trades} trades</p>
            </div>
            <div className={`font-bold ${day.profit >= 0 ? 'text-emerald-500' : 'text-red-500'} flex items-center gap-1`}>
              {day.profit >= 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              ${day.profit.toFixed(2)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}