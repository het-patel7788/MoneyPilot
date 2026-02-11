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

        // --- THE FIX ---
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
  }, [id]);

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
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6 group"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Back to Dashboard
        </button>
        
        <div className="flex items-center gap-4">
          <div className="p-4 bg-indigo-500/10 rounded-2xl border border-indigo-500/20 text-indigo-400">
            <Activity size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Investment Ledger</h1>
            <p className="text-slate-500 text-sm mt-1">Tracking ID: <span className="font-mono text-slate-400 bg-white/5 px-2 py-0.5 rounded">{id}</span></p>
          </div>
        </div>
      </div>

      {/* STATS GRID */}
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        
        {/* BOX 1: ORIGINAL PRINCIPAL */}
        <div className="bg-slate-900/50 p-6 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-indigo-500/20 transition-colors">
           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Original Principal</p>
           <p className="text-4xl font-bold text-white mt-2">${rootStats.invested.toLocaleString()}</p>
           <div className="absolute -right-6 -bottom-6 text-slate-800 opacity-20 group-hover:opacity-30 transition-opacity"><DollarSign size={100} /></div>
        </div>

        {/* BOX 2: CURRENT STATUS */}
        <div className={`bg-slate-900/50 p-6 rounded-2xl border relative overflow-hidden group transition-colors ${rootStats.isProfit ? 'border-emerald-500/20 hover:border-emerald-500/40' : 'border-rose-500/20 hover:border-rose-500/40'}`}>
           <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Current Status</p>
           
           <div className="flex items-center">
              {/* Part A: Cash */}
              <div className="pr-6 border-r border-white/10">
                 <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Cash Out</p>
                 <p className="text-2xl font-bold text-emerald-400 flex items-center gap-1">
                    <TrendingUp size={18} /> ${rootStats.returned.toLocaleString()}
                 </p>
              </div>

              {/* Part B: Assets */}
              <div className="pl-6">
                 <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">Active Assets</p>
                 <p className="text-2xl font-bold text-blue-400 flex items-center gap-1">
                    <Wallet size={18} /> ${rootStats.currentValue.toLocaleString()}
                 </p>
              </div>
           </div>

           {/* Net Result Badge */}
           <div className={`absolute top-6 right-6 px-3 py-1 rounded-lg text-xs font-bold border ${rootStats.isProfit ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
              Net: {rootStats.isProfit ? '+' : ''}${rootStats.netResult.toLocaleString()}
           </div>
        </div>
      </div>

      {/* THE TIMELINE */}
      <div className="max-w-3xl mx-auto">
        <h3 className="text-xl font-bold mb-8 border-b border-white/10 pb-4 flex items-center gap-2">
            <Calendar size={20} className="text-indigo-400" /> Lifecycle Events
        </h3>
        
        <div className="space-y-0 relative border-l-2 border-slate-800 ml-4 md:ml-6 pb-10">
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
              <div key={tx._id} className="relative pl-8 md:pl-12 py-4 first:pt-0">
                <div className={`absolute -left-[9px] top-6 w-4 h-4 rounded-full border-4 border-[#020617] ${dotColor} z-10 transition-all`} />

                <div className={`p-5 rounded-xl border ${borderColor} transition-all`}>
                   <div className="flex justify-between items-start gap-4">
                      <div>
                         <p className={`text-[10px] font-bold uppercase tracking-widest mb-1 ${
                             isExit ? (rootStats.isProfit ? 'text-emerald-400' : 'text-rose-400') 
                             : isRoot ? 'text-indigo-400' 
                             : isActive ? 'text-blue-400' 
                             : 'text-slate-500'
                         }`}>
                            {title}
                         </p>
                         <h4 className="text-white font-medium text-lg leading-tight">{tx.text}</h4>
                         <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 font-mono">
                            <span>{new Date(tx.date || Date.now()).toLocaleDateString()}</span>
                         </div>
                      </div>

                      <div className="text-right shrink-0">
                         <p className={`text-xl font-mono font-bold ${amountColor}`}>
                            {isExit ? '+' : ''}${Math.abs(tx.amount).toLocaleString()}
                         </p>
                      </div>
                   </div>

                   {tx.imageUrl && (
                      <div className="mt-4 pt-4 border-t border-white/5">
                        <button 
                          onClick={() => setViewImage(tx.imageUrl)}
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#020617] border border-white/10 hover:border-indigo-500/50 hover:bg-indigo-500/10 hover:text-indigo-400 transition-all text-xs text-slate-400 font-bold uppercase tracking-wider"
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
          className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-200"
          onClick={() => setViewImage(null)}
        >
          <button className="absolute top-8 right-8 text-slate-400 hover:text-white transition-colors bg-white/10 p-3 rounded-full hover:bg-white/20 z-50">
            <X size={24} />
          </button>

          <img
            src={viewImage}
            alt="Receipt"
            className="max-w-full max-h-full rounded-lg shadow-2xl border border-white/10 object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}

    </div>
  );
};

export default InvestmentDetails;