import React, { useState } from 'react';
import axios from 'axios';
import { Plus } from 'lucide-react';

// NEW: Accept "activeWallet" as a prop
const TransactionForm = ({ onSuccess, activeWallet }) => {
  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if(!text || !amount) return;

    // RULE: If we are on "Home" (Wallet 0), default new items to 'personal'.
    // Otherwise, use the current wallet (business, travel, etc).
    const targetWallet = activeWallet === 'home' ? 'personal' : activeWallet;

    try {
      const API_URL = import.meta.env.VITE_API_URL;
      
      await axios.post(`${API_URL}/transaction`, {
        text: text,
        amount: Number(amount),
        wallet: targetWallet // <--- Sending the dynamic wallet name
      });

      setText('');
      setAmount('');
      onSuccess(); // Refresh the numbers

    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  return (
    <div className="mt-8 p-6 rounded-2xl bg-slate-800/50 border border-white/5 w-full max-w-md backdrop-blur-sm">
      <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-4">
        Add to {activeWallet === 'home' ? 'Personal' : activeWallet}
      </h3>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="group relative">
          <input 
            type="text" 
            placeholder="Description..." 
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
          />
        </div>

        <div className="flex gap-4">
          <input 
            type="number" 
            placeholder="Amount" 
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
          />
          
          <button 
            type="submit"
            className="bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold p-3 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
          >
            <Plus size={24} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default TransactionForm;