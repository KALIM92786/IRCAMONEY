import React, { useState } from 'react';
import { LifeBuoy, Send } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function Support() {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { addToast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      addToast('Support ticket created successfully. We will contact you shortly.', 'success');
      setSubject('');
      setMessage('');
      setLoading(false);
    }, 1000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <LifeBuoy className="text-emerald-500" /> Support Center
      </h1>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Need help with your account or trading strategy? Fill out the form below and our support team will get back to you.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Subject</label>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
              required
            >
              <option value="" disabled>Select a topic</option>
              <option value="account">Account Issue</option>
              <option value="billing">Billing & Payments</option>
              <option value="technical">Technical Support</option>
              <option value="feature">Feature Request</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={5}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 resize-none"
              placeholder="Describe your issue in detail..."
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Sending...' : <><Send size={20} /> Submit Ticket</>}
          </button>
        </form>
      </div>

      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800 text-center">
        <p className="text-blue-800 dark:text-blue-300 text-sm">
          For urgent matters, you can also email us directly at <a href="mailto:support@ircamoney.com" className="underline font-bold">support@ircamoney.com</a>
        </p>
      </div>
    </div>
  );
}