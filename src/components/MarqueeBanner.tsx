import React from 'react';
import { MARQUEE_QUOTES } from '../data/initialData';

export const MarqueeBanner: React.FC = () => {
  const repeatedQuotes = [...MARQUEE_QUOTES, ...MARQUEE_QUOTES];

  return (
    <div className="relative w-full bg-gradient-to-r from-purple-950 via-[#16213e] to-purple-950 border-b border-purple-800/40 py-2 overflow-hidden select-none z-30 shadow-md">
      <div className="animate-marquee items-center gap-8 text-xs font-bold tracking-widest uppercase">
        {repeatedQuotes.map((quote, idx) => (
          <div key={idx} className="flex items-center gap-6 whitespace-nowrap">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-pink-400 to-purple-300 font-extrabold hover:text-white transition-colors">
              {quote}
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#e94560] shadow-[0_0_8px_#e94560]" />
          </div>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-[#0f0f1a] to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-[#0f0f1a] to-transparent z-10" />
    </div>
  );
};
