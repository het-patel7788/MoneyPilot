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
  // Only show closed investments if their Root ID is NOT in the active list.
  const closedInvestmentsRaw = transactions.filter(t => 
    (t.category === 'Investment' || t.type === 'investment') && t.status === 'closed'
  );

  const closedInvestments = closedInvestmentsRaw.filter(t => {
    const root = t.rootId || t._id;
    return !activeRootIds.has(root);
  });

  // De-duplicate: If multiple closed items exist for one chain, just pick one to represent the row
  const uniqueClosed = [];
  const processedRoots = new Set();
  // Sort newest first
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

  // --- SMART ARCHIVE ROW (CALCULATES FULL LIFECYCLE) ---
  const ClosedRow = ({ tx, allData }) => {
    // 1. Find the entire family history for this closed item
    const rootId = tx.rootId || tx._id;
    const family = allData.filter(t => t._id === rootId || t.rootId === rootId);

    // 2. Find Principal (Oldest Item)
    // Sort by ID to find the true first record
    const sortedFamily = [...family].sort((a, b) => (a._id < b._id ? -1 : 1));
    const rootTx = sortedFamily[0];
    const originalPrincipal = rootTx ? Math.abs(rootTx.amount) : 0;

    // 3. Calculate Total Cash Returned (Sum of all 'income')
    const totalReturned = family
      .filter(t => t.type === 'income')
      .reduce((acc, t) => acc + Math.abs(t.amount), 0);

    // 4. Math
    const profit = totalReturned - originalPrincipal;
    const isProfit = profit >= 0;
    const percent = originalPrincipal > 0 ? ((profit / originalPrincipal) * 100).toFixed(0) : 0;

    return (
      <div className="group bg-slate-900/50 border border-white/5 hover:border-white/10 p-4 rounded-xl flex items-center justify-between transition-all">
        <div className="flex items-center gap-4">
            <div className={`p-3 rounded-full ${isProfit ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                {isProfit ? <TrendingUp size={18} /> : <TrendingUp size={18} className="rotate-180" />}
            </div>
            <div>
                {/* Show the Root Text (e.g., "Apple Stock") instead of the rollover text */}
                <h4 className="font-bold text-slate-200">{rootTx ? rootTx.text : tx.text}</h4>
                <p className="text-xs text-slate-500">
                    {new Date(rootTx ? rootTx.date : tx.date).toLocaleDateString()} • Mission Complete
                </p>
            </div>
        </div>

        {/* THE TOTAL PERFORMANCE DISPLAY */}
        <div className="text-right hidden sm:block">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mb-1">Total Performance</p>
            <div className="flex items-center justify-end gap-2 font-mono">
                <span className="text-slate-400 font-bold">${originalPrincipal}</span>
                <ArrowRight size={14} className="text-slate-600" />
                <span className={`font-bold text-lg ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    ${totalReturned}
                </span>
            </div>
            <p className={`text-xs ${isProfit ? 'text-emerald-500/70' : 'text-rose-500/70'} font-bold`}>
                {isProfit ? '+' : ''}{percent}% Return
            </p>
        </div>

        <div className="flex items-center gap-2">
            {rootTx && rootTx.imageUrl && (
                 <a 
                   href={rootTx.imageUrl} 
                   target="_blank" 
                   rel="noreferrer"
                   className="p-2 bg-white/5 rounded-lg text-blue-400 hover:bg-blue-500/20 transition-colors"
                   title="View Original Buy Receipt"
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
    <div className="w-full max-w-4xl mx-auto pb-20 relative">
      
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <Link 
          to={getBackLink()} 
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
           <h2 className="text-2xl font-bold text-white">Investment Portfolio</h2>
           <p className="text-slate-400 text-sm">Active Positions & Tactics</p>
        </div>
      </div>

      {/* STATS CARD */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-20"><TrendingUp size={100} /></div>
           <p className="text-indigo-300 text-sm font-medium uppercase tracking-wider mb-1">Active Capital Deployed</p>
           <h3 className="text-4xl font-bold text-white drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
             ${totalInvested.toLocaleString()}
           </h3>
        </div>
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-white/5 flex items-center justify-center text-slate-500 border-dashed">
           <div className="text-center">
             <PieChart size={32} className="mx-auto mb-2 opacity-50" />
             <p className="text-sm">Allocation Chart Coming Soon</p>
           </div>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-4 border-b border-white/10 mb-6">
        <button 
            onClick={() => setActiveTab('active')}
            className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'active' ? 'text-indigo-400 border-b-2 border-indigo-400' : 'text-slate-500 hover:text-slate-300'}`}
        >
            <Swords size={16} /> Active Battles ({activeInvestments.length})
        </button>

        <button 
            onClick={() => setActiveTab('closed')}
            className={`pb-4 px-2 text-sm font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${activeTab === 'closed' ? 'text-slate-200 border-b-2 border-slate-500' : 'text-slate-500 hover:text-slate-300'}`}
        >
            <Archive size={16} /> War Archive ({uniqueClosed.length})
        </button>
      </div>

      {/* LISTS */}
      <div className="space-y-6">
        {/* ACTIVE LIST */}
        {activeTab === 'active' && (
             activeInvestments.length === 0 ? (
                <div className="text-center py-20 opacity-50 border border-dashed border-white/10 rounded-2xl">
                    <p>No active investments.</p>
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
                <div className="text-center py-20 opacity-50 border border-dashed border-white/10 rounded-2xl">
                    <p>No closed investments yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                    {uniqueClosed.map(inv => (
                        <ClosedRow 
                          key={inv._id} 
                          tx={inv} 
                          allData={transactions} // <--- PASS ALL DATA FOR CALCULATIONS
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