import React from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Footer from './components/Footer';

function App() {
  return (
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col">

      <Header />

      <div className="flex flex-1 pt-24 mb-20 max-w-7xl mx-auto w-full">
        <aside className="w-24 md:w-32 flex-none hidden md:block">
          <div className="sticky top-28 flex justify-center">
            <Sidebar />
          </div>
        </aside>

        <main className="flex-1 px-6 min-h-[100vh]">
          
          <h1 className="text-4xl font-bold mb-2">
            Hello, <span className="text-emerald-400">Pilot</span> ✈️
          </h1>
          <p className="text-gray-400">Welcome back to your cockpit.</p>

          <div className="mt-8 p-8 rounded-2xl bg-slate-800/50 border border-white/5 w-full max-w-md backdrop-blur-sm">
            <h3 className="text-gray-400 text-sm font-medium uppercase tracking-wider">Total Net Worth</h3>
            <p className="text-5xl font-bold text-emerald-400 mt-2 drop-shadow-[0_0_15px_rgba(16,185,129,0.2)]">
              $ 45,200
            </p>
          </div>

        </main>

      </div>

      <Footer />
      
    </div>
  );
}

export default App;