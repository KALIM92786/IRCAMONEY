import React from 'react';
import { HelpCircle } from 'lucide-react';

export default function FAQ() {
  const faqs = [
    { q: "How does copy trading work?", a: "Copy trading allows you to automatically replicate the trades of experienced traders in real-time. You can set a multiplier to adjust the risk according to your account size." },
    { q: "Is my data secure?", a: "Yes, we use industry-standard encryption for all data transmission and storage. We also support Two-Factor Authentication (2FA) for added security." },
    { q: "Can I use a demo account?", a: "Absolutely! Every user gets a $10,000 demo account to practice trading strategies without risking real money." },
    { q: "What markets can I trade?", a: "We support major forex pairs, commodities like Gold (XAUUSD), and select indices via our integration with RoboForex." }
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-12">
        <HelpCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h1 className="text-4xl font-bold text-white mb-4">Frequently Asked Questions</h1>
        <p className="text-gray-400">Everything you need to know about IRCAMONEY.</p>
      </div>

      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold text-white mb-2">{faq.q}</h3>
            <p className="text-gray-400">{faq.a}</p>
          </div>
        ))}
      </div>
    </div>
  );
}