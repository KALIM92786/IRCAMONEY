import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { User, Mail, Lock, Save, Key } from 'lucide-react';
import api from '@/api/axios';

export default function Profile() {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [passwords, setPasswords] = useState({ current: '', new: '', confirm: '' });
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return addToast('New passwords do not match', 'error');
    }
    setLoading(true);
    try {
      await api.post('/api/auth/change-password', { current: passwords.current, new: passwords.new });
      addToast('Password updated successfully', 'success');
      setPasswords({ current: '', new: '', confirm: '' });
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <User className="text-emerald-500" /> My Profile
      </h1>

      <div className="grid md:grid-cols-3 gap-6">
        {/* User Info Card */}
        <div className="md:col-span-1 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm h-fit">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-24 h-24 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center text-3xl font-bold text-emerald-500 mb-4">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">{user?.username}</h2>
            <p className="text-slate-500">{user?.isAdmin ? 'Administrator' : 'Trader'}</p>
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
              <Mail size={18} />
              <span className="text-sm">{user?.email || 'user@example.com'}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-400">
              <Key size={18} />
              <span className="text-sm">ID: {user?.id?.substring(0, 8)}...</span>
            </div>
          </div>
        </div>

        {/* Change Password Form */}
        <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
            <Lock size={20} /> Security
          </h3>
          <form onSubmit={handlePasswordChange} className="space-y-4">
            {['current', 'new', 'confirm'].map((field) => (
              <div key={field}>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1 capitalize">
                  {field === 'confirm' ? 'Confirm New Password' : `${field} Password`}
                </label>
                <input
                  type="password"
                  value={passwords[field]}
                  onChange={(e) => setPasswords({ ...passwords, [field]: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 transition-colors"
                  required
                />
              </div>
            ))}
            <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? 'Updating...' : <><Save size={18} /> Update Password</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}