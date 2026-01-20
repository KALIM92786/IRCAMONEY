import React, { useState } from 'react';
import { ShieldCheck, Smartphone } from 'lucide-react';
import { useToast } from '../context/ToastContext';

export default function TwoFactorAuth() {
  const [code, setCode] = useState('');
  const { addToast } = useToast();

  const handleVerify = (e) => {
    e.preventDefault();
    if (code.length === 6) {
      addToast('2FA Enabled Successfully', 'success');
    } else {
      addToast('Invalid code', 'error');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <ShieldCheck className="text-emerald-500" /> Two-Factor Authentication
      </h1>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <Smartphone className="text-emerald-500" size={32} />
        </div>
        
        <p className="text-slate-600 dark:text-slate-300 mb-6">
          Scan the QR code with your authenticator app (Google Authenticator, Authy) to enable 2FA.
        </p>

        <div className="bg-slate-200 dark:bg-slate-800 w-48 h-48 mx-auto mb-6 rounded-lg flex items-center justify-center text-slate-400">
          [QR Code Placeholder]
        </div>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter 6-digit code"
            className="w-full text-center text-2xl tracking-widest bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-3 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            maxLength={6}
          />
          <button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-lg transition-colors">
            Verify & Enable
          </button>
        </form>
      </div>
    </div>
  );
}