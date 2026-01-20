import React, { useState, useEffect } from 'react';
import api from '@/api/axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Target, TrendingUp, Activity, Scale } from 'lucide-react';

export default function StrategyPerformance() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/reports/strategy')
      .then(res => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Strategy Data...</div>;
  if (!stats) return <div className="p-8 text-center text-slate-500">No data available</div>;

  const winLossData = [
    { name: 'Wins', value: parseInt(stats.wins) || 0 },
    { name: 'Losses', value: parseInt(stats.losses) || 0 }
  ];
  const COLORS = ['#10B981', '#EF4444'];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Target className="text-emerald-500" /> Strategy Performance
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
              <TrendingUp size={20} />
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 font-medium">Net Profit</h3>
          </div>
          <p className={`text-2xl font-bold ${stats.netProfit >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
            ${Number(stats.netProfit).toFixed(2)}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
              <Activity size={20} />
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 font-medium">Win Rate</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.winRate || 0}%
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
              <Scale size={20} />
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 font-medium">Profit Factor</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.profitFactor}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg text-orange-600 dark:text-orange-400">
              <Target size={20} />
            </div>
            <h3 className="text-slate-500 dark:text-slate-400 font-medium">Total Trades</h3>
          </div>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">
            {stats.totalTrades || 0}
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-[400px]">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Win/Loss Ratio</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={winLossData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {winLossData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}