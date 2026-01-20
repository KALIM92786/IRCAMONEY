import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Clock } from 'lucide-react';

export default function NewsFeed() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate fetching news
    setTimeout(() => {
      setNews([
        {
          id: 1,
          title: 'Gold Prices Surge Amidst Global Uncertainty',
          summary: 'XAUUSD breaks key resistance level as investors flock to safe-haven assets.',
          source: 'Financial Times',
          url: '#',
          time: '10 mins ago',
          sentiment: 'bullish'
        },
        {
          id: 2,
          title: 'Fed Signals Potential Rate Cut in Q3',
          summary: 'Federal Reserve officials hint at monetary easing if inflation data continues to improve.',
          source: 'Bloomberg',
          url: '#',
          time: '1 hour ago',
          sentiment: 'neutral'
        },
        {
          id: 3,
          title: 'Euro Weakens Against Dollar Following ECB Statement',
          summary: 'EURUSD drops 50 pips after ECB president comments on economic outlook.',
          source: 'Reuters',
          url: '#',
          time: '2 hours ago',
          sentiment: 'bearish'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  if (loading) return <div className="p-8 text-center text-gray-400">Loading News...</div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center space-x-3 mb-8">
        <Newspaper className="h-8 w-8 text-blue-500" />
        <h1 className="text-3xl font-bold text-white">Market News</h1>
      </div>

      <div className="space-y-4">
        {news.map(item => (
          <div key={item.id} className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <h2 className="text-xl font-bold text-white hover:text-emerald-400 transition-colors cursor-pointer">{item.title}</h2>
              <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${item.sentiment === 'bullish' ? 'bg-emerald-500/20 text-emerald-400' : item.sentiment === 'bearish' ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-400'}`}>{item.sentiment}</span>
            </div>
            <p className="text-gray-400 mb-4">{item.summary}</p>
            <div className="flex items-center justify-between text-sm text-gray-500">
              <div className="flex items-center gap-4">
                <span className="font-medium text-gray-400">{item.source}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {item.time}</span>
              </div>
              <a href={item.url} className="flex items-center gap-1 text-blue-400 hover:text-blue-300">Read more <ExternalLink className="w-3 h-3" /></a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}