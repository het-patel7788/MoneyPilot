import React from 'react';
import { UserButton, useUser, SignedIn, SignedOut } from "@clerk/clerk-react";
import { Sparkles, Bell } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { user } = useUser();
  const navigate = useNavigate();

  // Shared Button Style for Consistency
  const buttonStyle = "px-5 py-2 rounded-full border border-emerald-500/50 text-emerald-400 text-sm font-medium hover:bg-emerald-500 hover:text-slate-900 transition-all duration-300 shadow-[0_0_10px_rgba(16,185,129,0.1)] hover:shadow-[0_0_20px_rgba(16,185,129,0.4)]";

  return (
    // FIXED POSITON: Glued to top, full width, highest z-index
    <header className="fixed top-0 left-0 w-full z-50 bg-slate-900/90 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
      
      {/* 1. LEFT: Logo */}
      <div onClick={() => navigate('/')} className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
          <Sparkles size={18} />
        </div>
        <span className="font-bold text-lg tracking-wide text-slate-100">
          MoneyPilot
        </span>
      </div>

      {/* 2. MIDDLE: Spacer */}
      <div className="flex-1"></div>

      {/* 3. RIGHT: Actions */}
      <div className="flex items-center gap-6">

        {/* --- LOGGED IN VIEW --- */}
        <SignedIn>
            {/* Notification Bell */}
            <button className="relative p-2 text-slate-400 hover:text-emerald-400 transition-colors">
              <Bell size={20} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border border-slate-900"></span>
            </button>

            {/* Divider */}
            <div className="h-6 w-px bg-white/10"></div>

            {/* User Profile */}
            <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col items-end justify-center">
                  <span className="text-sm font-medium text-slate-200">
                    {user?.firstName || "Pilot"}
                  </span>
                </div>
                <UserButton 
                  afterSignOutUrl="/" 
                  appearance={{
                    elements: {
                      avatarBox: "w-9 h-9 border-2 border-emerald-500/20 hover:border-emerald-500 transition-colors"
                    }
                  }} 
                />
            </div>
        </SignedIn>

        {/* --- GUEST VIEW (Both Buttons Same Style) --- */}
        <SignedOut>
            <div className="flex items-center gap-4">
                {/* 1. Login */}
                <button 
                  onClick={() => navigate('/sign-in')}
                  className={buttonStyle}
                >
                  Login
                </button>

                {/* 2. Sign Up */}
                <button 
                  onClick={() => navigate('/sign-up')}
                  className={buttonStyle}
                >
                  Sign Up
                </button>
            </div>
        </SignedOut>

      </div>

    </header>
  );
};

export default Header;