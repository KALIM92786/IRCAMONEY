import React, { useState, useEffect } from 'react';
import api from '@/api/axios';
import { Archive } from 'lucide-react';

const ArchivedTrades = () => {
  const [trades, setTrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArchivedTrades = async () => {
      try {
        const response = await api.get('/api/trades/archived');
        setTrades(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch archived trades', error);
        setLoading(false);
      }
    };

    fetchArchivedTrades();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Archive className="text-gray-500" /> Archived Trades
      </h1>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticker</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profit</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Close Date</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {trades.map((trade) => (
              <tr key={trade.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{trade.ticker}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold ${Number(trade.profit) > 0 ? 'text-green-600' : 'text-red-600'}`}>${Number(trade.profit).toFixed(2)}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(trade.close_time).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {loading && <div className="p-4 text-center text-gray-500">Loading...</div>}
      </div>
    </div>
  );
};

export default ArchivedTrades;