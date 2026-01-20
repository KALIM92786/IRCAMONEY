import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Users, Copy, Send, Gift } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Referrals() {
  const [data, setData] = useState({ referralCode: '', referrals: [] });
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/api/referrals');
      setData(response.data);
    } catch (error) {
      console.error('Error fetching referrals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/referrals/invite', { email });
      addToast('Invitation sent successfully', 'success');
      setEmail('');
      fetchData();
    } catch (error) {
      addToast('Failed to send invitation', 'error');
    }
  };

  const copyCode = () => {
    navigator.clipboard.writeText(`${window.location.origin}/register?ref=${data.referralCode}`);
    addToast('Referral link copied to clipboard', 'success');
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center space-x-3 mb-8">
        <Gift className="h-8 w-8 text-emerald-500" />
        <h1 className="text-3xl font-bold text-white">Referral Program</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Your Referral Link</h2>
          <div className="flex gap-2 mb-4">
            <input type="text" readOnly value={`${window.location.origin}/register?ref=${data.referralCode}`} className="w-full bg-gray-700 border border-gray-600 text-gray-300 rounded-lg px-3 py-2" />
            <button onClick={copyCode} className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg"><Copy className="w-5 h-5" /></button>
          </div>
          <p className="text-sm text-gray-400">Share this link with friends and earn rewards when they start trading.</p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 shadow-lg border border-gray-700">
          <h2 className="text-xl font-bold text-white mb-4">Invite by Email</h2>
          <form onSubmit={handleInvite} className="flex gap-2">
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="friend@example.com" className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2" required />
            <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"><Send className="w-4 h-4" /> Send</button>
          </form>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="p-4 border-b border-gray-700"><h3 className="font-bold text-white">Referral History</h3></div>
        <div className="p-4">
          {data.referrals.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No referrals yet.</p>
          ) : (
            <ul className="space-y-2">
              {data.referrals.map((ref, idx) => <li key={idx} className="flex justify-between text-gray-300 bg-gray-700/30 p-3 rounded-lg"><span>{ref.referred_email || ref.referred_username}</span><span className="capitalize text-emerald-400">{ref.status}</span></li>)}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}