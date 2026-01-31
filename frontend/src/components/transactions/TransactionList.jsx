import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Trash2, Pencil, RefreshCw, Zap, Link as LinkIcon } from 'lucide-react';

const TransactionList = ({ transactions, onDelete, onEdit }) => {
  const displayTransactions = transactions.filter(tx => tx.type !== 'investment');

  const handleTraceOrigin = (rootId) => {
    if (!rootId) return;
    const element = document.getElementById(`tx-${rootId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('bg-slate-700');
      setTimeout(() => element.classList.remove('bg-slate-700'), 1500);
    } else {
      alert("Original transfer record not found in this list.\n\n(This is normal for 'Outside Money' investments, as they don't create a transfer log.)");
    }
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {displayTransactions.length === 0 ? (
        <div className="text-center p-8 rounded-xl border border-white/5 border-dashed">
          <p className="text-slate-500 text-sm">No recent activity.</p>
        </div>
      ) : (
        displayTransactions.map((tx) => {
          const isTransfer = tx.category === 'Transfer';
          const isTrade = tx.category === 'Trade';
          const isPositive = tx.amount >= 0;
          const isLoss = tx.text.includes('Strategy Loss');

          const domId = isTransfer ? `tx-${tx.rootId || tx.parentId || tx._id}` : undefined;

          // 1. BACKGROUND STYLES
          let bgClass = "bg-slate-800/40 border-white/5 hover:border-white/10";
          if (isTransfer) bgClass = "bg-slate-800/20 border-white/5 opacity-75 transition-colors duration-500"; 
          if (isTrade) {
             bgClass = isLoss 
               // FIX: /30 Opacity - The "Goldilocks" Middle Ground
               ? "bg-gradient-to-r from-rose-900/30 to-purple-900/30 border-rose-500/20 cursor-pointer hover:border-rose-500/40" 
               : "bg-gradient-to-r from-emerald-900/40 to-indigo-900/40 border-indigo-500/30 cursor-pointer hover:border-indigo-500/60"; 
          }

          // 2. ICON STYLES
          let iconClass = isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400";
          if (isTransfer) iconClass = "bg-slate-700/30 text-slate-500";
          if (isTrade) {
              iconClass = isLoss ? "bg-rose-500/15 text-rose-400" : "bg-indigo-500/20 text-indigo-400";
          }

          // 3. TEXT STYLES
          let textClass = isPositive ? "text-emerald-400" : "text-red-400";
          if (isTransfer) textClass = "text-slate-500";
          if (isTrade) {
              textClass = isLoss 
                ? "text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-purple-400 font-bold"
                : "text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400 font-bold";
          }

          // 4. BADGE STYLES
          const badgeClass = isLoss 
            ? "text-rose-400 bg-rose-500/10 border-rose-500/20" 
            : "text-indigo-400 bg-indigo-500/10 border-indigo-500/20";

          return (
            <div
              key={tx._id}
              id={domId}
              onClick={() => isTrade ? handleTraceOrigin(tx.rootId) : null}
              className={`group flex items-center justify-between p-3 rounded-xl border transition-all ${bgClass}`}
              title={isTrade ? "Click to find original investment" : ""}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className={`p-2 rounded-full shrink-0 ${iconClass}`}>
                  {isTransfer ? <RefreshCw size={16} /> : 
                   isTrade ? <Zap size={16} fill="currentColor" /> :
                   (isPositive ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />)}
                </div>

                <div className="flex-1 min-w-0 pr-2">
                  <p className={`font-medium text-sm whitespace-normal leading-tight ${isTransfer ? 'text-slate-400' : 'text-slate-200'}`}>
                    {tx.text}
                  </p>
                  
                  <div className="flex items-center gap-2 mt-1">
                    <p className="text-[10px] text-slate-500">
                      {new Date(tx.date || tx.createdAt).toLocaleDateString()}
                    </p>
                    
                    {isTrade && (
                      <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border ${badgeClass}`}>
                        <LinkIcon size={8} /> Linked
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 shrink-0 pl-2">
                <span className={`block font-mono font-bold text-sm whitespace-nowrap ${textClass}`}>
                  {isPositive && !isLoss ? '+' : ''} ${Math.abs(tx.amount).toLocaleString()}
                </span>

                <div className="flex items-center gap-1">
                  <button onClick={(e) => { e.stopPropagation(); onEdit(tx); }} className="text-slate-600 hover:text-blue-400 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <Pencil size={14} />
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onDelete(tx._id); }} className="text-slate-600 hover:text-red-400 p-2 rounded-lg hover:bg-white/5 transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default TransactionList;