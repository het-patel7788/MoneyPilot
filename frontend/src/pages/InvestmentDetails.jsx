import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Calendar, FileText, DollarSign, Activity, X, TrendingUp, Wallet } from 'lucide-react';
import ReactDOM from 'react-dom'; 
import useAxios from '../api/axios';

const InvestmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const axios = useAxios();
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState([]);
  const [viewImage, setViewImage] = useState(null);

  const [rootStats, setRootStats] = useState({
    invested: 0,
    returned: 0,
    currentValue: 0,
    netResult: 0,
    isProfit: false
  });

  // --- LOGIC 100% UNTOUCHED ---
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${API_URL}/api/transaction`);
        const allTx = res.data.data;

        // 1. FIND FAMILY
        const clickedTx = allTx.find(t => t._id === id);
        if (!clickedTx) {
            setLoading(false);
            return;
        }
        
        const trueRootId = clickedTx.rootId || clickedTx._id;
        const family = allTx.filter(t => t._id === trueRootId || t.rootId === trueRootId);

        // 2. CALCULATE STATS
        const sortedById = [...family].sort((a, b) => (a._id < b._id ? -1 : 1));
        const rootItem = sortedById[0]; 
        const invested = rootItem ? Math.abs(rootItem.amount) : 0;
        
        const returned = family
          .filter(t => t.type === 'income')
          .reduce((acc, t) => acc + Math.abs(t.amount), 0);

        // We strictly use 'amount' for the active item because you are using the Daisy Chain logic.
        const activeItem = family.find(t => t.status !== 'closed' && (t.type === 'investment' || t.category === 'Investment'));
        const currentVal = activeItem ? Math.abs(activeItem.amount) : 0;
        
        // Total Value Realized = Cash in Pocket + Current Asset Value
        const totalRealized = returned + currentVal;
        const net = totalRealized - invested;

        setRootStats({
          invested,
          returned,
          currentValue: currentVal,
          netResult: net,
          isProfit: net >= 0 
        });

        // 3. BUILD TIMELINE
        const timeline = family.filter(tx => {
            const isRoot = !tx.parentId;
            const isExit = tx.type === 'income';
            const isActive = tx.status !== 'closed' && (tx.type === 'investment' || tx.category === 'Investment');
            return isRoot || isExit || isActive;
        });

        timeline.sort((a, b) => {
            if (a._id > b._id) return -1; 
            if (a._id < b._id) return 1;
            return 0;
        });

        setHistory(timeline);
        setLoading(false);

      } catch (err) {
        console.error("Error fetching investment details", err);
        setLoading(false);
      }
    };

    fetchDetails();
  }, [id, axios]); // Included axios in dependency array to be safe, standard practice

  if (loading) return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <div className="text-white animate-pulse">Loading Ledger...</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-8 animate-fade-in pb-20 relative">
      
      {/* HEADER */}
      <div className="max-w-4xl mx-auto mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group text-sm md:text-base"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>
        
        <div className="flex items-start md:items-center gap-3 md:gap-4">
          <div className="p-3 md:p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400 shrink-0 mt-1 md:mt-0">
            <Activity size={28} className="md:w-8 md:h-8" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold truncate">Investment Ledger</h1>
            <p className="text-slate-500 text-xs md:text-sm mt-1 flex flex-wrap items-center gap-1.5">
               <span>Tracking ID:</span> 
               <span className="font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded truncate max-w-full block sm:inline">{id}</span>
            </p>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-10 md:mb-12">
        
        {/* BOX 1: ORIGINAL PRINCIPAL */}
        <div className="bg-slate-900/50 p-5 md:p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-indigo-500/20 transition-colors flex flex-col justify-center">
           <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest relative z-10">Original Principal</p>
           <p className="text-3xl md:text-4xl font-bold text-white mt-1 md:mt-2 relative z-10">${rootStats.invested.toLocaleString()}</p>
           <div className="absolute -right-4 -bottom-4 md:-right-6 md:-bottom-6 text-slate-800 opacity-20 group-hover:opacity-30 transition-opacity">
               <DollarSign size={80} className="md:w-[100px] md:h-[100px]" />
           </div>
        </div>

        {/* BOX 2: CURRENT STATUS (Responsive Redesign) */}
        <div className={`bg-slate-900/50 p-5 md:p-6 rounded-2xl border relative overflow-hidden group transition-colors flex flex-col justify-center ${rootStats.isProfit ? 'border-emerald-500/20 hover:border-emerald-500/40' : 'border-rose-500/20 hover:border-rose-500/40'}`}>
           
           {/* Top Row: Title & Badge (Fixed overlapping issue) */}
           <div className="flex justify-between items-start mb-4 md:mb-6">
               <p className="text-slate-400 text-[10px] md:text-xs font-bold uppercase tracking-widest mt-1">Current Status</p>
               <div className={`px-2.5 py-1 rounded-lg text-[10px] md:text-xs font-bold border ${rootStats.isProfit ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                  Net: {rootStats.isProfit ? '+' : ''}${rootStats.netResult.toLocaleString()}
               </div>
           </div>
           
           {/* Bottom Row: Cash & Assets (Stacks cleanly on Mobile, Side-by-Side on Desktop) */}
           <div className="flex flex-col sm:flex-row gap-4 sm:gap-0">
              {/* Part A: Cash */}
              <div className="sm:pr-6 border-b sm:border-b-0 sm:border-r border-white/10 pb-4 sm:pb-0">
                 <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Cash Out</p>
                 <p className="text-xl md:text-2xl font-bold text-emerald-400 flex items-center gap-1.5">
                    <TrendingUp size={16} className="md:w-[18px] md:h-[18px]" /> ${rootStats.returned.toLocaleString()}
                 </p>
              </div>

              {/* Part B: Assets */}
              <div className="sm:pl-6">
                 <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Active Assets</p>
                 <p className="text-xl md:text-2xl font-bold text-blue-400 flex items-center gap-1.5">
                    <Wallet size={16} className="md:w-[18px] md:h-[18px]" /> ${rootStats.currentValue.toLocaleString()}
                 </p>
              </div>
           </div>

        </div>
      </div>

      {/* THE TIMELINE */}
      <div className="max-w-3xl mx-auto">
        <h3 className="text-lg md:text-xl font-bold mb-6 md:mb-8 border-b border-white/10 pb-4 flex items-center gap-2">
            <Calendar size={18} className="text-indigo-400 md:w-5 md:h-5" /> Lifecycle Events
        </h3>
        
        <div className="space-y-0 relative border-l-2 border-slate-800 ml-3 md:ml-6 pb-10">
          {history.map((tx, index) => {
            const isExit = tx.type === 'income';
            const isRoot = !tx.parentId;
            const isActive = tx.status !== 'closed' && (tx.type === 'investment' || tx.category === 'Investment');
            
            let borderColor = 'border-slate-800';
            let dotColor = 'bg-slate-800';
            let title = 'Event';
            let amountColor = 'text-slate-500';

            if (isActive) {
               borderColor = 'border-blue-500/30 bg-blue-500/5';
               dotColor = 'bg-blue-500 animate-pulse';
               title = 'CURRENTLY ACTIVE HOLDING';
               amountColor = 'text-blue-400';
            } else if (isExit) {
               if (rootStats.isProfit) {
                   borderColor = 'border-emerald-500/30 bg-emerald-500/5';
                   dotColor = 'bg-emerald-500 shadow-[0_0_15px_#10b981]';
                   title = 'STRATEGY YIELD (PROFIT)';
                   amountColor = 'text-emerald-400';
               } else {
                   borderColor = 'border-rose-500/30 bg-rose-500/5';
                   dotColor = 'bg-rose-500 shadow-[0_0_15px_#f43f5e]';
                   title = 'STRATEGY EXIT (LOSS)';
                   amountColor = 'text-rose-400';
               }
            } else if (isRoot) {
              borderColor = 'border-indigo-500/30 bg-indigo-500/5';
              dotColor = 'bg-indigo-500 shadow-[0_0_15px_#6366f1]';
              title = 'INITIAL ENTRY (PRINCIPAL)';
              amountColor = 'text-indigo-200';
            }

            return (
              <div key={tx._id} className="relative pl-6 md:pl-12 py-4 first:pt-0">
                {/* Timeline Dot */}
                <div className={`absolute -left-[9px] top-6 md:top-8 w-4 h-4 rounded-full border-4 border-[#020617] ${dotColor} z-10 transition-all`} />

                <div className={`p-4 md:p-5 rounded-xl border ${borderColor} transition-all`}>
                   
                   {/* Mobile Responsive Flex Box */}
                   <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 sm:gap-4">
                      <div className="min-w-0">
                         <p className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest mb-1 md:mb-1.5 ${
                             isExit ? (rootStats.isProfit ? 'text-emerald-400' : 'text-rose-400') 
                             : isRoot ? 'text-indigo-400' 
                             : isActive ? 'text-blue-400' 
                             : 'text-slate-500'
                         }`}>
                            {title}
                         </p>
                         <h4 className="text-white font-medium text-base md:text-lg leading-tight break-words">{tx.text}</h4>
                         <div className="flex items-center gap-3 mt-1.5 md:mt-2 text-[10px] md:text-xs text-slate-400 font-mono">
                            <span>{new Date(tx.date || Date.now()).toLocaleDateString()}</span>
                         </div>
                      </div>

                      {/* Amount pushes to bottom on mobile, stays right on desktop */}
                      <div className="text-left sm:text-right shrink-0 mt-2 sm:mt-0 pt-3 sm:pt-0 border-t border-white/5 sm:border-0">
                         <p className={`text-lg md:text-xl font-mono font-bold ${amountColor}`}>
                            {isExit ? '+' : ''}${Math.abs(tx.amount).toLocaleString()}
                         </p>
                      </div>
                   </div>

                   {/* View Receipt Button */}
                   {tx.imageUrl && (
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <button 
                          onClick={() => setViewImage(tx.imageUrl)}
                          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-[#020617] border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all text-xs text-slate-400 font-bold uppercase tracking-wider"
                        >
                           <FileText size={14} /> View Receipt
                        </button>
                      </div>
                   )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- IMAGE POPUP MODAL (PORTAL) --- */}
      {viewImage && ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200"
          onClick={() => setViewImage(null)}
        >
          <button className="absolute top-6 right-6 md:top-8 md:right-8 text-slate-400 hover:text-white transition-colors bg-white/10 p-3 rounded-full hover:bg-white/20 z-50">
            <X size={24} />
          </button>

          <img
            src={viewImage}
            alt="Receipt"
            className="max-w-full max-h-[85vh] rounded-lg shadow-2xl border border-white/10 object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}

    </div>
  );
};

export default InvestmentDetails;