import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, History, X, CheckCircle, Loader, FileText, Clock } from 'lucide-react';
import ReactDOM from 'react-dom'; 
import axios from 'axios';

const InvestmentCard = ({ transaction, onSuccess, onViewHistory }) => {
  const [currentVal, setCurrentVal] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  
  // Only state for VIEWING the original receipt
  const [showReceipt, setShowReceipt] = useState(false);

  // Source of Truth: Dollar Amount
  const [exitAmount, setExitAmount] = useState(0);

  const investedAmount = Math.abs(transaction.amount);
  const currentTotal = parseFloat(currentVal) || 0;

  // Profit Logic
  const profit = currentTotal - investedAmount;
  const percent = currentTotal > 0 ? ((profit / investedAmount) * 100).toFixed(1) : 0;
  const isProfit = profit >= 0;

  // Derived Math
  const remainingAmount = currentTotal - exitAmount;
  const sliderPercent = currentTotal > 0 ? (exitAmount / currentTotal) * 100 : 0;

  // --- HANDLERS ---

  const handleSliderChange = (e) => {
    const newPercent = parseFloat(e.target.value);
    const newAmount = (currentTotal * (newPercent / 100));
    setExitAmount(newAmount);
  };

  const handleAmountChange = (e) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val)) val = 0;
    if (val > currentTotal) val = currentTotal;
    setExitAmount(val);
  };

  const getStrategyText = () => {
    if (exitAmount <= 0) return "Adjust slider or type amount to decide strategy.";
    if (exitAmount >= currentTotal) return `Full Exit. Converting $${currentTotal.toLocaleString()} to Cash.`;
    if (Math.abs(exitAmount - investedAmount) < 10) return `Risk-Free Mode. Recovering exactly your original $${investedAmount.toLocaleString()}.`;
    return `Withdrawing $${Math.floor(exitAmount).toLocaleString()}. Leaving $${Math.floor(remainingAmount).toLocaleString()} active.`;
  };

  // --- SIMPLIFIED EXECUTE (No Image Upload) ---
  const handleExecute = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // Send strictly data, no image URL
      await axios.post(`${API_URL}/api/transaction/withdraw`, {
        originalId: transaction._id,
        withdrawAmount: exitAmount,    
        remainingAmount: remainingAmount,
        totalValue: currentTotal
      });

      setIsExpanded(false);
      onSuccess(); 

    } catch (error) {
      console.error("Execution failed", error);
      alert("Failed to execute strategy.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <motion.div
      layout
      transition={{ layout: { duration: 0.3 } }}
      className="relative w-full bg-[#1e1b4b] border border-indigo-500/30 rounded-2xl p-5 shadow-2xl overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full pointer-events-none" />

      {/* HEADER */}
      <div className="flex justify-between items-start mb-6 relative z-10">
        <div>
          <h3 className="text-white font-bold text-lg flex items-center gap-2">
            {transaction.text}
            {transaction.parentId && <History size={14} className="text-slate-500" />}
          </h3>
          <p className="text-indigo-300/60 text-xs uppercase tracking-wider font-semibold">
            {new Date(transaction.date).toLocaleDateString()}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
            {/* 1. RECEIPT BUTTON (Only if this specific card has one) */}
            {transaction.imageUrl && (
                <button 
                  onClick={() => setShowReceipt(true)}
                  className="p-1.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/30 transition-colors"
                  title="View Original Buy Receipt"
                >
                   <FileText size={14} />
                </button>
            )}

            {/* 2. HISTORY BUTTON */}
            <button 
              onClick={onViewHistory}
              className="p-1.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/30 transition-colors"
              title="View Full Lifecycle Timeline"
            >
               <Clock size={14} />
            </button>

            {/* 3. BADGE */}
            <div className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
               ACTIVE
            </div>
        </div>
      </div>

      {/* INPUTS */}
      <div className="flex items-center gap-4 relative z-10">
        <div className="flex-1 space-y-2">
          <label className="text-[10px] text-slate-400 uppercase font-bold tracking-widest ml-1">Invested</label>
          <div className="p-3 bg-slate-900/50 rounded-xl border border-white/5 text-slate-300 font-mono text-lg font-bold">
            ${investedAmount.toLocaleString()}
          </div>
        </div>

        <div className="pt-6">
          <div className={`h-[2px] w-8 transition-colors duration-500 ${currentVal ? (isProfit ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-red-500') : 'bg-slate-700'}`}></div>
        </div>

        <div className="flex-1 space-y-2 relative">
          <label className="text-[10px] text-indigo-400 uppercase font-bold tracking-widest ml-1">Current Value</label>
          <div className={`relative p-3 bg-slate-900 rounded-xl border transition-all duration-300 ${currentVal ? (isProfit ? 'border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'border-red-500/50') : 'border-indigo-500/30'}`}>
            <span className="absolute left-3 top-3.5 text-slate-500 font-mono">$</span>
            <input
              type="number"
              value={currentVal}
              onChange={(e) => {
                setCurrentVal(e.target.value);
                setExitAmount(0);
              }}
              disabled={isExpanded || loading}
              placeholder="..."
              className="w-full bg-transparent pl-4 font-mono text-lg font-bold text-white outline-none"
            />
          </div>
          {currentVal && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`absolute -top-8 right-0 text-xs font-bold px-2 py-1 rounded bg-slate-900 border ${isProfit ? 'text-emerald-400 border-emerald-500/30' : 'text-red-400 border-red-500/30'}`}>
              {isProfit ? '+' : ''}{percent}%
            </motion.div>
          )}
        </div>

        <div className="pt-6">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={!currentVal || loading}
            className={`p-3 rounded-xl transition-all duration-300 shadow-lg ${currentVal ? (isExpanded ? 'bg-indigo-500 text-white' : 'bg-white text-indigo-900 hover:scale-105') : 'bg-slate-800 text-slate-600 cursor-not-allowed'}`}
          >
            {isExpanded ? <X size={20} /> : <ArrowRight size={20} className={currentVal ? 'animate-pulse' : ''} />}
          </button>
        </div>
      </div>

      {/* STRATEGY PANEL */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6 pt-6 border-t border-white/10"
          >
            <div className="space-y-6">
              <div className="text-center">
                <p className="text-indigo-300 text-sm font-medium animate-pulse">{getStrategyText()}</p>
              </div>

              <div className="px-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1"
                  value={sliderPercent}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 1. WITHDRAW INPUT (CLEAN - NO CAMERA) */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                    <label className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block mb-1">Withdraw Amount</label>
                    <div className="relative">
                      <span className="absolute left-0 text-emerald-500 font-bold">$</span>
                      <input
                        type="number"
                        value={exitAmount > 0 ? Math.round(exitAmount * 100) / 100 : ''} 
                        onChange={handleAmountChange}
                        placeholder="0"
                        className="w-full bg-transparent pl-3 text-white font-bold outline-none"
                      />
                    </div>
                </div>

                <div className="bg-slate-800/50 border border-white/5 rounded-xl p-3">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Left Active</label>
                  <div className="text-slate-300 font-bold">
                    ${Math.floor(remainingAmount).toLocaleString()}
                  </div>
                </div>
              </div>

              <button
                onClick={handleExecute}
                disabled={exitAmount <= 0 || loading}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${exitAmount > 0 ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
              >
                {loading ? <Loader className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                {loading ? 'Executing Strategy...' : 'Confirm Strategy'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>

    {/* RECEIPT POPUP (Still needed to view original receipt) */}
    {showReceipt && ReactDOM.createPortal(
        <div
          className="fixed inset-0 z-[99999] bg-black/95 backdrop-blur-xl flex items-center justify-center p-8 animate-in fade-in duration-200"
          onClick={() => setShowReceipt(false)}
        >
          <button className="absolute top-8 right-8 text-slate-400 hover:text-white transition-colors bg-white/10 p-3 rounded-full hover:bg-white/20 z-50">
            <X size={24} />
          </button>

          <img
            src={transaction.imageUrl}
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

export default InvestmentCard;