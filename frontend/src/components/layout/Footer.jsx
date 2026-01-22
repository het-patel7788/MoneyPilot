import React from 'react';
import { Github, Linkedin, Instagram, Wallet, FileText, PieChart } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-white/5 bg-slate-900 w-full relative z-10">

      <div className="max-w-7xl mx-auto px-6 md:px-10 pt-12 pb-8">

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12 pb-12 border-b border-white/5">
          
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 text-lg font-bold text-slate-200 mb-6">
              <span className="text-emerald-400 tracking-wider">MONEYPILOT</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">PRO</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed pr-4">
              The advanced wealth operating system designed for individuals who treat their personal finances like a scalable business.
            </p>
          </div>

          {/* Feature 1 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <div className="p-1.5 rounded bg-blue-500/10 text-blue-400"><Wallet size={16} /></div>
              <span>Multi-Wallet</span>
            </div>
            <p className="text-xs text-slate-500">Isolate your finances into secure clusters.</p>
          </div>

          {/* Feature 2 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <div className="p-1.5 rounded bg-purple-500/10 text-purple-400"><FileText size={16} /></div>
              <span>Evidence Locker</span>
            </div>
            <p className="text-xs text-slate-500">Store 10+ attachments per transaction.</p>
          </div>

          {/* Feature 3 */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-200">
              <div className="p-1.5 rounded bg-emerald-500/10 text-emerald-400"><PieChart size={16} /></div>
              <span>Asset Intelligence</span>
            </div>
            <p className="text-xs text-slate-500">Track real-time Profit/Loss.</p>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col md:flex-row items-center gap-4 text-[10px] text-slate-600 font-mono uppercase tracking-wider">
            <span>© {currentYear} MoneyPilot Systems</span>
            <span className="hidden md:inline text-slate-800">|</span>
            <span className="text-emerald-500/60">v1.0.0 (Beta Build)</span>
          </div>

          <div className="flex items-center gap-8">
            <div className="flex items-center gap-2.5 bg-emerald-950/30 px-3 py-1.5 rounded-full border border-emerald-500/10">
              <div className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
              </div>
              <span className="text-[10px] font-medium text-emerald-400/90 tracking-wide">SYSTEMS ONLINE</span>
            </div>
            <div className="flex items-center gap-3">
              <SocialLink icon={Github} />
              <SocialLink icon={Linkedin} />
              <SocialLink icon={Instagram} />
            </div>
          </div>
        </div>

      </div>
    </footer>
  );
};

const SocialLink = ({ icon: Icon }) => (
  <a href="#" className="p-2 rounded-lg hover:bg-white/5 text-slate-500 hover:text-white transition-all duration-300">
    <Icon size={16} />
  </a>
);

export default Footer;