import React, { useState } from 'react';
import { Calculator, RefreshCw } from 'lucide-react';

export default function RiskCalculator() {
  const [balance, setBalance] = useState(10000);
  const [riskPercent, setRiskPercent] = useState(1);
  const [stopLoss, setStopLoss] = useState(50);
  const [pair, setPair] = useState('EURUSD');

  const calculateLotSize = () => {
    const riskAmount = balance * (riskPercent / 100);
    // Simplified formula: Risk / (SL * PipValue)
    // Assuming standard lot pip value of $10 for EURUSD
    const pipValue = 10; 
    const lots = riskAmount / (stopLoss * pipValue);
    return lots.toFixed(2);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
        <Calculator className="text-emerald-500" /> Risk Calculator
      </h1>

      <div className="bg-white dark:bg-slate-900 p-8 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Account Balance ($)</label>
            <input
              type="number"
              value={balance}
              onChange={(e) => setBalance(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Risk Percentage (%)</label>
            <input
              type="number"
              value={riskPercent}
              onChange={(e) => setRiskPercent(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Stop Loss (Pips)</label>
            <input
              type="number"
              value={stopLoss}
              onChange={(e) => setStopLoss(Number(e.target.value))}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Currency Pair</label>
            <select
              value={pair}
              onChange={(e) => setPair(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
            >
              <option value="EURUSD">EURUSD</option>
              <option value="GBPUSD">GBPUSD</option>
              <option value="XAUUSD">XAUUSD</option>
            </select>
          </div>
        </div>

        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-6 rounded-xl text-center">
          <p className="text-slate-500 dark:text-slate-400 mb-2">Recommended Position Size</p>
          <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400 mb-2">
            {calculateLotSize()} Lots
          </div>
          <p className="text-sm text-slate-500">Risk Amount: ${(balance * (riskPercent / 100)).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}