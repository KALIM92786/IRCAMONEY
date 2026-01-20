import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Smartphone, Monitor, Trash2, Globe } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Sessions() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await api.get('/api/sessions');
      setSessions(response.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (id) => {
    try {
      await api.delete(`/api/sessions/${id}`);
      setSessions(sessions.filter(s => s.id !== id));
      addToast('Session revoked', 'success');
    } catch (error) {
      addToast('Failed to revoke session', 'error');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading Sessions...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center space-x-3 mb-8">
        <Monitor className="h-8 w-8 text-emerald-500" />
        <h1 className="text-3xl font-bold text-white">Active Sessions</h1>
      </div>

      <div className="space-y-4">
        {sessions.map(session => (
          <div key={session.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700 flex justify-between items-center">
            <div className="flex items-start gap-4">
              <div className="bg-gray-700 p-3 rounded-lg">
                {session.user_agent.toLowerCase().includes('mobile') ? <Smartphone className="w-6 h-6 text-blue-400" /> : <Monitor className="w-6 h-6 text-purple-400" />}
              </div>
              <div>
                <h3 className="font-bold text-white text-sm md:text-base">{session.user_agent}</h3>
                <div className="flex items-center gap-4 text-xs text-gray-400 mt-1">
                  <span className="flex items-center gap-1"><Globe className="w-3 h-3" /> {session.ip_address}</span>
                  <span>Active: {new Date(session.last_active).toLocaleString()}</span>
                </div>
              </div>
            </div>
            <button onClick={() => handleRevoke(session.id)} className="text-red-400 hover:text-red-300 p-2 hover:bg-red-500/10 rounded-lg transition-colors">
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        ))}
        {sessions.length === 0 && <div className="text-center text-gray-500 py-8">No active sessions found.</div>}
      </div>
    </div>
  );
}