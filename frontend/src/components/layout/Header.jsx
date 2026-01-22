import React from 'react';
import { Sparkles } from 'lucide-react';

const Header = () => {
  return (
    // FIXED POSITON: Glued to top, full width, highest z-index
    <header className="fixed top-0 left-0 w-full z-50 bg-slate-900/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
      
      {/* 1. LEFT: Logo */}
      <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
          <Sparkles size={18} />
        </div>
        <span className="font-bold text-lg tracking-wide text-slate-100">
          MoneyPilot
        </span>
      </div>

      {/* 2. MIDDLE: Spacer */}
      <div className="flex-1"></div>

      {/* 3. RIGHT: Login & Sign Up */}
      <div className="flex items-center gap-4">
        <button className="px-5 py-2 rounded-full border border-emerald-500/50 text-emerald-400 text-sm font-medium hover:bg-emerald-500 hover:text-slate-900 hover:border-emerald-500 transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
          Login
        </button>

        <button className="px-5 py-2 rounded-full border border-emerald-500/50 text-emerald-400 text-sm font-medium hover:bg-emerald-500 hover:text-slate-900 hover:border-emerald-500 transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]">
          Sign Up
        </button>
      </div>

    </header>
  );
};

export default Header;