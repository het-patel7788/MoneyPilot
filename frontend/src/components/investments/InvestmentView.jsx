import React, { useState } from 'react';
import { ArrowLeft, PieChart, TrendingUp, Archive, Swords, FileText, Clock, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import InvestmentCard from './InvestmentCard';

const InvestmentView = ({ transactions, walletType }) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active'); 

  // 1. IDENTIFY ACTIVE CHAINS
  const activeInvestments = transactions.filter(t => 
    (t.category === 'Investment' || t.type === 'investment') && t.status !== 'closed'
  );

  const activeRootIds = new Set(activeInvestments.map(t => t.rootId || t._id));

  // 2. FILTER ARCHIVE
  const closedInvestmentsRaw = transactions.filter(t => 
    (t.category === 'Investment' || t.type === 'investment') && t.status === 'closed'
  );

  const closedInvestments = closedInvestmentsRaw.filter(t => {
    const root = t.rootId || t._id;
    return !activeRootIds.has(root);
  });

  // De-duplicate logic
  const uniqueClosed = [];
  const processedRoots = new Set();
  closedInvestments.sort((a, b) => new Date(b.date) - new Date(a.date));
  
  closedInvestments.forEach(t => {
    const root = t.rootId || t._id;
    if (!processedRoots.has(root)) {
        uniqueClosed.push(t);
        processedRoots.add(root);
    }
  });

  const totalInvested = activeInvestments.reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const getBackLink = () => {
    const basePath = walletType === 'home' ? '/' : `/${walletType}`;
    return `${basePath}?view=history`;
  };

  const handleRefresh = () => {
    window.location.reload(); 
  };

  // --- THE PERFECTED ARCHIVE ROW ---
  const ClosedRow = ({ tx, allData }) => {
    const rootId = tx.rootId || tx._id;
    const family = allData.filter(t => t._id === rootId || t.rootId === rootId);

    const sortedFamily = [...family].sort((a, b) => (a._id < b._id ? -1 : 1));
    const rootTx = sortedFamily[0];
    const originalPrincipal = rootTx ? Math.abs(rootTx.amount) : 0;

    const totalReturned = family
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    const profit = totalReturned - originalPrincipal;
    const isProfit = profit >= 0;
    const percent = originalPrincipal > 0 ? ((profit / originalPrincipal) * 100).toFixed(0) : 0;

    return (
      <div className="group bg-slate-900/50 border border-white/5 hover:border-white/10 p-3 sm:p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all">
        
        {/* TOP/LEFT SECTION: Icon & Name & Mobile Actions */}
        <div className="flex items-center justify-between w-full sm:w-auto">
            <div className="flex items-center gap-3 min-w-0 pr-2">
                <div className={`p-2.5 sm:p-3 rounded-full shrink-0 ${isProfit ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                    {isProfit ? <TrendingUp size={16} /> : <TrendingUp size={16} className="rotate-180" />}
                </div>
                <div className="min-w-0">
                    <h4 className="font-bold text-sm sm:text-base text-slate-200 truncate">{rootTx ? rootTx.text : tx.text}</h4>
                    <p className="text-[10px] sm:text-xs text-slate-500 truncate mt-0.5">
                        {new Date(rootTx ? rootTx.date : tx.date).toLocaleDateString()} • Mission Complete
                    </p>
                </div>
            </div>
            
            {/* Mobile-Only Action Buttons */}
            <div className="flex sm:hidden gap-1.5 shrink-0">
                 {rootTx && rootTx.imageUrl && (
                     <a href={rootTx.imageUrl} target="_blank" rel="noreferrer" className="p-1.5 bg-white/5 rounded-lg text-blue-400">
                        <FileText size={14} />
                     </a>
                 )}
                 <button onClick={() => navigate(`/investment/${rootId}`)} className="p-1.5 bg-white/5 rounded-lg text-purple-400">
                    <Clock size={14} />
                </button>
            </div>
        </div>

        {/* BOTTOM/RIGHT SECTION: Performance Math */}
        <div className="w-full sm:w-auto border-t border-white/5 pt-2.5 sm:border-0 sm:pt-0 flex items-center justify-between sm:justify-end gap-4">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold sm:hidden">Return</span>
            
            <div className="flex items-center gap-1.5 sm:gap-2 font-mono text-xs sm:text-sm">
                <span className="text-slate-400 font-bold">${originalPrincipal.toLocaleString()}</span>
                <ArrowRight size={12} className="text-slate-600 sm:w-[14px] sm:h-[14px]" />
                <span className={`font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${totalReturned.toLocaleString()}
                </span>
                <span className={`font-bold ml-1 px-1.5 py-0.5 rounded text-[9px] sm:text-[10px] ${isProfit ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                    {isProfit ? '+' : ''}{percent}%
                </span>
            </div>
        </div>

        {/* Desktop-Only Action Buttons */}
        <div className="hidden sm:flex items-center gap-2 shrink-0">
            {rootTx && rootTx.imageUrl && (
                 <a 
                   href={rootTx.imageUrl} 
                   target="_blank" 
                   rel="noreferrer"
                   className="p-2 bg-white/5 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors"
                   title="View Receipt"
                 >
                    <FileText size={16} />
                 </a>
            )}
            <button 
                onClick={() => navigate(`/investment/${rootId}`)}
                className="p-2 bg-white/5 rounded-lg text-purple-400 hover:bg-purple-500/20 transition-colors" 
                title="View Full Ledger"
            >
                <Clock size={16} />
            </button>
        </div>
      </div>
    );
  };

  return (
    // Note: Removed px-4 here because App.jsx handles global padding. Max-width constraints ensure it stays centered on laptops.
    <div className="w-full max-w-4xl mx-auto pb-24 relative">
      
      {/* HEADER */}
      <div className="flex items-center gap-3 mb-6 sm:mb-8">
        <Link 
          to={getBackLink()} 
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all shrink-0"
        >
          <ArrowLeft size={18} className="sm:w-5 sm:h-5" />
        </Link>
        <div className="min-w-0">
           <h2 className="text-xl sm:text-2xl font-bold text-white truncate">Investment Portfolio</h2>
           <p className="text-slate-400 text-xs sm:text-sm truncate">Active Positions & Tactics</p>
        </div>
      </div>

      {/* --- RESTORED: PREMIUM STATS CARD GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-8">
        {/* Left Side: Capital Deployed */}
        <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 shadow-2xl relative overflow-hidden flex flex-col justify-between">
           <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none"><TrendingUp size={100} /></div>
           
           <div>
               <p className="text-indigo-300 text-xs sm:text-sm font-medium uppercase tracking-wider mb-1">Active Capital Deployed</p>
               <h3 className="text-3xl sm:text-4xl font-bold text-white drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                 ${totalInvested.toLocaleString()}
               </h3>
           </div>
           
           {/* Upgraded Badges (Instead of floating loose text) */}
           <div className="flex gap-3 mt-5 text-[10px] sm:text-xs font-bold uppercase tracking-wider">
               <div className="bg-indigo-500/20 text-indigo-300 px-3 py-1.5 rounded-lg border border-indigo-500/30">
                   {activeInvestments.length} Active
               </div>
               <div className="bg-slate-900/50 text-slate-400 px-3 py-1.5 rounded-lg border border-white/5">
                   {uniqueClosed.length} Closed
               </div>
           </div>
        </div>
        
        {/* Right Side: Pie Chart Placeholder (Desktop Only) */}
        <div className="hidden md:flex p-6 rounded-2xl bg-[#0f172a] border border-white/5 items-center justify-center text-slate-500 border-dashed">
           <div className="text-center">
             <PieChart size={32} className="mx-auto mb-3 opacity-50" />
             <p className="text-sm">Allocation Chart Coming Soon</p>
           </div>
        </div>
      </div>

      {/* --- SCROLLABLE TABS --- */}
      <div className="flex items-center gap-2 sm:gap-4 border-b border-white/10 mb-6 overflow-x-auto no-scrollbar">
        <button 
            onClick={() => setActiveTab('active')}
            className={`pb-3 sm:pb-4 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${activeTab === 'active' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
            <Swords size={14} className="sm:w-4 sm:h-4" /> Active
        </button>

        <button 
            onClick={() => setActiveTab('closed')}
            className={`pb-3 sm:pb-4 px-3 text-xs sm:text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 whitespace-nowrap shrink-0 ${activeTab === 'closed' ? 'text-slate-200 border-b-2 border-slate-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
            <Archive size={14} className="sm:w-4 sm:h-4" /> Closed  
        </button>
      </div>

      {/* LISTS */}
      <div className="space-y-4 sm:space-y-6">
        {/* ACTIVE LIST */}
        {activeTab === 'active' && (
             activeInvestments.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/10 rounded-2xl text-slate-500">
                    <Swords size={24} className="mb-2 opacity-40" />
                    <p className="text-sm">No active investments.</p>
                </div>
              ) : (
                activeInvestments.map(inv => (
                    <InvestmentCard 
                      key={inv._id} 
                      transaction={inv} 
                      onSuccess={handleRefresh}
                      onViewHistory={() => navigate(`/investment/${inv.rootId || inv._id}`)} 
                    />
                ))
              )
        )}

        {/* CLOSED LIST */}
        {activeTab === 'closed' && (
             uniqueClosed.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 border border-dashed border-white/10 rounded-2xl text-slate-500">
                    <Archive size={24} className="mb-2 opacity-40" />
                    <p className="text-sm">No closed investments yet.</p>
                </div>
              ) : (
                <div className="space-y-3 sm:space-y-4">
                    {uniqueClosed.map(inv => (
                        <ClosedRow 
                          key={inv._id} 
                          tx={inv} 
                          allData={transactions} 
                        />
                    ))}
                </div>
              )
        )}
      </div>

    </div>
  );
};

export default InvestmentView;