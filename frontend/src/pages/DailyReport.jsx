import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { FileBarChart, TrendingUp, TrendingDown, Calendar } from 'lucide-react';

export default function DailyReport() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      const response = await api.get('/api/reports/daily');
      setReports(response.data);
    } catch (error) {
      console.error('Error fetching reports:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading Reports...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center space-x-3 mb-8">
        <FileBarChart className="h-8 w-8 text-emerald-500" />
        <h1 className="text-3xl font-bold text-white">Daily Reports</h1>
      </div>

      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="text-center text-gray-500 py-12 bg-gray-800 rounded-xl">No trading activity found.</div>
        ) : (
          reports.map((report, index) => (
            <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700 shadow-lg">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
                <div className="flex items-center gap-3">
                  <div className="bg-gray-700 p-2 rounded-lg">
                    <Calendar className="w-5 h-5 text-gray-400" />
                  </div>
                  <h2 className="text-xl font-bold text-white">{new Date(report.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</h2>
                </div>
                <div className={`px-4 py-2 rounded-lg font-bold text-lg ${parseFloat(report.net_profit) >= 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                  {parseFloat(report.net_profit) >= 0 ? '+' : ''}${parseFloat(report.net_profit).toFixed(2)}
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gray-700/30 p-3 rounded-lg">
                  <p className="text-gray-400 text-sm">Total Trades</p>
                  <p className="text-white font-bold text-lg">{report.total_trades}</p>
                </div>
                <div className="bg-gray-700/30 p-3 rounded-lg">
                  <p className="text-gray-400 text-sm">Win/Loss</p>
                  <div className="flex items-center gap-2">
                    <span className="text-emerald-400 font-bold">{report.winning_trades}</span>
                    <span className="text-gray-500">/</span>
                    <span className="text-red-400 font-bold">{report.losing_trades}</span>
                  </div>
                </div>
                <div className="bg-gray-700/30 p-3 rounded-lg">
                  <p className="text-gray-400 text-sm">Volume</p>
                  <p className="text-white font-bold text-lg">{parseFloat(report.total_volume).toFixed(2)} Lots</p>
                </div>
                <div className="bg-gray-700/30 p-3 rounded-lg">
                  <p className="text-gray-400 text-sm">Win Rate</p>
                  <p className="text-white font-bold text-lg">
                    {report.total_trades > 0 ? ((parseInt(report.winning_trades) / parseInt(report.total_trades)) * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}