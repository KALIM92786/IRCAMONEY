import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Bell, Check, Info, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/api/notifications');
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/api/notifications/read-all');
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      addToast('All notifications marked as read', 'success');
    } catch (error) {
      addToast('Failed to update notifications', 'error');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading Notifications...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <Bell className="h-8 w-8 text-emerald-500" />
          <h1 className="text-3xl font-bold text-white">Notifications</h1>
        </div>
        <button onClick={markAllRead} className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1"><Check className="w-4 h-4" /> Mark all read</button>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? <div className="text-center text-gray-500 py-12 bg-gray-800 rounded-xl">No notifications.</div> : notifications.map(notif => (
          <div key={notif.id} className={`bg-gray-800 p-4 rounded-xl border ${notif.is_read ? 'border-gray-700 opacity-75' : 'border-emerald-500/50'} flex gap-4`}>
            <div className="mt-1">{notif.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : notif.type === 'error' ? <AlertCircle className="w-5 h-5 text-red-500" /> : <Info className="w-5 h-5 text-blue-500" />}</div>
            <div><h3 className="font-bold text-white">{notif.title}</h3><p className="text-gray-300 text-sm">{notif.message}</p><p className="text-xs text-gray-500 mt-1">{new Date(notif.created_at).toLocaleString()}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}