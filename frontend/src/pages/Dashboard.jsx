import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { useAuth } from "@clerk/clerk-react"; 
import useAxios from '../api/axios';
import { Plus, PieChart, ArrowRight, Loader, Search, Filter, ChevronDown } from 'lucide-react'; 
import TransactionList from '../components/transactions/TransactionList';
import AddTransactionModal from '../components/transactions/AddTransactionModal';
import InvestmentView from '../components/investments/InvestmentView';

const Dashboard = ({ walletType }) => {
  const { isSignedIn } = useAuth();
  const navigate = useNavigate();
  const axios = useAxios();

  const [netWorth, setNetWorth] = useState(0);
  const [cashBalance, setCashBalance] = useState(0);
  const [assetValue, setAssetValue] = useState(0);
  const [transactions, setTransactions] = useState([]);
  
  // --- SEARCH & FILTER STATES ---
  const [searchTerm, setSearchTerm] = useState('');
  const [activeFilter, setActiveFilter] = useState('All'); 

  // --- PAGINATION STATE ---
  const [visibleCount, setVisibleCount] = useState(35); 

  const [loading, setLoading] = useState(true); 
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const activeView = searchParams.get('view') || 'dashboard';

  const themes = {
    home: { text: "Total Net Worth", color: "text-emerald-400" },
    business: { text: "Business Wallet", color: "text-blue-400" },
    travel: { text: "Travel Budget", color: "text-purple-400" }
  };
  const currentTheme = themes[walletType] || themes.home;

  // --- REDIRECT FIX ---
  useEffect(() => {
    if (isSignedIn) {
        const saved = localStorage.getItem('pendingTransaction');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                const savedWallet = parsed.wallet || 'home';
                if (savedWallet !== walletType) {
                    const targetPath = savedWallet === 'home' ? '/' : `/${savedWallet}`;
                    navigate(targetPath);
                    return; 
                }
                setEditTransaction(parsed); 
                setIsModalOpen(true);       
                localStorage.removeItem('pendingTransaction'); 
            } catch (e) {
                localStorage.removeItem('pendingTransaction');
            }
        }
    }
  }, [isSignedIn, walletType, navigate]);

  const fetchStats = useCallback(async () => {
    if (!isSignedIn) {
        setNetWorth(0); setCashBalance(0); setAssetValue(0); setTransactions([]); setLoading(false);
        return;
    }
    setLoading(true);

    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await axios.get(`${API_URL}/api/stats?wallet=${walletType}`);
      
      setNetWorth(response.data.netWorth);
      setCashBalance(response.data.cashBalance);
      setAssetValue(response.data.assetValue);
      
      const sortedTransactions = response.data.transactions.sort((a, b) => {
        const dateA = new Date(a.date).getTime();
        const dateB = new Date(b.date).getTime();
        if (dateA !== dateB) return dateB - dateA;
        if (a._id < b._id) return 1;
        if (a._id > b._id) return -1;
        return 0;
      });

      setTransactions(sortedTransactions);
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
        setLoading(false); 
    }
  }, [walletType, isSignedIn, axios]);

  useEffect(() => { fetchStats(); }, [fetchStats]);

  const handleTransactionSuccess = () => { setIsModalOpen(false); fetchStats(); };

  const handleEdit = (transaction) => {
    if (!isSignedIn) { navigate('/sign-in'); return; }
    setEditTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleDeleteTransaction = async (id) => {
    if (!isSignedIn) { navigate('/sign-in'); return; }
    try {
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.delete(`${API_URL}/api/transaction/${id}`);
      fetchStats();
    } catch (error) { console.error("Error deleting transaction:", error); }
  };

  // --- SMART FILTER LOGIC ---
  const uniqueMonths = [...new Set(transactions.map(t => {
      const d = new Date(t.date);
      return d.toLocaleString('default', { month: 'short', year: 'numeric' });
  }))];

  const filterTransactions = (txs) => {
    return txs.filter(t => {
      const matchesSearch = t.text.toLowerCase().includes(searchTerm.toLowerCase());
      let matchesFilter = true;

      if (activeFilter === 'All') {
          matchesFilter = true;
      } else if (['income', 'expense', 'investment'].includes(activeFilter)) {
          matchesFilter = t.type === activeFilter;
      } else {
          const txDate = new Date(t.date).toLocaleString('default', { month: 'short', year: 'numeric' });
          matchesFilter = txDate === activeFilter;
      }
      return matchesSearch && matchesFilter;
    });
  };

  // 1. Get Full Filtered Lists
  const allMoneyIn = filterTransactions(transactions.filter(t => 
    t.amount >= 0 && (!t.text || !t.text.includes('Strategy Loss'))
  ));

  const allExpenses = filterTransactions(transactions.filter(t => 
    t.amount < 0 || (t.text && t.text.includes('Strategy Loss'))
  ));

  // 2. Apply Pagination (Slice the lists)
  const isSearching = searchTerm !== '' || activeFilter !== 'All';
  
  const moneyIn = isSearching ? allMoneyIn : allMoneyIn.slice(0, visibleCount);
  const expenses = isSearching ? allExpenses : allExpenses.slice(0, visibleCount);

  // 3. Check if we need "Load More" button
  const hasMore = !isSearching && (visibleCount < allMoneyIn.length || visibleCount < allExpenses.length);

  const loadMore = () => {
    setVisibleCount(prev => prev + 35); 
  };

  if (loading) {
      return (
          <div className="flex h-[calc(100vh-100px)] items-center justify-center w-full">
              <div className="flex flex-col items-center gap-4">
                  <Loader className="animate-spin text-emerald-400" size={40} />
                  <p className="text-slate-500 animate-pulse text-sm">Loading Data...</p>
              </div>
          </div>
      );
  }

  return (
    <div className="animate-fade-in max-w-7xl w-full pl-6 mt-2">

      {/* HEADER */}
      <h1 className="text-4xl font-bold mb-2 text-white">
        {walletType === 'home' ? 'Pilot' : walletType.charAt(0).toUpperCase() + walletType.slice(1)} <span className={currentTheme.color}>Dashboard</span>
      </h1>
      <p className="text-gray-400 mb-8">Welcome to your {walletType} command center.</p>

      {/* VIEW 1: DASHBOARD */}
      {activeView === 'dashboard' && (
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          <div className="flex-1 p-8 rounded-2xl bg-[#1e293b] border border-white/5 shadow-xl flex flex-col justify-center">
            <h3 className="text-slate-400 text-sm font-medium uppercase tracking-wider">{currentTheme.text}</h3>
            <p className={`text-5xl font-bold mt-2 ${currentTheme.color} drop-shadow-[0_0_15px_rgba(255,255,255,0.1)]`}>
              $ {netWorth.toLocaleString()}
            </p>
            <div className="mt-6 pt-6 border-t border-white/10 grid grid-cols-2 gap-4">
              <div><p className="text-xs text-slate-500 uppercase tracking-wider">Cash Available</p><p className="text-lg font-bold text-emerald-400 mt-1">$ {cashBalance.toLocaleString()}</p></div>
              <div><p className="text-xs text-slate-500 uppercase tracking-wider">Invested Assets</p><p className="text-lg font-bold text-purple-400 mt-1">$ {assetValue.toLocaleString()}</p></div>
            </div>
          </div>
          <div onClick={() => { setEditTransaction(null); setIsModalOpen(true); }} className="group cursor-pointer flex-1 p-8 rounded-2xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border border-dashed border-emerald-500/30 hover:border-emerald-500/60 transition-all duration-300 flex flex-col items-center justify-center gap-4 text-center min-h-[180px]">
            <div className="p-4 rounded-full bg-emerald-500/20 text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500 group-hover:text-white transition-all duration-300 shadow-lg shadow-emerald-500/10"><Plus size={32} /></div>
            <div><h3 className="text-emerald-400 font-bold text-lg group-hover:text-emerald-300">Add Transaction</h3><p className="text-slate-500 text-sm mt-1">Income, Expense, or Investment</p></div>
          </div>
        </div>
      )}

      {/* VIEW 2: HISTORY */}
      {activeView === 'history' && (
        <div className="w-full pb-20"> 
          <div className="flex flex-col md:flex-row items-center justify-between mb-5 gap-4">
            <h3 className="text-xl font-bold text-slate-200">Transaction Ledger</h3>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="relative group flex-grow md:flex-grow-0">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded-full pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 w-full md:w-40 transition-all"
                    />
                </div>
                
                <div className="relative group flex-grow md:flex-grow-0">
                    <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors" />
                    <select 
                        value={activeFilter}
                        onChange={(e) => setActiveFilter(e.target.value)}
                        className="bg-slate-900 border border-white/10 rounded-full pl-10 pr-8 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50 appearance-none cursor-pointer hover:bg-slate-800 transition-all w-full md:w-auto"
                    >
                        <option value="All">All Transactions</option>
                        <optgroup label="Type">
                            <option value="income">Income Only</option>
                            <option value="expense">Expense Only</option>
                            <option value="investment">Investments Only</option>
                        </optgroup>
                        {uniqueMonths.length > 0 && (
                            <optgroup label="Month">
                                {uniqueMonths.map(month => (
                                    <option key={month} value={month}>{month}</option>
                                ))}
                            </optgroup>
                        )}
                    </select>
                </div>

                <Link to="?view=investments" className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 bg-purple-500/10 px-4 py-2 rounded-full border border-purple-500/20 transition-all hover:bg-purple-500/20 whitespace-nowrap ml-auto md:ml-0">
                  <PieChart size={16} /> View Investments <ArrowRight size={14} />
                </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-900/50 p-6 rounded-2xl border border-emerald-500/20">
              <h4 className="text-emerald-400 font-bold mb-4 uppercase tracking-wider text-xs flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500"></div> Money In (Income)
              </h4>
              <TransactionList transactions={moneyIn} onDelete={handleDeleteTransaction} onEdit={handleEdit} />
              {moneyIn.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No matching income found.</p>}
            </div>

            <div className="bg-slate-900/50 p-6 rounded-2xl border border-red-500/20">
              <h4 className="text-red-400 font-bold mb-4 uppercase tracking-wider text-xs flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-500"></div> Money Out (Expense / Loss)
              </h4>
              <TransactionList transactions={expenses} onDelete={handleDeleteTransaction} onEdit={handleEdit} />
              {expenses.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No matching expenses found.</p>}
            </div>
          </div>

          {/* --- PAGINATION BUTTON --- */}
          {hasMore && (
            <div className="mt-8 flex justify-center">
              <button 
                onClick={loadMore}
                className="group flex items-center gap-2 px-6 py-3 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-white/5 hover:border-white/10 shadow-lg"
              >
                <span>Load More</span>
                <ChevronDown size={16} className="group-hover:translate-y-1 transition-transform" />
              </button>
            </div>
          )}

        </div>
      )}

      {/* VIEW 3: INVESTMENTS */}
      {activeView === 'investments' && (
        <InvestmentView transactions={transactions} walletType={walletType} />
      )}

      {/* VIEW 4: NOTES */}
      {activeView === 'notes' && (
        <div className="p-12 text-center rounded-2xl bg-slate-800/30 border border-white/5 border-dashed max-w-2xl">
          <p className="text-gray-500">Notes module coming soon...</p>
        </div>
      )}

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditTransaction(null); }}
        onSuccess={handleTransactionSuccess}
        activeWallet={walletType}
        editData={editTransaction}
      />
    </div>
  );
};
export default Dashboard;