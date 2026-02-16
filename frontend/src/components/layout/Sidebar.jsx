import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom'; // Added useNavigate
import { Home, Briefcase, Plane, Plus, ChevronRight, LayoutDashboard, History, StickyNote, Wallet, Settings, Sparkles, X } from 'lucide-react'; // Added Settings, Sparkles, X
import { motion, AnimatePresence } from 'framer-motion';
import AddWalletModal from '../transactions/AddWalletModal';

const Sidebar = ({ isMobile = false, isOpen = false, onClose = () => {} }) => {
  const location = useLocation();
  const navigate = useNavigate(); // For redirecting after delete
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  // NEW: Track which wallet we are editing
  const [editingWallet, setEditingWallet] = useState(null);

  const iconMap = { Home, Briefcase, Plane, Wallet };

  const defaultWallets = [
    { id: 'home', path: '/', iconName: 'Home', color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Overview', isDefault: true },
    { id: 'business', path: '/business', iconName: 'Briefcase', color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Business', isDefault: true },
    { id: 'travel', path: '/travel', iconName: 'Plane', color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Travel', isDefault: true },
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
  const [expandedWallets, setExpandedWallets] = useState([activeWallet]);

  useEffect(() => { localStorage.setItem('customWallets', JSON.stringify(wallets)); }, [wallets]);

  useEffect(() => {
    setExpandedWallets(prev => {
      if (prev.includes(activeWallet)) return prev;
      return [...prev, activeWallet];
    });
  }, [activeWallet]);

  const toggleExpanded = (e, id) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedWallets(prev =>
      prev.includes(id) ? prev.filter(wId => wId !== id) : [...prev, id]
    );
  };

  // --- CRUD OPERATIONS ---

  const handleAddWallet = (name) => {
    if (wallets.length >= 7) {
      alert("🚫 Limit Reached (Max 7 Wallets).");
      return;
    }
    const newId = name.toLowerCase().replace(/\s+/g, '-');
    if (wallets.some(w => w.id === newId)) return;
    
    setWallets([...wallets, {
      id: newId, path: `/${newId}`, iconName: 'Wallet',
      color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: name.charAt(0).toUpperCase() + name.slice(1),
      isDefault: false // Mark as custom
    }]);
  };

  const handleEditWallet = (id, newName) => {
    const updatedWallets = wallets.map(w => {
      if (w.id === id) {
        return { ...w, label: newName }; // Update Label only
      }
      return w;
    });
    setWallets(updatedWallets);
  };

  const handleDeleteWallet = (id) => {
    const updatedWallets = wallets.filter(w => w.id !== id);
    setWallets(updatedWallets);
    
    // If we are currently on the deleted wallet, go home
    if (activeWallet === id) {
      navigate('/');
    }
  };

  // Open modal in "Edit Mode"
  const openEditModal = (e, wallet) => {
    e.preventDefault();
    e.stopPropagation();
    setEditingWallet(wallet); // Pass data
    setIsModalOpen(true);
  };

  const currentView = new URLSearchParams(location.search).get('view') || 'dashboard';

  const subMenus = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'History', icon: History },
    { id: 'notes', label: 'Notes', icon: StickyNote },
  ];

  // If mobile sidebar and not open, don't render
  if (isMobile && !isOpen) return null;

  const handleLinkClick = () => {
    if (isMobile) {
      onClose(); // Close mobile menu when a link is clicked
    }
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[58] md:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        ${isMobile 
          ? 'fixed top-0 left-0 h-full w-72 z-[60] md:hidden transform transition-transform duration-300 ease-in-out' 
          : 'w-20 h-full relative mt-2'
        }
        ${isMobile && !isOpen ? '-translate-x-full' : 'translate-x-0'}
      `}>
        <div
          onMouseEnter={() => !isMobile && setIsHovered(true)}
          onMouseLeave={() => !isMobile && setIsHovered(false)}
          className={`
            ${isMobile 
              ? 'h-full w-full flex flex-col py-6 px-3 bg-[#0f172a] border-r border-white/10 shadow-2xl overflow-hidden' 
              : 'sticky top-24 ml-2 flex flex-col py-3 px-2 rounded-2xl bg-[#0f172a] border border-white/10 shadow-2xl transition-all duration-300 ease-in-out w-20 hover:w-64 h-fit max-h-[82vh] z-[100] group'
            }
          `}
        >
          {/* Mobile Header */}
          {isMobile && (
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/10 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Sparkles size={18} />
                </div>
                <span className="font-bold text-lg text-slate-100">Wallets</span>
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
          )}
          <div className={`flex-1 flex flex-col gap-1 min-h-0 pb-2 pr-1 ${isMobile ? 'overflow-y-auto overflow-x-hidden custom-scrollbar' : 'overflow-y-auto overflow-x-hidden custom-scrollbar'}`}>
            {wallets.map((wallet) => {
              const isActive = activeWallet === wallet.id;
              const isExpanded = expandedWallets.includes(wallet.id);
              const IconComponent = iconMap[wallet.iconName] || Wallet;
              const activeBg = wallet.bg || 'bg-white/10';
              const showSubMenu = isExpanded && (isMobile || isHovered);

              return (
                <div key={wallet.id} className="flex flex-col flex-shrink-0 w-full">
                  <div className="relative w-full group/item"> {/* Added group/item for inner hover */}
                    {isActive && (
                      <motion.div
                        layoutId="active-dot"
                        className={`absolute -left-2 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r-full shadow-[0_0_10px_currentColor] ${wallet.color} bg-current`}
                      />
                    )}

                    <Link
                      to={wallet.path}
                      onClick={handleLinkClick}
                      className={`flex items-center gap-4 p-2.5 rounded-xl transition-all duration-200 ${isActive ? activeBg : 'hover:bg-white/5 opacity-60 hover:opacity-100'}`}
                    >
                      <div className="min-w-[24px] flex justify-center flex-shrink-0">
                        <IconComponent size={20} className={isActive ? wallet.color : 'text-gray-400'} />
                      </div>

                      <span className={`whitespace-nowrap font-medium text-sm transition-all duration-300 ${isActive ? 'text-white' : 'text-gray-400'} ${isMobile ? 'opacity-100 translate-x-0' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4'}`}>
                        {wallet.label}
                      </span>

                      {/* ACTIONS AREA (Arrow + Edit) */}
                      <div className={`ml-auto flex items-center gap-1 transition-opacity duration-300 ${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                        
                        {/* EDIT BUTTON (Only for custom wallets) */}
                        {!wallet.isDefault && (
                           <div 
                             onClick={(e) => openEditModal(e, wallet)}
                             className="p-1 rounded-md hover:bg-white/20 text-slate-400 hover:text-white cursor-pointer"
                             title="Settings"
                           >
                             <Settings size={14} />
                           </div>
                        )}

                        {/* ARROW BUTTON */}
                        <div onClick={(e) => toggleExpanded(e, wallet.id)} className="p-1 rounded-md hover:bg-white/10 cursor-pointer">
                          <ChevronRight size={16} className={`text-white/50 transition-transform duration-300 flex-shrink-0 ${isExpanded ? 'rotate-90' : ''}`} />
                        </div>
                      </div>
                    </Link>
                  </div>

                  <AnimatePresence>
                    {showSubMenu && (
                      <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden w-full">
                        <div className="flex flex-col mt-1 ml-9 pl-3 border-l border-white/10 space-y-1 pb-1">
                          {subMenus.map((sub) => {
                            const isSubActive = currentView === sub.id;
                            return (
                              <Link 
                                key={sub.id} 
                                to={`${wallet.path}?view=${sub.id}`}
                                onClick={handleLinkClick}
                                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs transition-all duration-200 ${isSubActive ? `${wallet.color} bg-white/5 font-medium` : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'}`}
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

          {/* NEW WALLET BUTTON */}
          <button onClick={() => { setEditingWallet(null); setIsModalOpen(true); }} className="flex-shrink-0 flex items-center gap-4 p-2.5 rounded-xl border border-dashed border-white/10 hover:border-emerald-500/50 hover:bg-emerald-500/10 hover:text-emerald-400 transition-all opacity-60 hover:opacity-100 text-slate-400">
            <div className="min-w-[24px] flex justify-center"><Plus size={20} /></div>
            <span className={`whitespace-nowrap font-medium text-sm transition-all duration-300 ${isMobile ? 'opacity-100 translate-x-0' : 'opacity-0 group-hover:opacity-100 group-hover:translate-x-0 -translate-x-4'}`}>New Wallet</span>
          </button>
        </div>
      </div>

      {/* MODAL CONNECTION */}
      <AddWalletModal 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setEditingWallet(null); }} 
        onAdd={handleAddWallet}
        onEdit={handleEditWallet}   // PASS EDIT FUNCTION
        onDelete={handleDeleteWallet} // PASS DELETE FUNCTION
        editData={editingWallet}    // PASS DATA
      />

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        .group:hover .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.2); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255, 255, 255, 0.4); }
      `}</style>
    </>
  );
};
export default Sidebar;