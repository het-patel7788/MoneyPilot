import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';

const Dashboard = ({ walletType }) => {
  const [netWorth, setNetWorth] = useState(0);
  const [transactions, setTransactions] = useState([]);
  
  // 1. Read the View from the URL (Sidebar controls this now)
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

  return (
    <div className="animate-fade-in max-w-5xl">
      
      {/* HEADER */}
      <h1 className="text-4xl font-bold mb-2">
        {walletType === 'home' ? 'Pilot' : walletType.charAt(0).toUpperCase() + walletType.slice(1)} <span className={currentTheme.color}>Dashboard</span>
      </h1>
      <p className="text-gray-400 mb-10">Welcome to your {walletType} command center.</p>

      {/* VIEW 1: DASHBOARD (Total + Form) */}
      {activeView === 'dashboard' && (
        <div className="flex flex-col gap-8">
          
          {/* Total Card */}
          <div className="p-8 rounded-2xl bg-slate-800/50 border border-white/5 backdrop-blur-sm w-full max-w-md">
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">{currentTheme.text}</h3>
            <p className={`text-5xl font-bold mt-2 ${currentTheme.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`}>
              $ {netWorth.toLocaleString()}
            </p>
          </div>

          {/* Form - Restored to Standalone Style */}
          <div className="w-full">
            <TransactionForm onSuccess={fetchStats} activeWallet={walletType} />
          </div>

        </div>
      )}

      {/* VIEW 2: HISTORY (Full List) */}
      {activeView === 'history' && (
        <div className="w-full max-w-2xl">
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

    </div>
  );
};

export default Dashboard;