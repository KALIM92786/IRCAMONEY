import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Target, Plus, Trash2, CheckCircle, Circle } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newGoal, setNewGoal] = useState({ title: '', targetAmount: '', deadline: '' });
  const { addToast } = useToast();

  useEffect(() => {
    fetchGoals();
  }, []);

  const fetchGoals = async () => {
    try {
      const response = await api.get('/api/goals');
      setGoals(response.data);
    } catch (error) {
      console.error('Error fetching goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddGoal = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/goals', newGoal);
      addToast('Goal added successfully', 'success');
      setNewGoal({ title: '', targetAmount: '', deadline: '' });
      fetchGoals();
    } catch (error) {
      addToast('Failed to add goal', 'error');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this goal?')) return;
    try {
      await api.delete(`/api/goals/${id}`);
      setGoals(goals.filter(g => g.id !== id));
      addToast('Goal deleted', 'success');
    } catch (error) {
      addToast('Failed to delete goal', 'error');
    }
  };

  if (loading) return <div className="p-8 text-center text-gray-400">Loading Goals...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center space-x-3 mb-8">
        <Target className="h-8 w-8 text-emerald-500" />
        <h1 className="text-3xl font-bold text-white">Financial Goals</h1>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-1 bg-gray-800 rounded-xl p-6 shadow-lg h-fit">
          <h2 className="text-xl font-bold text-white mb-4">Set New Goal</h2>
          <form onSubmit={handleAddGoal} className="space-y-4">
            <div>
              <label className="block text-gray-400 text-sm mb-1">Goal Title</label>
              <input type="text" value={newGoal.title} onChange={e => setNewGoal({...newGoal, title: e.target.value})} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2" placeholder="e.g. New Laptop" required />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Target Amount ($)</label>
              <input type="number" value={newGoal.targetAmount} onChange={e => setNewGoal({...newGoal, targetAmount: e.target.value})} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2" placeholder="1000" required />
            </div>
            <div>
              <label className="block text-gray-400 text-sm mb-1">Deadline</label>
              <input type="date" value={newGoal.deadline} onChange={e => setNewGoal({...newGoal, deadline: e.target.value})} className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2" />
            </div>
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" /> Add Goal
            </button>
          </form>
        </div>

        <div className="md:col-span-2 space-y-4">
          {goals.length === 0 ? (
            <div className="text-center text-gray-500 py-12 bg-gray-800 rounded-xl">No goals set yet.</div>
          ) : (
            goals.map(goal => {
              const progress = Math.min(100, (parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100);
              return (
                <div key={goal.id} className="bg-gray-800 p-6 rounded-xl border border-gray-700">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-bold text-white">{goal.title}</h3>
                      <p className="text-sm text-gray-400">Target: ${parseFloat(goal.target_amount).toLocaleString()} • By {new Date(goal.deadline).toLocaleDateString()}</p>
                    </div>
                    <button onClick={() => handleDelete(goal.id)} className="text-gray-500 hover:text-red-400"><Trash2 className="w-5 h-5" /></button>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-4 mb-2">
                    <div className="bg-emerald-500 h-4 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-400 font-bold">${parseFloat(goal.current_amount).toLocaleString()} saved</span>
                    <span className="text-gray-400">{progress.toFixed(1)}%</span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}