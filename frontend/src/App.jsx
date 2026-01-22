import React from 'react';
import { BrowserRouter as Router, Routes, Route, useParams } from 'react-router-dom';
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Dashboard from './pages/Dashboard';

// Helper to grab the ID from URL (e.g., /business -> walletId = 'business')
const WalletWrapper = () => {
  const { walletId } = useParams();
  // We simply pass the ID to Dashboard. 
  // Dashboard will use this ID to fetch the correct data from the backend.
  return <Dashboard walletType={walletId} />;
};

const Layout = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col relative">

      {/* HEADER */}
      <div className="relative z-50">
        <Header />
      </div>

      <div className="flex flex-1 max-w-7xl mx-auto w-full pt-24 pb-10 relative z-0">

        {/* SIDEBAR */}
        <aside className="hidden md:block w-20 flex-none relative z-40">
          <div className="sticky top-28 h-fit">
            <Sidebar />
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 px-6 min-h-[60vh] relative z-0">
          <Routes>
            {/* Route 1: Home (Personal Wallet) */}
            <Route
              path="/"
              element={<Dashboard walletType="home" />}
            />

            {/* Route 2: Dynamic Wallets (Business, Travel, etc.) */}
            <Route
              path="/:walletId"
              element={<WalletWrapper />}
            />
          </Routes>
        </main>
      </div>

      {/* FOOTER */}
      <div className="relative z-10 bg-[#0f172a] border-t border-white/5 mt-auto">
        <Footer />
      </div>

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