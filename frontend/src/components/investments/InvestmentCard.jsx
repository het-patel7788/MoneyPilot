import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, History, X, CheckCircle, Loader } from 'lucide-react';
import axios from 'axios';

const InvestmentCard = ({ transaction, onSuccess }) => {
  const [currentVal, setCurrentVal] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);

  // NEW: The Source of Truth is now the DOLLAR AMOUNT, not the percentage
  const [exitAmount, setExitAmount] = useState(0);

  const investedAmount = Math.abs(transaction.amount);
  const currentTotal = parseFloat(currentVal) || 0;

  // Profit Logic
  const profit = currentTotal - investedAmount;
  const percent = currentTotal > 0 ? ((profit / investedAmount) * 100).toFixed(1) : 0;
  const isProfit = profit >= 0;

  // Derived Math (Calculated on the fly)
  const remainingAmount = currentTotal - exitAmount;
  const sliderPercent = currentTotal > 0 ? (exitAmount / currentTotal) * 100 : 0;

  // --- HANDLERS ---

  // 1. When Slider Moves -> Update Amount
  const handleSliderChange = (e) => {
    const newPercent = parseFloat(e.target.value);
    const newAmount = (currentTotal * (newPercent / 100));
    setExitAmount(newAmount); // We store the exact dollar amount
  };

  // 2. When Input Types -> Update Amount
  const handleAmountChange = (e) => {
    let val = parseFloat(e.target.value);
    if (isNaN(val)) val = 0;
    if (val > currentTotal) val = currentTotal; // Cap at max
    setExitAmount(val);
  };

  const getStrategyText = () => {
    if (exitAmount <= 0) return "Adjust slider or type amount to decide strategy.";
    if (exitAmount >= currentTotal) return `Full Exit. Converting $${currentTotal.toLocaleString()} to Cash.`;

    // Check if near principal (within $10 tolerance)
    if (Math.abs(exitAmount - investedAmount) < 10) return `Risk-Free Mode. Recovering exactly your original $${investedAmount.toLocaleString()}.`;

    return `Withdrawing $${Math.floor(exitAmount).toLocaleString()}. Leaving $${Math.floor(remainingAmount).toLocaleString()} active.`;
  };

  const handleExecute = async () => {
    setLoading(true);
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      // CHANGED: Route is now /withdraw
      await axios.post(`${API_URL}/api/transaction/withdraw`, {
        originalId: transaction._id,
        withdrawAmount: exitAmount,    
        remainingAmount: remainingAmount,
        totalValue: currentTotal
      });

      setIsExpanded(false);
      onSuccess(); // Refresh the page

    } catch (error) {
      console.error("Execution failed", error);
      alert("Failed to execute strategy.");
    } finally {
      setLoading(false);
    }
  };

  return (
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
        <div className="px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 text-xs font-bold">
          ACTIVE
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
                setExitAmount(0); // Reset exit if value changes
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

              {/* SLIDER (Visual Tool) */}
              <div className="px-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.1" // Smoother sliding
                  value={sliderPercent}
                  onChange={handleSliderChange}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>

              {/* NEW: PRECISION INPUTS */}
              <div className="grid grid-cols-2 gap-4">
                {/* 1. Withdraw Input */}
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-3">
                  <label className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest block mb-1">Withdraw Amount</label>
                  <div className="relative">
                    <span className="absolute left-0 text-emerald-500 font-bold">$</span>
                    <input
                      type="number"
                      value={exitAmount > 0 ? Math.round(exitAmount * 100) / 100 : ''} // Clean decimals
                      onChange={handleAmountChange}
                      placeholder="0"
                      className="w-full bg-transparent pl-3 text-white font-bold outline-none"
                    />
                  </div>
                </div>

                {/* 2. Remaining (Read Only) */}
                <div className="bg-slate-800/50 border border-white/5 rounded-xl p-3">
                  <label className="text-[10px] text-slate-400 font-bold uppercase tracking-widest block mb-1">Left Active</label>
                  <div className="text-slate-300 font-bold">
                    ${Math.floor(remainingAmount).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* EXECUTE BUTTON */}
              <button
                onClick={handleExecute}
                disabled={exitAmount <= 0 || loading}
                className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${exitAmount > 0 ? 'bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-800 text-slate-500 cursor-not-allowed'}`}
              >
                {loading ? <Loader className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                {loading ? 'Executing...' : 'Confirm Strategy'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default InvestmentCard;