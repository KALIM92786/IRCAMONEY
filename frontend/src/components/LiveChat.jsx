import React, { useState } from 'react';
import { MessageCircle, X } from 'lucide-react';

export default function LiveChat() {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="fixed bottom-6 right-6 bg-emerald-500 text-white p-4 rounded-full shadow-lg hover:bg-emerald-600 transition-colors z-40">
        <MessageCircle size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-80 h-96 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl z-40 flex flex-col">
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-emerald-500 rounded-t-xl">
        <h3 className="font-bold text-white">Support Chat</h3>
        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white"><X size={18} /></button>
      </div>
      <div className="flex-1 p-4 flex items-center justify-center text-slate-400 text-sm">
        Chat system offline.
      </div>
    </div>
  );
}