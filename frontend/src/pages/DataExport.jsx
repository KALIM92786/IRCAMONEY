import React, { useState } from 'react';
import api from '../api/axios';
import { Download, FileText, Calendar } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function DataExport() {
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleExport = async (type) => {
    setLoading(true);
    try {
      const response = await api.get(`/api/export/${type}`, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      addToast(`${type} exported successfully`, 'success');
    } catch (error) {
      addToast('Export failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center space-x-3 mb-8">
        <Download className="h-8 w-8 text-emerald-500" />
        <h1 className="text-3xl font-bold text-white">Data Export</h1>
      </div>

      <div className="bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-700">
        <p className="text-gray-400 mb-8">Download your trading history and account data in CSV format for external analysis.</p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-700/30 rounded-lg border border-gray-600">
            <div className="flex items-center gap-4">
              <div className="bg-blue-500/20 p-3 rounded-lg">
                <FileText className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-white font-bold">Trade History</h3>
                <p className="text-sm text-gray-400">Complete list of closed deals</p>
              </div>
            </div>
            <button 
              onClick={() => handleExport('trades')}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}