import React, { useState } from 'react';
import { X, Check } from 'lucide-react';

const AddWalletModal = ({ isOpen, onClose, onAdd }) => {
  const [name, setName] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    // Send the name back to Sidebar
    onAdd(name.trim().toLowerCase()); 
    setName('');
    onClose();
  };

  return (
    // Backdrop
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      
      {/* Modal Card */}
      <div className="w-full max-w-sm bg-[#0f172a] border border-white/10 rounded-2xl p-6 shadow-2xl relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-xl font-bold text-white mb-1">New Wallet</h2>
        <p className="text-gray-400 text-sm mb-6">Create a new category to track separate expenses.</p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            autoFocus
            type="text" 
            placeholder="Wallet Name (e.g. Crypto)" 
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all placeholder:text-slate-600"
          />

          <button 
            type="submit"
            className="w-full bg-emerald-500 hover:bg-emerald-400 text-slate-900 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            <Check size={20} />
            Create Wallet
          </button>
        </form>

      </div>
    </div>
  );
};

export default AddWalletModal;