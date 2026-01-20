import React from 'react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800 py-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <span className="text-xl font-bold text-white">IRCAMONEY</span>
            <p className="text-gray-500 text-sm mt-1">© {new Date().getFullYear()} All rights reserved.</p>
          </div>
          <div className="flex space-x-6">
            <Link to="/terms" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">Terms of Service</Link>
            <Link to="/privacy" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">Privacy Policy</Link>
            <Link to="/support" className="text-gray-400 hover:text-emerald-400 text-sm transition-colors">Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}