import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

export default function ProfitCalendar() {
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get('/api/calendar');
      
      // Convert array to object map: { '2023-01-01': { profit: 100, trades: 5 } }
      const map = {};
      response.data.forEach(item => {
        const dateStr = new Date(item.date).toISOString().split('T')[0];
        map[dateStr] = item;
      });
      setData(map);
    } catch (error) {
      console.error('Error fetching calendar:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const days = new Date(year, month + 1, 0).getDate();
    const firstDay = new Date(year, month, 1).getDay();
    return { days, firstDay };
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate.setMonth(currentDate.getMonth() + offset));
    setCurrentDate(new Date(newDate));
  };

  const { days, firstDay } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

  if (loading) return <div className="p-8 text-center text-gray-400">Loading Calendar...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-3">
          <CalendarIcon className="h-8 w-8 text-emerald-500" />
          <h1 className="text-3xl font-bold text-white">Profit Calendar</h1>
        </div>
        <div className="flex items-center space-x-4 bg-gray-800 rounded-lg p-1">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-white font-bold min-w-[150px] text-center">{monthName}</span>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden shadow-lg">
        <div className="grid grid-cols-7 bg-gray-900 border-b border-gray-700">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="py-3 text-center text-gray-400 text-sm font-medium uppercase">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 auto-rows-[100px]">
          {[...Array(firstDay)].map((_, i) => <div key={`empty-${i}`} className="bg-gray-800/50 border-r border-b border-gray-700/50" />)}
          
          {[...Array(days)].map((_, i) => {
            const day = i + 1;
            const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day).toISOString().split('T')[0];
            const dayData = data[dateStr];
            
            return (
              <div key={day} className="border-r border-b border-gray-700 p-2 relative hover:bg-gray-700/30 transition-colors">
                <span className="text-gray-500 text-sm font-medium">{day}</span>
                {dayData && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className={`font-bold ${parseFloat(dayData.profit) >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      ${parseFloat(dayData.profit).toFixed(0)}
                    </span>
                    <span className="text-xs text-gray-500">{dayData.trades} trades</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}