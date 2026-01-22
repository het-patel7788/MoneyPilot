import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Briefcase, Plane, Plus, ChevronRight, LayoutDashboard, History, StickyNote, Wallet } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';  //for animation
import AddWalletModal from '../transactions/AddWalletModal';

const Sidebar = () => {
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(false);  //open the popup
  const [isHovered, setIsHovered] = useState(false);  //hover the sidebar

  const iconMap = { Home, Briefcase, Plane, Wallet };

  const defaultWallets = [
    { id: 'home', path: '/', iconName: 'Home', color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Overview' },
    { id: 'business', path: '/business', iconName: 'Briefcase', color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Business' },
    { id: 'travel', path: '/travel', iconName: 'Plane', color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Travel' },
  ];

  const [wallets, setWallets] = useState(() => {
    try {
      const saved = localStorage.getItem('customWallets');
      const parsed = saved ? JSON.parse(saved) : defaultWallets;
      return parsed[0]?.iconName ? parsed : defaultWallets;
    } catch { return defaultWallets; }
  });

  const getActiveWallet = (path) => {
    if (path === '/') return 'home';
    return path.split('/')[1] || 'home';
  };

  const activeWallet = getActiveWallet(location.pathname);

  // STATE: Track which wallets are explicitly expanded.
  const [expandedWallets, setExpandedWallets] = useState([activeWallet]);

  useEffect(() => { localStorage.setItem('customWallets', JSON.stringify(wallets)); }, [wallets]);

  // EFFECT: When navigating to a new wallet, ensure it opens.
  useEffect(() => {
    setExpandedWallets(prev => {
      if (prev.includes(activeWallet)) return prev;
      return [...prev, activeWallet];
    });
  }, [activeWallet]);

  // TOGGLE: Manual expansion control via Arrow
  const toggleExpanded = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedWallets(prev =>
      prev.includes(id)
        ? prev.filter(wId => wId !== id)
        : [...prev, id]
    );
  };

  const handleAddWallet = (name) => {
    if (wallets.length >= 7) {
      alert("🚫 Free Limit Reached!\n\nYou have 7 wallets. Upgrade to Premium.");
      return;
    }
    const newId = name.toLowerCase().replace(/\s+/g, '-');
    if (wallets.some(w => w.id === newId)) return;
    setWallets([...wallets, {
      id: newId, path: `/${newId}`, iconName: 'Wallet',
      color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: name.charAt(0).toUpperCase() + name.slice(1)
    }]);
  };

  const currentView = new URLSearchParams(location.search).get('view') || 'dashboard';

  const subMenus = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'History', icon: History },
    { id: 'notes', label: 'Notes', icon: StickyNote },
  ];

  return (
    <>
      <div className="w-20 h-full relative">
        <div
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          className="sticky top-24 left-0 flex flex-col py-3 px-2 rounded-2xl bg-[#0f172a] border border-white/10 shadow-2xl transition-all duration-300 ease-in-out w-20 hover:w-64 h-fit max-h-[82vh] z-[100] group"
        >
          <div className="flex-1 flex flex-col gap-1 overflow-y-auto overflow-x-hidden min-h-0 pb-2 custom-scrollbar pr-1">
            {wallets.map((wallet) => {
              const isActive = activeWallet === wallet.id;
              const isExpanded = expandedWallets.includes(wallet.id);
              const IconComponent = iconMap[wallet.iconName] || Wallet;
              const activeBg = wallet.bg || 'bg-white/10';

              const showSubMenu = isExpanded && isHovered;

              return (
                <div key={wallet.id} className="flex flex-col flex-shrink-0 w-full">
                  <div className="relative w-full">
                    {isActive && (
                      <motion.div
                        layoutId="active-dot"
                        className={`absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full shadow-[0_0_10px_currentColor] ${wallet.color} bg-current`}
                      />
                    )}

                    <Link
                      to={wallet.path}
                      className={`flex items-center gap-4 p-2.5 rounded-xl transition-all duration-200 ${isActive ? activeBg : 'hover:bg-white/5 opacity-60 hover:opacity-100'
                        }`}
                    >
                      <div className="min-w-[24px] flex justify-center flex-shrink-0">
                        <IconComponent size={20} className={isActive ? wallet.color : 'text-gray-400'} />
                      </div>

                      <span className={`whitespace-nowrap font-medium text-sm transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-400'
                        } opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4`}
                      >
                        {wallet.label}
                      </span>

                      {/* ARROW BUTTON: Controls expansion manually */}
                      <div
                        onClick={(e) => toggleExpanded(e, wallet.id)}
                        className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer p-1 rounded-md hover:bg-white/10"
                      >
                        <ChevronRight
                          size={16}
                          className={`text-white/50 transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`}
                        />
                      </div>
                    </Link>
                  </div>

                  <AnimatePresence>
                    {showSubMenu && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden w-full"
                      >
                        <div className="flex flex-col mt-1 ml-9 pl-3 border-l border-white/10 space-y-1 pb-1">
                          {subMenus.map((sub) => {
                            const isSubActive = currentView === sub.id;
                            return (
                              <Link
                                key={sub.id}
                                to={`${wallet.path}?view=${sub.id}`}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all duration-200 ${isSubActive
                                  ? `${wallet.color} bg-white/5 font-medium`
                                  : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                  }`}
                              >
                                <sub.icon size={14} />
                                <span className="whitespace-nowrap">{sub.label}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <div className="w-full h-[1px] bg-white/10 my-1 opacity-50 flex-shrink-0 mb-3" />

          <button
            onClick={() => setIsModalOpen(true)}
            className="flex-shrink-0 flex items-center gap-4 p-2.5 rounded-xl border border-dashed border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all opacity-60 hover:opacity-100 text-slate-400"
          >
            <div className="min-w-[24px] flex justify-center">
              <Plus size={20} />
            </div>
            <span className="whitespace-nowrap font-medium text-sm opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4 transition-all duration-300">
              New Wallet
            </span>
          </button>
        </div>
      </div>

      <AddWalletModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddWallet}
      />

      {/* SCROLLBAR THICKNESS UPDATE: 
          Changed from 3px to 5px for better grip. 
      */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 0px; 
        }
        .group:hover .custom-scrollbar::-webkit-scrollbar {
          width: 5px; /* Increased to 5px to make it easier to catch */
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent; 
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </>
  );
};

export default Sidebar;