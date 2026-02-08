import React from 'react';
import { X, ArrowDown, FileText, TrendingUp, DollarSign, Clock } from 'lucide-react';

const InvestmentTimelineModal = ({ isOpen, onClose, rootId, allTransactions }) => {
  if (!isOpen || !rootId) return null;

  // 1. FIND THE FAMILY
  // We want the Original Parent (id === rootId) AND all children (rootId === rootId)
  const history = allTransactions.filter(t => 
    t._id === rootId || t.rootId === rootId
  ).sort((a, b) => new Date(a.date) - new Date(b.date)); // Sort Oldest to Newest

  // 2. CALCULATE TOTALS
  const totalInvested = history
    .filter(t => t.type === 'investment' || t.category === 'Investment')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const totalReturned = history
    .filter(t => t.type === 'income')
    .reduce((acc, t) => acc + Math.abs(t.amount), 0);
  
  const currentHolding = history.find(t => t.status !== 'closed' && (t.type === 'investment' || t.category === 'Investment'));
  const currentValue = currentHolding ? Math.abs(currentHolding.amount) : 0;

  const netResult = (totalReturned + currentValue) - totalInvested;
  const isOverallProfit = netResult >= 0;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-[#0f172a] w-full max-w-lg rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* HEADER */}
        <div className="p-6 border-b border-white/5 flex justify-between items-start bg-slate-900/50">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Clock size={20} className="text-indigo-400" /> Investment Lifecycle
            </h3>
            <p className="text-slate-400 text-xs mt-1">Tracking ID: <span className="font-mono text-slate-500">{rootId.slice(-6)}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        {/* SUMMARY CARD */}
        <div className="p-4 grid grid-cols-3 gap-2 bg-slate-800/30 border-b border-white/5">
            <div className="text-center p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                <p className="text-[10px] text-indigo-300 uppercase">Invested</p>
                <p className="font-bold text-indigo-100">${totalInvested.toLocaleString()}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-[10px] text-emerald-300 uppercase">Returned</p>
                <p className="font-bold text-emerald-100">${totalReturned.toLocaleString()}</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-slate-700/30 border border-white/5">
                <p className="text-[10px] text-slate-400 uppercase">Net Result</p>
                <p className={`font-bold ${isOverallProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isOverallProfit ? '+' : ''}${netResult.toLocaleString()}
                </p>
            </div>
        </div>

        {/* TIMELINE LIST */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {history.map((tx, index) => {
            const isBuy = tx.type === 'investment' || tx.category === 'Investment';
            const isProfit = tx.type === 'income';
            const isLast = index === history.length - 1;

            return (
              <div key={tx._id} className="relative pl-8 border-l-2 border-white/10 last:border-0">
                {/* The Dot */}
                <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 
                  ${isBuy ? 'bg-indigo-500 border-indigo-900' : 
                    isProfit ? 'bg-emerald-500 border-emerald-900' : 'bg-slate-500 border-slate-900'} 
                  shadow-[0_0_10px_rgba(0,0,0,0.5)] z-10`} 
                />

                {/* The Content */}
                <div className="relative -top-1.5 mb-2">
                  <div className="flex justify-between items-start">
                    <div>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-0.5 
                           ${isBuy ? 'text-indigo-400' : isProfit ? 'text-emerald-400' : 'text-slate-400'}`}>
                           {isBuy ? (index === 0 ? 'Initial Entry' : 'Rollover / Hold') : 'Strategy Exit'}
                        </p>
                        <h4 className="text-white text-sm font-medium">{tx.text}</h4>
                        <p className="text-xs text-slate-500 mt-1">{new Date(tx.date).toLocaleDateString()}</p>
                    </div>
                    
                    <div className="text-right">
                        <span className={`font-mono font-bold ${isBuy ? 'text-white' : 'text-emerald-400'}`}>
                            {isBuy ? '' : '+'}${Math.abs(tx.amount).toLocaleString()}
                        </span>
                    </div>
                  </div>

                  {/* RECEIPT BUTTON */}
                  {tx.imageUrl && (
                    <div className="mt-3">
                        <a 
                          href={tx.imageUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-xs text-blue-300"
                        >
                            <FileText size={12} /> View Proof
                        </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

export default InvestmentTimelineModal;