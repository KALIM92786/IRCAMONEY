import React, { useEffect, useState } from 'react';
import api from '@/api/axios';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { LineChart as LineChartIcon } from 'lucide-react';

export default function EquityCurve() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/equity-history');
        // Format data for chart
        const formattedData = response.data.map(item => ({
          ...item,
          timestamp: new Date(item.timestamp).toLocaleTimeString(),
          fullDate: new Date(item.timestamp).toLocaleString()
        }));
        setData(formattedData);
      } catch (error) {
        console.error('Failed to fetch equity history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Chart Data...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <LineChartIcon className="text-emerald-500" /> Equity Curve
        </h1>
        <div className="flex bg-slate-200 dark:bg-slate-800 rounded-lg p-1">
          {['1H', '24H', '1W', 'All'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range.toLowerCase())}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                timeRange === range.toLowerCase()
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-[500px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
            <XAxis dataKey="timestamp" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
            <YAxis stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
            <Tooltip 
              contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              labelStyle={{ color: '#9CA3AF' }}
            />
            <Area type="monotone" dataKey="equity" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorEquity)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}