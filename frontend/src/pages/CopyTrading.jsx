import React, { useState, useEffect } from 'react';
import api from '@/api/axios';
import { Copy, Settings, Save } from 'lucide-react';

const CopyTrading = () => {
  const [masterAccount, setMasterAccount] = useState('');
  const [slaveAccount, setSlaveAccount] = useState('');
  const [multiplier, setMultiplier] = useState(1.0);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await api.get('/api/copy-trading/settings');
        if (response.data && response.data.master_account_id) {
          setMasterAccount(response.data.master_account_id);
          setSlaveAccount(response.data.slave_account_id);
          setMultiplier(response.data.multiplier);
        }
      } catch (error) {
        console.error('Failed to fetch copy trading settings', error);
      }
    };
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.post('/api/copy-trading/settings', {
        masterAccount,
        slaveAccount,
        multiplier,
      });
      // Success feedback handled by UI state, could add toast here if context was available
      alert('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Copy className="text-blue-500" /> Copy Trading Settings
      </h1>
      
      <form onSubmit={handleSaveSettings} className="bg-white p-8 rounded-lg shadow-md max-w-lg mx-auto">
        <div className="mb-4">
          <label htmlFor="masterAccount" className="block text-sm font-medium text-gray-700">Master Account ID</label>
          <input
            type="text"
            id="masterAccount"
            value={masterAccount}
            onChange={(e) => setMasterAccount(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter Master Account ID"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="slaveAccount" className="block text-sm font-medium text-gray-700">Slave Account ID</label>
          <input
            type="text"
            id="slaveAccount"
            value={slaveAccount}
            onChange={(e) => setSlaveAccount(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Enter Slave Account ID"
          />
        </div>

        <div className="mb-6">
          <label htmlFor="multiplier" className="block text-sm font-medium text-gray-700">Risk Multiplier</label>
          <input
            type="number"
            id="multiplier"
            step="0.1"
            min="0.1"
            value={multiplier}
            onChange={(e) => setMultiplier(parseFloat(e.target.value))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g. 1.0"
          />
          <p className="mt-1 text-xs text-gray-500">1.0 = Same risk. 0.5 = Half risk. 2.0 = Double risk.</p>
        </div>

        <button type="submit" disabled={isSaving} className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50">
          {isSaving ? 'Saving...' : <><Save className="w-4 h-4 mr-2" /> Save Settings</>}
        </button>
      </form>
    </div>
  );
};

export default CopyTrading;