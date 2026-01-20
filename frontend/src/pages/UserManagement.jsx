import React, { useState, useEffect } from 'react';
import api from '@/api/axios';
import { Users, Trash2, Shield, ShieldOff } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/api/admin/users');
      setUsers(response.data);
    } catch (error) {
      addToast('Failed to fetch users', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleAdmin = async (userId) => {
    try {
      await api.post(`/api/admin/users/${userId}/toggle-role`);
      setUsers(users.map(u => u.id === userId ? { ...u, isAdmin: !u.isAdmin } : u));
      addToast('User role updated', 'success');
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to update role', 'error');
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/api/admin/users/${userId}`);
        setUsers(users.filter(u => u.id !== userId));
        addToast('User deleted', 'info');
      } catch (error) {
        addToast(error.response?.data?.message || 'Failed to delete user', 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Users className="text-emerald-500" /> User Management
      </h1>

      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-medium">
              <tr>
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Role</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{user.username}</td>
                  <td className="px-6 py-4 text-slate-500">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.isAdmin ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                      {user.isAdmin ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500 text-sm">{user.created_at}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button 
                      onClick={() => toggleAdmin(user.id)}
                      className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"
                      title="Toggle Admin"
                    >
                      {user.isAdmin ? <ShieldOff size={18} /> : <Shield size={18} />}
                    </button>
                    <button 
                      onClick={() => deleteUser(user.id)}
                      className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                      title="Delete User"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}