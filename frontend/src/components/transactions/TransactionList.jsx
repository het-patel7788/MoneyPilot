import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Trash2 } from 'lucide-react';

const TransactionList = ({ transactions, onDelete }) => {
  return (
    <div className="mt-4 p-6 rounded-2xl bg-slate-800/50 border border-white/5 w-full max-w-md backdrop-blur-sm">
      <div className="flex flex-col gap-3">
        {transactions.length === 0 ? (
          <div className="text-center p-12 rounded-2xl bg-slate-800/30 border border-white/5 border-dashed">
            <p className="text-slate-500">No flight logs found.</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div 
              key={tx._id} 
              className="group flex items-center justify-between p-4 rounded-xl bg-slate-800/50 border border-white/5 hover:border-white/10 transition-all hover:bg-slate-800/80 relative"
            >
              <div className="flex items-center gap-4">
                {/* ICON */}
                <div className={`p-3 rounded-full ${tx.amount >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {tx.amount >= 0 ? <ArrowUpRight size={20} /> : <ArrowDownLeft size={20} />}
                </div>
                
                {/* TEXT INFO */}
                <div>
                  <p className="font-medium text-slate-200">{tx.text}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* RIGHT SIDE */}
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <span className={`block font-bold text-lg ${tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.amount >= 0 ? '+' : ''} $ {Math.abs(tx.amount).toLocaleString()}
                  </span>
                  <span className="text-xs text-slate-600 uppercase tracking-wider font-medium">
                    {tx.category || 'General'}
                  </span>
                </div>

                {/* DELETE BUTTON - FIXED: Always visible now */}
                <button 
                  onClick={() => onDelete(tx._id)}
                  className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                  title="Delete Transaction"
                >
                  <Trash2 size={18} />
                </button>
              </div>

            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionList;