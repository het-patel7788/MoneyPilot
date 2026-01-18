import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';
import Dashboard from './pages/Dashboard';

const Layout = () => {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">
      <Header />
      
      <div className="flex flex-1 max-w-7xl mx-auto w-full pt-24 pb-10 relative">
        
        {/* SIDEBAR COLUMN: z-[40] ensures it sits ABOVE the Main Content (z-0) */}
        <aside className="hidden md:block w-20 flex-none relative z-[40]">
           <div className="sticky top-28 h-fit">
             <Sidebar />
           </div>
        </aside>

        {/* MAIN CONTENT: z-0 ensures it stays BELOW the sidebar */}
        <main className="flex-1 px-6 min-h-[60vh] relative z-0">
          <Routes>
            <Route path="/" element={<Dashboard walletType="home" />} />
            <Route path="/business" element={<Dashboard walletType="business" />} />
            <Route path="/travel" element={<Dashboard walletType="travel" />} />
          </Routes>
        </main>
      </div>

      {/* FOOTER: z-[50] ensures it sits ABOVE the Sidebar (z-40) */}
      <div className="relative z-[50] bg-[#0f172a]">
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