import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { ArrowUpRight, ArrowDownLeft, Trash2, Pencil, RefreshCw, Zap, MoreVertical, FileText, X } from 'lucide-react';

const TransactionList = ({ transactions, onDelete, onEdit }) => {
  // 1. Filter out investments
  // 2. Sort by User Date (Descending)
  // 3. Tie-breaker: Sort by Created Time (Descending) - effectively "Newest Added"
  const displayTransactions = transactions
    .filter(tx => tx.type !== 'investment')
    .sort((a, b) => {
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      // Compare Dates first
      if (dateA < dateB) return 1;
      if (dateA > dateB) return -1;
      
      // If Dates are equal, compare exact Creation Time (Newest First)
      const timeA = new Date(a.createdAt);
      const timeB = new Date(b.createdAt);
      return timeB - timeA;
    });

  const [openMenuId, setOpenMenuId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef(null);
  const [viewImageUrl, setViewImageUrl] = useState(null);
  
  // NEW: State to track which transaction is expanded
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenuId(null);
      }
    };
    const handleScroll = () => setOpenMenuId(null);

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, []);

  const handleMenuClick = (e, txId) => {
    e.stopPropagation(); // Prevents row from expanding when clicking the menu
    if (openMenuId === txId) {
      setOpenMenuId(null);
    } else {
      const rect = e.currentTarget.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 5, 
        left: rect.right - 192
      });
      setOpenMenuId(txId);
    }
  };

  const activeTx = displayTransactions.find(t => t._id === openMenuId);

  return (
    <>
      <div className="flex flex-col gap-3 w-full relative">
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
            const isExpanded = expandedId === tx._id;

            let bgClass = "bg-slate-800/40 border-white/5 hover:border-white/10";
            if (isTransfer) bgClass = "bg-slate-800/20 border-white/5 opacity-75 transition-colors duration-500";
            if (isTrade) {
              bgClass = isLoss
                ? "bg-gradient-to-r from-rose-900/30 to-purple-900/30 border-rose-500/20"
                : "bg-gradient-to-r from-emerald-900/40 to-indigo-900/40 border-indigo-500/30";
            }

            let iconClass = isPositive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400";
            if (isTransfer) iconClass = "bg-slate-700/30 text-slate-500";
            if (isTrade) {
              iconClass = isLoss ? "bg-rose-500/15 text-rose-400" : "bg-indigo-500/20 text-indigo-400";
            }

            let textClass = isPositive ? "text-emerald-400" : "text-red-400";
            if (isTransfer) textClass = "text-slate-500";
            if (isTrade) {
              textClass = isLoss
                ? "text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-purple-400 font-bold"
                : "text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400 font-bold";
            }

            return (
              <div
                key={tx._id}
                id={domId}
                onClick={() => setExpandedId(isExpanded ? null : tx._id)}
                className={`group flex flex-col p-3 rounded-xl border transition-all relative cursor-pointer ${bgClass}`}
              >
                {/* --- FRONT ROW (ALWAYS 1 LINE) --- */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`p-2 rounded-full shrink-0 ${iconClass}`}>
                      {isTransfer ? <RefreshCw size={16} /> :
                        isTrade ? <Zap size={16} fill="currentColor" /> :
                          (isPositive ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />)}
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                      {/* TRUNCATE ensures this never breaks into multiple lines on the main feed */}
                      <p className={`font-medium text-sm truncate leading-tight ${isTransfer ? 'text-slate-400' : 'text-slate-200'}`}>
                        {tx.text}
                      </p>

                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-[10px] text-slate-500">
                          {new Date(tx.date || tx.createdAt).toLocaleDateString()}
                        </p>

                        {/* Show tiny receipt badge on front ONLY if not expanded */}
                        {tx.imageUrl && !isExpanded && (
                          <span className="flex items-center gap-1 text-[9px] text-emerald-400 font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border border-emerald-500/20 bg-emerald-500/5">
                            <FileText size={8} /> Receipt
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0 pl-2">
                    <span className={`block font-mono font-bold text-sm whitespace-nowrap ${textClass}`}>
                      {isPositive && !isLoss ? '+' : ''} ${Math.abs(tx.amount).toLocaleString()}
                    </span>

                    <button
                      onClick={(e) => handleMenuClick(e, tx._id)}
                      className={`p-2 rounded-lg transition-colors ${openMenuId === tx._id ? 'bg-white/10 text-white' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                    >
                      <MoreVertical size={16} />
                    </button>
                  </div>
                </div>

                {/* --- EXPANDED DETAILS BOX --- */}
                {isExpanded && (
                  <div className="mt-3 pt-3 border-t border-white/5 animate-in slide-in-from-top-2 duration-200">
                    <div className="bg-black/20 p-3 rounded-lg border border-white/5">
                      
                      {/* PRE-WRAP ensures your long log format prints beautifully line-by-line */}
                      <p className={`text-xs whitespace-pre-wrap leading-relaxed ${isTransfer ? 'text-slate-400' : 'text-slate-300'}`}>
                        {tx.text}
                      </p>

                      {/* Clickable Receipt Button moved inside the drawer */}
                      {tx.imageUrl && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setViewImageUrl(tx.imageUrl);
                          }}
                          className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wider px-2 py-1.5 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/20 transition-colors w-max"
                        >
                          <FileText size={12} /> View Attached Receipt
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {openMenuId && activeTx && ReactDOM.createPortal(
        <div
          ref={menuRef}
          style={{ top: menuPosition.top, left: menuPosition.left }}
          className="fixed z-[9999] w-48 bg-[#0f172a] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-1 space-y-1">
            {activeTx.imageUrl && (
              <button
                onClick={() => { setViewImageUrl(activeTx.imageUrl); setOpenMenuId(null); }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm text-emerald-400 hover:bg-emerald-500/10 rounded-lg transition-colors"
              >
                <FileText size={16} /> View Receipt
              </button>
            )}

            <button
              onClick={() => { onEdit(activeTx); setOpenMenuId(null); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-slate-300 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Pencil size={16} /> Edit
            </button>

            <button
              onClick={() => { onDelete(activeTx._id); setOpenMenuId(null); }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
            >
              <Trash2 size={16} /> Delete
            </button>
          </div>
        </div>,
        document.body
      )}

      {viewImageUrl && ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-200"
          onClick={() => setViewImageUrl(null)}
        >
          <button className="absolute top-8 right-8 text-slate-400 hover:text-white transition-colors bg-white/10 p-3 rounded-full hover:bg-white/20 z-50">
            <X size={24} />
          </button>

          <img
            src={viewImageUrl}
            alt="Receipt"
            className="max-w-full max-h-full rounded-lg shadow-2xl border border-white/10 object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>,
        document.body
      )}
    </>
  );
};

export default TransactionList;