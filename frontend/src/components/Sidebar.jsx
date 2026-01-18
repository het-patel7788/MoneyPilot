import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, Plane, Plus, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

const Sidebar = () => {
  const location = useLocation();

  const getActivePath = (path) => {
    if (path.includes('/business')) return 'business';
    if (path.includes('/travel')) return 'travel';
    return 'home';
  };

  const active = getActivePath(location.pathname);

  const wallets = [
    { id: 'home', path: '/', icon: Home, color: 'text-emerald-400', label: 'All wallets' },
    { id: 'business', path: '/business', icon: Briefcase, color: 'text-blue-400', label: 'Business' },
    { id: 'travel', path: '/travel', icon: Plane, color: 'text-purple-400', label: 'Travel' },
  ];

  return (
    <div className="relative w-20 h-full min-h-[300px]">
      <div className="absolute top-0 left-0 flex flex-col gap-4 py-6 px-3 rounded-2xl bg-[#0f172a] border border-white/10 shadow-2xl transition-all duration-300 ease-in-out w-20 hover:w-64 h-fit max-h-[80vh] z-[100] overflow-hidden group">
          
          {wallets.map((wallet) => (
            <div key={wallet.id} className="relative">
              {active === wallet.id && (
                <motion.div 
                  layoutId="active-dot"
                  className={`absolute -left-3 top-1/2 -translate-y-1/2 w-1.5 h-8 rounded-r-full shadow-[0_0_10px_currentColor] ${wallet.color} bg-current`}
                />
              )}

              <Link
                to={wallet.path}
                className={`flex items-center gap-4 p-3 rounded-xl transition-all duration-200 ${
                  active === wallet.id 
                    ? 'bg-white/10' 
                    : 'hover:bg-white/5 opacity-60 hover:opacity-100'
                }`}
              >
                <div className="min-w-[24px] flex justify-center">
                  <wallet.icon size={24} className={active === wallet.id ? wallet.color : 'text-gray-400'} />
                </div>

                <span className={`whitespace-nowrap font-medium text-sm transition-all duration-300 ${
                    active === wallet.id ? 'text-white' : 'text-gray-400'
                  } 
                  opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4`}
                >
                  {wallet.label}
                </span>

                {active === wallet.id && (
                    <ChevronRight size={16} className="ml-auto text-white/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                )}
              </Link>
            </div>
          ))}

          <div className="w-full h-[1px] bg-white/10 my-2 opacity-50" />
          
          <button className="flex items-center gap-4 p-3 rounded-xl hover:bg-emerald-500/20 hover:text-emerald-400 transition-all opacity-60 hover:opacity-100">
            <div className="min-w-[24px] flex justify-center">
              <Plus size={24} />
            </div>
            <span className="whitespace-nowrap font-medium text-sm text-gray-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-300">
              New Wallet
            </span>
          </button>
      </div>
    </div>
  );
};

export default Sidebar;