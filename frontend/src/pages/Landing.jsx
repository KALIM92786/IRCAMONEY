import React from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, Shield, Zap, ArrowRight } from 'lucide-react';

export default function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <nav className="max-w-7xl mx-auto w-full px-6 py-6 flex justify-between items-center">
        <div className="text-2xl font-bold text-emerald-500">IRCAMONEY</div>
        <div className="space-x-4">
          <Link to="/login" className="text-slate-300 hover:text-white font-medium">Login</Link>
          <Link to="/register" className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-lg font-medium transition-colors">Get Started</Link>
        </div>
      </nav>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-emerald-400 to-cyan-500 bg-clip-text text-transparent">
          Master Your Trading
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mb-10">
          Real-time portfolio mirroring, advanced analytics, and automated copy trading powered by the RoboForex API.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 mb-20">
          <Link to="/register" className="flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 px-8 py-4 rounded-xl text-lg font-bold transition-all hover:scale-105">
            Start Trading Now <ArrowRight size={20} />
          </Link>
          <Link to="/login" className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 px-8 py-4 rounded-xl text-lg font-bold transition-all">
            View Demo
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl w-full text-left">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
            <div className="bg-emerald-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              <Zap className="text-emerald-500" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Real-Time Sync</h3>
            <p className="text-slate-400">
              Instant data synchronization with RoboForex. Watch your equity, balance, and margin update in milliseconds.
            </p>
          </div>

          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
            <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              <TrendingUp className="text-blue-500" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Advanced Analytics</h3>
            <p className="text-slate-400">
              Visualize your performance with interactive equity curves, profit distribution charts, and detailed trade history.
            </p>
          </div>

          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-800">
            <div className="bg-purple-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-6">
              <Shield className="text-purple-500" size={24} />
            </div>
            <h3 className="text-xl font-bold mb-3">Secure & Reliable</h3>
            <p className="text-slate-400">
              Enterprise-grade security with JWT authentication, encrypted credentials, and automated risk management.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-800 py-8 text-center text-slate-500">
        <p>&copy; {new Date().getFullYear()} IRCAMONEY. All rights reserved.</p>
      </footer>
    </div>
  );
}