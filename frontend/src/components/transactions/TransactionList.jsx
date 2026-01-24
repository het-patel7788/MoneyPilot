import React from 'react';
import { ArrowUpRight, ArrowDownLeft, Trash2, Pencil } from 'lucide-react';

const TransactionList = ({ transactions, onDelete, onEdit }) => {
  return (
    <div className="flex flex-col gap-3 w-full">
        {transactions.length === 0 ? (
          <div className="text-center p-8 rounded-xl border border-white/5 border-dashed">
            <p className="text-slate-500 text-sm">No records found.</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div 
              key={tx._id} 
              className="group flex items-center justify-between p-3 rounded-xl bg-slate-800/40 border border-white/5 hover:border-white/10 transition-all hover:bg-slate-800/80 relative"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${tx.amount >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                  {tx.amount >= 0 ? <ArrowUpRight size={16} /> : <ArrowDownLeft size={16} />}
                </div>
                
                <div>
                  <p className="font-medium text-slate-200 text-sm">{tx.text}</p>
                  <p className="text-[10px] text-slate-500">
                    {new Date(tx.date || tx.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className={`block font-bold text-sm ${tx.amount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {tx.amount >= 0 ? '+' : ''} ${Math.abs(tx.amount).toLocaleString()}
                  </span>
                </div>

                <button 
                  onClick={() => onEdit(tx)}
                  className="text-slate-600 hover:text-blue-400 transition-colors p-1"
                  title="Edit"
                >
                  <Pencil size={16} />
                </button>

                <button 
                  onClick={() => onDelete(tx._id)}
                  className="text-slate-600 hover:text-red-400 transition-colors p-1"
                  title="Delete"
                >
                  <Trash2 size={16} />
                </button>
              </div>

            </div>
          ))
        )}
    </div>
  );
};

export default TransactionList;