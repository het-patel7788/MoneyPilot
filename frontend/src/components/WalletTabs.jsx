import React from 'react';
import { LayoutDashboard, History, StickyNote } from 'lucide-react';

const WalletTabs = ({ activeTab, onTabChange, color }) => {
  
  // Configuration for the 3 tabs
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'history', label: 'History', icon: History },
    { id: 'notes', label: 'Notes', icon: StickyNote },
  ];

  // Helper to get the right color class based on the wallet (passed as prop)
  const getColorClass = () => {
    if (color.includes('blue')) return 'bg-blue-500 shadow-blue-500/50';
    if (color.includes('purple')) return 'bg-purple-500 shadow-purple-500/50';
    return 'bg-emerald-500 shadow-emerald-500/50'; // Default/Home
  };

  return (
    <div className="flex p-1 bg-slate-800/50 rounded-xl border border-white/10 w-fit mb-8 backdrop-blur-sm">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              relative flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300
              ${isActive ? 'text-white' : 'text-slate-400 hover:text-white'}
            `}
          >
            {/* The Active Background "Pill" Animation */}
            {isActive && (
              <div className={`absolute inset-0 rounded-lg opacity-20 ${getColorClass()}`} />
            )}
            
            <tab.icon size={18} className={isActive ? 'relative z-10' : ''} />
            <span className={isActive ? 'relative z-10' : ''}>{tab.label}</span>
            
            {/* Bottom Glow Line for Active Tab */}
            {isActive && (
              <div className={`absolute bottom-0 left-2 right-2 h-[2px] rounded-full ${getColorClass().replace('opacity-20', '')}`} />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default WalletTabs;