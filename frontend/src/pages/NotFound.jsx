import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-center p-4">
      <h1 className="text-9xl font-bold text-emerald-500 mb-4">404</h1>
      <h2 className="text-2xl font-bold text-white mb-4">Page Not Found</h2>
      <p className="text-slate-400 mb-8">The page you are looking for doesn't exist or has been moved.</p>
      <Link to="/" className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-lg font-bold transition-colors">
        Go Home
      </Link>
    </div>
  );
}