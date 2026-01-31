import React from 'react';
import { ArrowLeft, PieChart, TrendingUp } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom'; // Added useNavigate
import InvestmentCard from './InvestmentCard';

const InvestmentView = ({ transactions, walletType }) => {
  const navigate = useNavigate(); // Hook to force refresh/navigate

  const investments = transactions.filter(t => 
    (t.category === 'Investment' || t.type === 'investment') && t.status !== 'closed'
  );

  const totalInvested = investments.reduce((acc, t) => acc + Math.abs(t.amount), 0);

  const getBackLink = () => {
    const basePath = walletType === 'home' ? '/' : `/${walletType}`;
    return `${basePath}?view=history`;
  };

  // --- REFRESH FUNCTION ---
  // Since Dashboard holds the state, the easiest way to refresh is to 
  // simply reload the page or navigate to the same spot. 
  // Ideally, Dashboard would pass a 'refetch' prop, but for now:
  const handleRefresh = () => {
    window.location.reload(); // Simple refresh to fetch new data
  };

  return (
    <div className="w-full max-w-4xl mx-auto pb-20">
      
      <div className="flex items-center gap-4 mb-8">
        <Link 
          to={getBackLink()} 
          className="p-2 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-all"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
           <h2 className="text-2xl font-bold text-white">Investment Portfolio</h2>
           <p className="text-slate-400 text-sm">Active Positions & Tactics</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
           <div className="absolute top-0 right-0 p-4 opacity-20"><TrendingUp size={100} /></div>
           <p className="text-indigo-300 text-sm font-medium uppercase tracking-wider mb-1">Total Capital Invested</p>
           <h3 className="text-4xl font-bold text-white drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">
             ${totalInvested.toLocaleString()}
           </h3>
        </div>
        
        <div className="p-6 rounded-2xl bg-[#0f172a] border border-white/5 flex items-center justify-center text-slate-500 border-dashed">
           <div className="text-center">
             <PieChart size={32} className="mx-auto mb-2 opacity-50" />
             <p className="text-sm">Allocation Chart Coming Soon</p>
           </div>
        </div>
      </div>

      <div className="space-y-6">
        <h3 className="text-white font-bold text-lg border-b border-white/10 pb-4">Active Battles ({investments.length})</h3>
        
        {investments.length === 0 ? (
          <div className="text-center py-20 opacity-50">
             <p>No active investments.</p>
             <p className="text-sm">Add a transaction with category "Investment" to start.</p>
          </div>
        ) : (
          investments.map(inv => (
            <InvestmentCard 
              key={inv._id} 
              transaction={inv} 
              onSuccess={handleRefresh} // Pass the refresh ability!
            />
          ))
        )}
      </div>

    </div>
  );
};

export default InvestmentView;