import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Lock, CheckCircle } from 'lucide-react';

export default function ResetPassword() {
  const { token } = useParams();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) return addToast('Passwords do not match', 'error');
    
    setLoading(true);
    try {
      await resetPassword(token, password);
      addToast('Password reset successfully', 'success');
      navigate('/login');
    } catch (error) {
      addToast('Failed to reset password', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800 w-full max-w-md shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-slate-400">Create a new secure password</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {['password', 'confirm'].map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium text-slate-300 mb-2 capitalize">{field === 'confirm' ? 'Confirm Password' : 'New Password'}</label>
              <input
                type="password"
                value={field === 'password' ? password : confirm}
                onChange={(e) => field === 'password' ? setPassword(e.target.value) : setConfirm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                required
              />
            </div>
          ))}
          <button type="submit" disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
            {loading ? 'Resetting...' : <><CheckCircle size={20} /> Reset Password</>}
          </button>
        </form>
      </div>
    </div>
  );
}