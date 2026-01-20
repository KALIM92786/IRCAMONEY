import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { BookOpen, Save, Edit3 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Journal() {
  const [notes, setNotes] = useState([]);
  const [deals, setDeals] = useState([]); // To select a deal to add note
  const [selectedDeal, setSelectedDeal] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [notesRes, dealsRes] = await Promise.all([
        api.get('/api/journal'),
        api.get('/api/history')
      ]);
      setNotes(notesRes.data);
      setDeals(dealsRes.data);
    } catch (error) {
      console.error('Error fetching journal data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!selectedDeal || !content) return;

    try {
      await api.post('/api/journal', 
        { dealId: selectedDeal, content }
      );
      addToast('Journal entry saved', 'success');
      setContent('');
      setSelectedDeal('');
      fetchData();
    } catch (error) {
      addToast('Failed to save entry', 'error');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading Journal...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center space-x-3 mb-8">
        <BookOpen className="h-8 w-8 text-emerald-500" />
        <h1 className="text-3xl font-bold text-white">Trading Journal</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Entry Form */}
        <div className="md:col-span-1 bg-gray-800 rounded-xl p-6 shadow-lg h-fit">
          <h2 className="text-xl font-bold text-white mb-4">New Entry</h2>
          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Select Trade</label>
              <select 
                value={selectedDeal} 
                onChange={e => setSelectedDeal(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2"
                required
              >
                <option value="">-- Select a closed trade --</option>
                {deals.map(deal => (
                  <option key={deal.id} value={deal.id}>
                    {new Date(deal.close_time).toLocaleDateString()} - {deal.ticker} ({deal.profit >= 0 ? '+' : ''}{deal.profit})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Notes</label>
              <textarea 
                value={content}
                onChange={e => setContent(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 h-32 resize-none"
                placeholder="What was your strategy? Emotions? Mistakes?"
                required
              />
            </div>
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2">
              <Save className="w-4 h-4" /> Save Entry
            </button>
          </form>
        </div>

        {/* Journal Entries */}
        <div className="md:col-span-2 space-y-4">
          {notes.length === 0 ? (
            <div className="text-center text-gray-500 py-12 bg-gray-800 rounded-xl">No journal entries yet.</div>
          ) : (
            notes.map((note, idx) => (
              <div key={idx} className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="text-lg font-bold text-white">{note.ticker} Trade</h3>
                    <p className="text-xs text-gray-500">{new Date(note.updated_at).toLocaleString()}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-bold ${parseFloat(note.profit) >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                    {parseFloat(note.profit) >= 0 ? '+' : ''}{parseFloat(note.profit).toFixed(2)}
                  </span>
                </div>
                <p className="text-gray-300 whitespace-pre-wrap">{note.content}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}