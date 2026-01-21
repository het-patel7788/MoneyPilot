import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { Plus } from 'lucide-react'; // Import Icon
import TransactionList from '../components/TransactionList';
import AddTransactionModal from '../components/AddTransactionModal'; // Import Modal

const Dashboard = ({ walletType, transactions }) => {
  const [netWorth, setNetWorth] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false); // 1. New Modal State
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeView = searchParams.get('view') || 'dashboard';

  const themes = {
    home: { text: "Total Net Worth", color: "text-emerald-400" },
    business: { text: "Business Wallet", color: "text-blue-400" },
    travel: { text: "Travel Budget", color: "text-purple-400" }
  };

  const currentTheme = themes[walletType] || themes.home;

  const fetchStats = () => {
    // Keep this for loading initial data
    const API_URL = import.meta.env.VITE_API_URL;
    axios.get(`${API_URL}/stats?wallet=${walletType}`)
      .then((response) => {
        setNetWorth(response.data.netWorth);
        setTransactions(response.data.transactions);
      })
      .catch((error) => console.error("Error:", error));
  };

  useEffect(() => {
    fetchStats();
  }, [walletType]);

  // 2. Handle adding locally for instant UI update
  const handleAddTransaction = (newTx) => {
    // Add to list
    setTransactions([newTx, ...transactions]);
    
    // Update Net Worth instantly based on type
    if (newTx.type === 'income') setNetWorth(prev => prev + newTx.amount);
    if (newTx.type === 'expense') setNetWorth(prev => prev - newTx.amount);
    // Investments usually don't lower Net Worth, but they move cash. 
    // We'll leave investment logic neutral for net worth for now.
  };

  return (
    <div className="animate-fade-in max-w-5xl w-full">
      
      {/* HEADER */}
      <h1 className="text-4xl font-bold mb-2 text-white">
        {walletType === 'home' ? 'Pilot' : walletType.charAt(0).toUpperCase() + walletType.slice(1)} <span className={currentTheme.color}>Dashboard</span>
      </h1>
      <p className="text-gray-400 mb-10">Welcome to your {walletType} command center.</p>


      {/* VIEW 1: DASHBOARD (Stats + Add Button) */}
      {activeView === 'dashboard' && (
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          
          {/* 1. Net Worth Card */}
          <div className="flex-1 p-8 rounded-2xl bg-[#1e293b] border border-white/5 shadow-xl flex flex-col justify-center">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{currentTheme.text}</h3>
            <p className={`text-5xl font-bold mt-2 ${currentTheme.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`}>
              $ {netWorth.toLocaleString()}
            </p>
          </div>

          {/* 2. The NEW "Add Transaction" Card */}
          <div 
            onClick={() => setIsModalOpen(true)}
            className="group cursor-pointer flex-1 p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-dashed border-emerald-500/30 hover:border-emerald-500/60 transition-all duration-300 flex flex-col items-center justify-center gap-4 text-center min-h-[180px]"
          >
             <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-lg shadow-emerald-500/10">
               <Plus size={32} />
             </div>
             <div>
               <h3 className="text-emerald-400 font-bold text-lg group-hover:text-emerald-300">Add Transaction</h3>
               <p className="text-slate-500 text-sm mt-1">Income, Expense, or Investment</p>
             </div>
          </div>

        </div>
      )}

      {/* VIEW 2: HISTORY */}
      {activeView === 'history' && (
        <div className="w-full max-w-3xl">
           <h3 className="text-xl font-bold mb-6 text-slate-200">Transaction History</h3>
           <TransactionList transactions={transactions} />
        </div>
      )}

      {/* VIEW 3: NOTES */}
      {activeView === 'notes' && (
        <div className="p-12 text-center rounded-2xl bg-slate-800/30 border border-white/5 border-dashed max-w-2xl">
          <p className="text-gray-500">Notes module coming soon...</p>
        </div>
      )}

      {/* 3. THE MODAL COMPONENT */}
      <AddTransactionModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAdd={handleAddTransaction}
      />

    </div>
  );
};

export default Dashboard;