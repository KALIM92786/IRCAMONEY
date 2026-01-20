import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { AlertTriangle, Power, RefreshCw } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Maintenance() {
  const [isMaintenance, setIsMaintenance] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const { addToast } = useToast();

  useEffect(() => {
    checkStatus();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user.isAdmin) setIsAdmin(true);
  }, []);

  const checkStatus = async () => {
    try {
      const response = await api.get('/api/system/maintenance');
      setIsMaintenance(response.data.maintenance);
    } catch (error) {
      console.error('Failed to check maintenance status');
    }
  };

  const toggleMaintenance = async () => {
    try {
      const response = await api.post('/api/system/maintenance', { enabled: !isMaintenance });
      setIsMaintenance(response.data.maintenance);
      addToast(`Maintenance mode turned ${response.data.maintenance ? 'ON' : 'OFF'}`, 'success');
    } catch (error) {
      addToast('Failed to update maintenance mode', 'error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 text-center">
      <div className="bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 max-w-md w-full">
        <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-yellow-500" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-4">System Maintenance</h1>
        <p className="text-gray-400 mb-8">
          We are currently performing scheduled maintenance to improve our services. Please check back later.
        </p>
        
        <button onClick={() => window.location.reload()} className="flex items-center justify-center gap-2 mx-auto text-emerald-400 hover:text-emerald-300 transition-colors mb-8">
          <RefreshCw className="w-4 h-4" /> Refresh Page
        </button>

        {isAdmin && (
          <div className="border-t border-gray-700 pt-6">
            <p className="text-sm text-gray-500 mb-4">Admin Control</p>
            <button onClick={toggleMaintenance} className={`w-full py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors ${isMaintenance ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-red-600 hover:bg-red-500 text-white'}`}>
              <Power className="w-5 h-5" /> {isMaintenance ? 'Turn Maintenance OFF' : 'Turn Maintenance ON'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}