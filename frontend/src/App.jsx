import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';
import AddTransactionModal from './components/AddTransactionModal';

// Helper to grab the ID from URL and pass props down
// UPDATED: Now accepts 'transactions' and 'onOpenAdd' to pass to Dashboard
const WalletWrapper = ({ transactions, onOpenAdd }) => {
  const { walletId } = useParams();
  return (
    <Dashboard 
      walletType={walletId} 
      transactions={transactions} 
      onOpenAdd={onOpenAdd} 
    />
  );
};

const Layout = () => {
  // 1. GLOBAL STATE
  // We keep the modal state HERE so it can overlay the entire app (including footer)
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [transactions, setTransactions] = useState([
    { id: 1, type: 'income', amount: 5000, description: 'Salary', category: 'Job', date: Date.now() },
    { id: 2, type: 'expense', amount: 45, description: 'Grocery', category: 'Food', date: Date.now() },
  ]);

  // 2. ADD LOGIC
  const handleAddTransaction = (newTx) => {
    setTransactions([newTx, ...transactions]);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col relative">
      
      {/* HEADER: z-50 (High, but lower than Modal) */}
      <div className="relative z-50">
        <Header/>
      </div>
      
      <div className="flex flex-1 max-w-7xl mx-auto w-full pt-24 pb-10 relative z-0">
  
        {/* SIDEBAR: z-40 */}
        <aside className="hidden md:block w-20 flex-none relative z-40">
          <div className="sticky top-28 h-fit">
            <Sidebar />
          </div>
        </aside>

        {/* MAIN CONTENT: z-0 */}
        <main className="flex-1 px-6 min-h-[60vh] relative z-0">
          <Routes>
            {/* Home Route */}
            <Route 
              path="/" 
              element={
                <Dashboard 
                  walletType="home" 
                  transactions={transactions} 
                  onOpenAdd={() => setIsModalOpen(true)} // Pass ability to open modal
                />
              } 
            />
            
            {/* Dynamic Route */}
            <Route 
              path="/:walletId" 
              element={
                <WalletWrapper 
                  transactions={transactions} 
                  onOpenAdd={() => setIsModalOpen(true)} 
                />
              } 
            />
          </Routes>
        </main>
      </div>

      {/* FOOTER FIX: 
          Changed from z-[50] to z-10. 
          It stays visible but will NEVER cover the modal again.
      */}
      <div className="relative z-10 bg-[#0f172a] border-t border-white/5 mt-auto">
        <Footer />
      </div>

      {/* 3. THE MODAL: z-[9999] (GOD MODE) 
          Placed here, it lives OUTSIDE the header/footer/sidebar structure.
          It will cover EVERYTHING when open.
      */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <AddTransactionModal 
            isOpen={isModalOpen} 
            onClose={() => setIsModalOpen(false)} 
            onAdd={handleAddTransaction}
          />
        </div>
      )}

    </div>
  );
};

function App() {
  return (
    <Router>
      <Layout />
    </Router>
  );
}

export default App;