import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

export default function PublicLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <Navbar publicMode={true} />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
    </div>
  );
}