import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useParams, Outlet, Navigate } from 'react-router-dom';
import { SignIn, SignUp } from '@clerk/clerk-react';

// Import your existing components
import Sidebar from "./components/layout/Sidebar";
import Header from "./components/layout/Header";
import Footer from "./components/layout/Footer";
import Dashboard from './pages/Dashboard';
import InvestmentDetails from './pages/InvestmentDetails';

// --- 1. HELPER COMPONENTS ---

const WalletWrapper = () => {
  const { walletId } = useParams();
  return <Dashboard walletType={walletId} />;
};

const SignInPage = () => (
  <div className="flex justify-center items-center min-h-screen bg-[#0f172a]">
    <SignIn path="/sign-in" routing="path" signUpUrl="/sign-up" />
  </div>
);

const SignUpPage = () => (
  <div className="flex justify-center items-center min-h-screen bg-[#0f172a]">
    <SignUp path="/sign-up" routing="path" signInUrl="/sign-in" />
  </div>
);

// --- 2. THE LAYOUT (Using Outlet) ---
const Layout = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col relative overflow-x-hidden">
      {/* HEADER */}
      <div className="relative z-50">
        <Header toggleMobileMenu={toggleMobileMenu} isMobileMenuOpen={isMobileMenuOpen} />
      </div>

      {/* SIDEBAR - Mobile (Overlay) - Outside main container for proper z-index */}
      <Sidebar isMobile={true} isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} />

      <div className="flex flex-1 w-full min-w-0 pt-16 md:pt-20 pb-10 relative z-0">
        {/* SIDEBAR - Desktop */}
        <aside className="hidden md:block w-20 flex-none relative z-40">
          <div className="sticky top-28 h-fit">
            <Sidebar />
          </div>
        </aside>

        {/* MAIN CONTENT */}
        <main className="flex-1 min-w-0 px-3 md:px-6 min-h-[60vh] relative z-0 overflow-x-hidden">
          <Outlet />
        </main>
      </div>

      {/* FOOTER */}
      <div className="relative z-0 bg-[#0f172a] border-t border-white/5 mt-auto">
        <Footer />
      </div>
    </div>
  );
};

// --- 3. MAIN APP ---
function App() {
  return (
    <Router>
      <Routes>
        {/* --- PUBLIC ROUTES (Login/Signup) --- */}
        <Route path="/sign-in/*" element={<SignInPage />} />
        <Route path="/sign-up/*" element={<SignUpPage />} />

        {/* --- MAIN APP ROUTES (Now Publicly Accessible) --- */}
        <Route element={<Layout />}>
          {/* Anyone can see these pages now */}
          <Route path="/" element={<Dashboard walletType="home" />} />
          <Route path="/:walletId" element={<WalletWrapper />} />
          <Route path="/investment/:id" element={<InvestmentDetails />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
        
      </Routes>
    </Router>
  );
}

export default App;