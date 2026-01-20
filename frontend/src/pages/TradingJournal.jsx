import React, { useState, useEffect } from 'react';
import api from '@/api/axios';
import { BookOpen, Save, Edit2, Search, Download } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function TradingJournal() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    fetchJournal();
  }, []);

  const fetchJournal = async () => {
    try {
      const response = await api.get('/api/journal');
      setDeals(response.data);
    } catch (error) {
      console.error('Error fetching journal:', error);
    } finally {
      setLoading(false);
    }
  };

  const startEditing = (deal) => {
    setEditingId(deal.id);
    setNoteText(deal.notes || '');
  };

  const saveNote = async (id) => {
    try {
      await api.patch(`/api/deals/${id}/notes`, { notes: noteText });
      setDeals(deals.map(d => d.id === id ? { ...d, notes: noteText } : d));
      setEditingId(null);
      addToast('Journal entry updated', 'success');
    } catch (error) {
      addToast('Failed to save note', 'error');
    }
  };

  const filteredDeals = deals.filter(deal => 
    deal.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (deal.notes && deal.notes.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleExportCSV = () => {
    if (filteredDeals.length === 0) {
      addToast('No trades to export', 'info');
      return;
    }

    const headers = ['Date', 'Ticker', 'Side', 'Volume', 'Price', 'Profit', 'Notes'];
    const csvContent = [
      headers.join(','),
      ...filteredDeals.map(deal => [
        new Date(deal.close_time).toLocaleString().replace(',', ''),
        deal.ticker,
        deal.side,
        deal.volume,
        deal.price,
        deal.profit,
        `"${(deal.notes || '').replace(/"/g, '""')}"` // Escape quotes in notes
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `trading_journal_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading Journal...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BookOpen className="text-emerald-500" /> Trading Journal
        </h1>
        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition-colors font-medium text-sm"
        >
          <Download size={18} /> Export CSV
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
        <input
          type="text"
          placeholder="Filter by ticker or notes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:outline-none focus:border-emerald-500 transition-colors text-slate-900 dark:text-white"
        />
      </div>

      <div className="grid gap-4">
        {filteredDeals.map((deal) => (
          <div key={deal.id} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-lg text-slate-900 dark:text-white">{deal.ticker}</span>
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${deal.side === 'buy' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {deal.side.toUpperCase()}
                  </span>
                </div>
                <p className="text-sm text-slate-500">{new Date(deal.close_time).toLocaleString()}</p>
              </div>
              <div className={`font-bold ${Number(deal.profit) >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {Number(deal.profit) >= 0 ? '+' : ''}{Number(deal.profit).toFixed(2)}
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-950 rounded-lg p-4">
              {editingId === deal.id ? (
                <div className="space-y-2">
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    className="w-full bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg p-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 min-h-[100px]"
                    placeholder="Write your thoughts on this trade..."
                  />
                  <div className="flex justify-end gap-2">
                    <button 
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={() => saveNote(deal.id)}
                      className="flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white text-sm rounded-lg transition-colors"
                    >
                      <Save size={14} /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-start group">
                  <p className="text-slate-600 dark:text-slate-300 whitespace-pre-wrap">
                    {deal.notes || <span className="text-slate-400 italic">No notes added yet...</span>}
                  </p>
                  <button 
                    onClick={() => startEditing(deal)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-400 hover:text-emerald-500 transition-opacity"
                  >
                    <Edit2 size={16} />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
        {filteredDeals.length === 0 && (
          <div className="text-center text-slate-500 py-8">No journal entries found matching your search.</div>
        )}
      </div>
    </div>
  );
}