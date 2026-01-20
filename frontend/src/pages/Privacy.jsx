import React from 'react';

export default function Privacy() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl text-gray-300">
      <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
      <div className="space-y-6">
        <p>Your privacy is important to us. It is IRCAMONEY's policy to respect your privacy regarding any information we may collect from you across our website.</p>
        <h2 className="text-2xl font-bold text-white mt-8 mb-4">1. Information We Collect</h2>
        <p>We only ask for personal information when we truly need it to provide a service to you. We collect it by fair and lawful means, with your knowledge and consent. We also let you know why we’re collecting it and how it will be used.</p>
        <h2 className="text-2xl font-bold text-white mt-8 mb-4">2. Data Retention</h2>
        <p>We only retain collected information for as long as necessary to provide you with your requested service. What data we store, we’ll protect within commercially acceptable means to prevent loss and theft, as well as unauthorized access, disclosure, copying, use or modification.</p>
      </div>
    </div>
  );
}