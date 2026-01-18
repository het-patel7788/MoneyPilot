import React, { useState, useEffect } from 'react';
import axios from 'axios';
import TransactionForm from '../components/TransactionForm';

const Dashboard = ({ walletType }) => {
  const [netWorth, setNetWorth] = useState(0);
  const [transactions, setTransactions] = useState([]);

  // Dynamic Title based on wallet
  const titles = {
    home: { text: "Total Net Worth", color: "text-emerald-400" },
    business: { text: "Business Wallet", color: "text-blue-400" },
    travel: { text: "Travel Budget", color: "text-purple-400" }
  };

  const currentTheme = titles[walletType] || titles.home;

  const fetchStats = () => {
    const API_URL = import.meta.env.VITE_API_URL;
    
    // Send the wallet type to backend!
    axios.get(`${API_URL}/stats?wallet=${walletType}`)
      .then((response) => {
        setNetWorth(response.data.netWorth);
        setTransactions(response.data.transactions);
      })
      .catch((error) => console.error("Error:", error));
  };

  // Re-fetch whenever the walletType changes (e.g. clicking Sidebar)
  useEffect(() => {
    fetchStats();
  }, [walletType]);

  return (
    <div className="animate-fade-in">
      <h1 className="text-4xl font-bold mb-2">
        {walletType === 'home' ? 'Pilot' : walletType.charAt(0).toUpperCase() + walletType.slice(1)} <span className={currentTheme.color}>Dashboard</span> ✈️
      </h1>
      <p className="text-gray-400">Welcome to your {walletType} command center.</p>

      <div className="mt-8 p-8 rounded-2xl bg-slate-800/50 border border-white/5 w-full max-w-md backdrop-blur-sm">
        <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">{currentTheme.text}</h3>
        <p className={`text-5xl font-bold mt-2 ${currentTheme.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`}>
          $ {netWorth.toLocaleString()}
        </p>
      </div>

      {/* Pass walletType to Form so we save to the right place */}
      <TransactionForm onSuccess={fetchStats} activeWallet={walletType} />
      
      {/* We will add the list back here later */}
    </div>
  );
};

export default Dashboard;