import React, { useState } from 'react';
import { Home, Briefcase, Plane, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const [active, setActive] = useState('home');
  const wallets = [
    { id: 'home', icon: Home, color: 'text-emerald-400' },
    { id: 'business', icon: Briefcase, color: 'text-blue-400' },
    { id: 'travel', icon: Plane, color: 'text-purple-400' },
  ];

  return (
    <div className="flex flex-col items-center gap-6 py-6 px-3 rounded-2xl bg-slate-800/50 backdrop-blur-xl border border-white/10 shadow-xl">
        {wallets.map((wallet) => (
          <div key={wallet.id} className="relative">
            {active === wallet.id && (
              <motion.div 
                layoutId="active-dot"
                className={`absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-8 bg-current rounded-r-full shadow-[0_0_10px_currentColor] ${wallet.color}`}
              />
            )}
            <button
              onClick={() => setActive(wallet.id)}
              className={`p-3 rounded-xl transition-all duration-300 ${
                active === wallet.id 
                  ? 'bg-white/10 scale-110' 
                  : 'hover:bg-white/5 hover:scale-105 opacity-60 hover:opacity-100'
              }`}
            >
              <wallet.icon size={24} className={active === wallet.id ? wallet.color : 'text-gray-400'} />
            </button>
          </div>
        ))}
        <div className="w-8 h-[1px] bg-white/10 rounded-full" />
        <button className="p-3 rounded-xl hover:bg-emerald-500/20 hover:text-emerald-400 transition-all opacity-60 hover:opacity-100">
          <Plus size={24} />
        </button>
    </div>
  );
};

export default Sidebar; 