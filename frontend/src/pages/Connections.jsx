import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Link2, Plus, Trash2, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Connections() {
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [accountId, setAccountId] = useState('');
  const [apiToken, setApiToken] = useState('');
  const { addToast } = useToast();

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    try {
      const response = await api.get('/api/connections');
      setConnections(response.data);
    } catch (error) {
      console.error('Error fetching connections:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddConnection = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/connections', { accountId, apiToken });
      addToast('Broker connection added', 'success');
      setAccountId('');
      setApiToken('');
      fetchConnections();
    } catch (error) {
      addToast('Failed to add connection', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Disconnect this broker account?')) return;
    try {
      await api.delete(`/api/connections/${id}`);
      addToast('Connection removed', 'success');
      setConnections(connections.filter(c => c.id !== id));
    } catch (error) {
      addToast('Failed to remove connection', 'error');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading Connections...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center space-x-3 mb-8">
        <Link2 className="h-8 w-8 text-emerald-500" />
        <h1 className="text-3xl font-bold text-white">Broker Connections</h1>
      </div>

      <div className="bg-gray-800 rounded-xl p-6 shadow-lg mb-8">
        <h2 className="text-xl font-bold text-white mb-4">Add New Connection</h2>
        <form onSubmit={handleAddConnection} className="space-y-4">
          <div>
            <label className="block text-gray-400 text-sm mb-1">RoboForex Account ID</label>
            <input type="text" value={accountId} onChange={e => setAccountId(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2" required />
          </div>
          <div>
            <label className="block text-gray-400 text-sm mb-1">API Token</label>
            <input type="password" value={apiToken} onChange={e => setApiToken(e.target.value)} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2" required />
          </div>
          <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2">
            <Plus className="w-4 h-4" /> Connect Account
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {connections.length === 0 ? (
          <div className="text-center text-gray-500 py-8 bg-gray-800 rounded-xl">No active broker connections.</div>
        ) : (
          connections.map(conn => (
            <div key={conn.id} className="bg-gray-800 p-4 rounded-xl flex items-center justify-between border border-gray-700">
              <div className="flex items-center gap-4">
                <div className="bg-emerald-500/20 p-2 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-emerald-500" />
                </div>
                <div>
                  <p className="text-white font-bold">{conn.account_id}</p>
                  <p className="text-xs text-gray-500">Connected on {new Date(conn.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <button onClick={() => handleDelete(conn.id)} className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}