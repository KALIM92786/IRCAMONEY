import React, { useEffect, useState } from 'react';
import { useSocket } from '../hooks/useSocket';
import api from '@/api/axios';
import { ArrowUpRight, ArrowDownRight, Activity, XCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function OpenTrades() {
  const socket = useSocket();
  const [orders, setOrders] = useState([]);
  const { addToast } = useToast();

  useEffect(() => {
    api.get('/api/orders').then(res => setOrders(res.data)).catch(console.error);

    if (socket) {
      socket.on('orders_update', (data) => setOrders(data));
    }

    return () => {
      if (socket) socket.off('orders_update');
    };
  }, [socket]);

  const handleCloseTrade = async (orderId) => {
    if (!window.confirm('Are you sure you want to close this trade?')) return;
    try {
      await api.delete(`/api/orders/${orderId}`);
      addToast('Trade closure requested', 'info');
    } catch (error) {
      addToast('Failed to close trade', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="text-emerald-500" /> Open Trades
        </h1>
        <span className="text-sm text-slate-500">Live Updates Active</span>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">Ticket</th>
                <th className="px-6 py-4">Symbol</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Volume</th>
                <th className="px-6 py-4">Open Price</th>
                <th className="px-6 py-4">Current</th>
                <th className="px-6 py-4">Profit</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {orders.length === 0 ? (
                <tr><td colSpan="8" className="px-6 py-8 text-center text-slate-500">No open trades.</td></tr>
              ) : (
                orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-slate-500">{order.id}</td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">{order.ticker}</td>
                    <td className="px-6 py-4">
                      <span className={`flex items-center gap-1 font-bold text-xs px-2 py-1 rounded-full w-fit ${order.side === 'buy' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                        {order.side === 'buy' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                        {order.side.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{order.volume}</td>
                    <td className="px-6 py-4 text-sm text-slate-500">{order.open_price}</td>
                    <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-medium">{order.current_price}</td>
                    <td className={`px-6 py-4 font-bold ${Number(order.profit) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                      {Number(order.profit) >= 0 ? '+' : ''}{Number(order.profit).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => handleCloseTrade(order.id)}
                        className="text-slate-400 hover:text-red-500 transition-colors"
                        title="Close Trade">
                        <XCircle size={20} />
                      </button>
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