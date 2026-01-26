import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { X, Wallet, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';

const AddWalletModal = ({ isOpen, onClose, onAdd, onEdit, onDelete, editData }) => {
  const [name, setName] = useState('');

  // 1. PRE-FILL DATA IF EDITING
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setName(editData.label); // Fill with old name
      } else {
        setName(''); // Clear for new
      }
    }
  }, [isOpen, editData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editData) {
      // EDIT MODE: Send back the ID and the new Name
      onEdit(editData.id, name);
    } else {
      // ADD MODE: Create new
      onAdd(name);
    }
    onClose();
  };

  // --- CHANGED: Direct Delete (No Confirmation Popup) ---
  const handleDelete = () => {
    // Just delete it immediately
    onDelete(editData.id);
    onClose();
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-sm bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"><X size={20} /></button>
        
        <div className="p-6 text-center border-b border-white/5">
          <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-3">
            <Wallet size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">
            {editData ? 'Manage Wallet' : 'Create New Wallet'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {editData ? 'Rename or remove this dashboard.' : 'Give your new dashboard a name.'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Wallet Name</label>
            <input 
              type="text" 
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Crypto, Side Hustle"
              className="w-full p-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 focus:border-blue-500/50 focus:bg-blue-500/5 outline-none transition-all"
            />
          </div>

          <div className="flex gap-3 pt-2">
            {/* SAVE BUTTON */}
            <button 
              type="submit" 
              disabled={!name.trim()}
              className="flex-1 py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-blue-500/20"
            >
              {editData ? 'Save Changes' : 'Create Wallet'}
            </button>

            {/* DELETE BUTTON (Only in Edit Mode) */}
            {editData && (
              <button 
                type="button" 
                onClick={handleDelete}
                className="p-3 rounded-xl text-red-400 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 transition-all"
                title="Delete Wallet"
              >
                <Trash2 size={20} />
              </button>
            )}
          </div>
        </form>
      </motion.div>
    </div>,
    document.body
  );
};

export default AddWalletModal;