import React, { useState, useEffect } from 'react';
import api from '@/api/axios';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function Portfolio() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await api.get('/api/orders');
        const orders = response.data;

        // Group by symbol (ticker)
        const exposure = orders.reduce((acc, order) => {
          const symbol = order.ticker;
          const volume = parseFloat(order.volume);
          if (!acc[symbol]) acc[symbol] = 0;
          acc[symbol] += volume;
          return acc;
        }, {});

        const chartData = Object.keys(exposure).map((key) => ({
          name: key,
          value: exposure[key]
        }));

        // If no data, add placeholder
        if (chartData.length === 0) {
          setData([{ name: 'Cash', value: 100 }]);
        } else {
          setData(chartData);
        }
      } catch (error) {
        console.error('Failed to fetch portfolio data', error);
        setData([{ name: 'Cash', value: 100 }]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Portfolio...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <PieChartIcon className="text-emerald-500" /> Portfolio Allocation
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-[400px]">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Asset Exposure (Volume)</h3>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                fill="#8884d8"
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#1F2937', border: 'none', borderRadius: '8px', color: '#fff' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Additional metrics could go here */}
      </div>
    </div>
  );
}