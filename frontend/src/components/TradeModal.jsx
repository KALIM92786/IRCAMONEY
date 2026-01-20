import React, { useState } from 'react';
import { useTrades } from '../context/TradeContext';
import { useToast } from '../context/ToastContext';
import api from '@/api/axios';
import { X } from 'lucide-react';

export default function TradeModal() {
  const { isModalOpen, closeTradeModal, tradeParams } = useTrades();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await api.post('/api/orders', {
        ticker: tradeParams.ticker,
        side: tradeParams.side,
        volume: tradeParams.volume
      });
      addToast('Order placed successfully', 'success');
      closeTradeModal();
    } catch (error) {
      addToast('Failed to place order', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!isModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">
            {tradeParams?.type === 'buy' ? 'Buy' : 'Sell'} {tradeParams?.ticker}
          </h3>
          <button onClick={closeTradeModal} className="text-slate-400 hover:text-slate-500 dark:hover:text-white">
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <p className="text-slate-600 dark:text-slate-300">
            Execute {tradeParams?.side} order for {tradeParams?.volume} lots?
          </p>
          <div className="flex gap-3 pt-4">
            <button onClick={closeTradeModal} disabled={loading} className="flex-1 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium disabled:opacity-50">
              Cancel
            </button>
            <button 
              onClick={handleConfirm} 
              disabled={loading}
              className="flex-1 px-4 py-2 rounded-lg bg-emerald-500 text-white font-bold hover:bg-emerald-600 disabled:opacity-50">
              {loading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}