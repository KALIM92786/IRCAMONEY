import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Activity, Clock, Monitor } from 'lucide-react';

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const response = await api.get('/api/activity');
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading Activity...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center space-x-3 mb-8">
        <Activity className="h-8 w-8 text-emerald-500" />
        <h1 className="text-3xl font-bold text-white">Activity Log</h1>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-900 text-gray-400 text-sm uppercase">
              <tr>
                <th className="px-6 py-4">Action</th>
                <th className="px-6 py-4">Details</th>
                <th className="px-6 py-4">IP Address</th>
                <th className="px-6 py-4 text-right">Time</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {logs.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-500">No activity recorded.</td></tr>
              ) : (
                logs.map(log => (
                  <tr key={log.id} className="text-gray-300 hover:bg-gray-700/30">
                    <td className="px-6 py-4 font-bold text-white">{log.action}</td>
                    <td className="px-6 py-4 text-sm">{log.details}</td>
                    <td className="px-6 py-4 font-mono text-xs text-gray-400">{log.ip_address}</td>
                    <td className="px-6 py-4 text-right text-sm text-gray-400">{new Date(log.created_at).toLocaleString()}</td>
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