import React, { useState, useEffect } from 'react';
import api from '@/api/axios';
import { History, ArrowUpRight, ArrowDownRight, Filter } from 'lucide-react';

export default function TradeHistory() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, buy, sell

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await api.get('/api/history');
      setDeals(response.data);
    } catch (error) {
      console.error('Error fetching trade history:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredDeals = deals.filter(deal => {
    if (filter === 'all') return true;
    return deal.side === filter;
  });

  if (loading) return <div className="p-8 text-center text-gray-400">Loading History...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center space-x-3">
          <History className="h-8 w-8 text-emerald-500" />
          <h1 className="text-3xl font-bold text-white">Trade History</h1>
        </div>
        
        <div className="flex items-center space-x-2 bg-gray-800 p-1 rounded-lg border border-gray-700">
          <Filter className="w-4 h-4 text-gray-400 ml-2" />
          <select 
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
            className="bg-transparent text-white text-sm focus:outline-none p-2"
          >
            <option value="all">All Trades</option>
            <option value="buy">Buy Only</option>
            <option value="sell">Sell Only</option>
          </select>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-900 text-gray-400 text-sm uppercase">
              <tr>
                <th className="px-6 py-4">Time</th>
                <th className="px-6 py-4">Symbol</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Volume</th>
                <th className="px-6 py-4">Price</th>
                <th className="px-6 py-4">Profit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredDeals.length === 0 ? (
                <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">No trades found.</td></tr>
              ) : (
                filteredDeals.map((deal) => (
                  <tr key={deal.id} className="text-gray-300 hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-400">
                      {new Date(deal.close_time || deal.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-white">{deal.ticker}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 font-bold ${deal.side === 'buy' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {deal.side === 'buy' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                        {deal.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">{deal.volume}</td>
                    <td className="px-6 py-4">{deal.price}</td>
                    <td className={`px-6 py-4 font-bold ${parseFloat(deal.profit) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {parseFloat(deal.profit) >= 0 ? '+' : ''}{parseFloat(deal.profit).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}