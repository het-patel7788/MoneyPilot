import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';
// NEW IMPORTS: Paperclip, Loader, CheckCircle
import { X, TrendingUp, TrendingDown, PiggyBank, Calendar, Tag, FileText, Wallet, Paperclip, Loader, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AddTransactionModal = ({ isOpen, onClose, onSuccess, activeWallet, editData }) => {
  const [type, setType] = useState('expense');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  
  const [deductFromWallet, setDeductFromWallet] = useState(false);
  
  // --- NEW: Image Upload State ---
  const [imageFile, setImageFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  
  const [loading, setLoading] = useState(false);

  // RESET LOGIC
  useEffect(() => {
    if (isOpen) {
      if (editData) {
        setType(editData.amount >= 0 ? (editData.category === 'Investment' ? 'investment' : 'income') : 'expense');
        setAmount(Math.abs(editData.amount));
        setDescription(editData.text);
        setCategory(editData.category);
        setDate(editData.date ? editData.date.split('T')[0] : new Date().toISOString().split('T')[0]);
        setDeductFromWallet(false);
        // Set existing image if editing
        setPreview(editData.imageUrl || null);
      } else {
        setAmount('');
        setDescription('');
        setCategory('');
        setDate(new Date().toISOString().split('T')[0]);
        setDeductFromWallet(false);
        // Reset Image
        setImageFile(null);
        setPreview(null);
      }
      setLoading(false);
      setUploading(false);
    }
  }, [isOpen, editData]);

  const modes = {
    income: { label: 'Income', color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', icon: TrendingUp, placeholder: 'Salary, Freelance...' },
    expense: { label: 'Expense', color: 'text-red-400', bg: 'bg-red-500/10', border: 'border-red-500/20', icon: TrendingDown, placeholder: 'Food, Rent...' },
    investment: { label: 'Investment', color: 'text-purple-400', bg: 'bg-purple-500/10', border: 'border-purple-500/20', icon: PiggyBank, placeholder: 'Stocks, Crypto...' }
  };

  const currentMode = modes[type];

  // --- NEW: Handle File Selection ---
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  // --- NEW: Upload to Cloudinary ---
  const uploadImage = async () => {
    if (!imageFile) return editData?.imageUrl || null;

    try {
      setUploading(true);
      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      
      // 1. Get Signature
      const sigRes = await axios.get(`${API_URL}/api/upload/signature`);
      const { signature, timestamp, folder, apiKey, cloudName } = sigRes.data;

      // 2. Upload to Cloudinary
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('api_key', apiKey);
      formData.append('timestamp', timestamp);
      formData.append('signature', signature);
      formData.append('folder', folder);

      const cloudRes = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData
      );

      return cloudRes.data.secure_url;
    } catch (err) {
      console.error("Upload failed", err);
      alert("Image upload failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!amount) return;

    setLoading(true);

    try {
      // --- NEW: Upload Image First ---
      let uploadedImageUrl = null;
      if (imageFile) {
         uploadedImageUrl = await uploadImage();
      } else if (editData && editData.imageUrl) {
         uploadedImageUrl = editData.imageUrl;
      }

      const targetWallet = activeWallet === 'home' ? 'personal' : activeWallet;

      let finalAmount = parseFloat(amount);
      if (type === 'expense') finalAmount = -Math.abs(finalAmount);
      else finalAmount = Math.abs(finalAmount);

      const payload = {
        text: description || currentMode.label,
        amount: finalAmount,
        wallet: targetWallet,
        category: type === 'investment' ? 'Investment' : (category || 'General'),
        date: date,
        type: type,
        deductFromWallet: type === 'investment' ? deductFromWallet : false,
        imageUrl: uploadedImageUrl // <--- Add URL to payload
      };

      const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

      if (editData) {
        await axios.put(`${API_URL}/api/transaction/${editData._id}`, payload);
      } else {
        await axios.post(`${API_URL}/api/transaction`, payload);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to save:", error);
      alert("Failed to save. Is the server running?");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-md bg-[#0f172a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative"
      >
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors z-10"><X size={20} /></button>

        <div className="p-4 text-center border-b border-white/5">
          <h2 className="text-white font-bold">{editData ? 'Edit Transaction' : 'New Transaction'}</h2>
        </div>

        {/* TABS */}
        <div className="flex border-b border-white/10 pr-12">
          {Object.keys(modes).map((modeKey) => {
            const mode = modes[modeKey];
            const isActive = type === modeKey;
            return (
              <button
                key={modeKey}
                type="button"
                onClick={() => setType(modeKey)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-medium transition-all duration-300 relative ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-300'}`}
              >
                <mode.icon size={18} className={isActive ? mode.color : ''} />
                {mode.label}
                {isActive && <motion.div layoutId="active-tab" className={`absolute bottom-0 left-0 right-0 h-0.5 ${mode.bg.replace('/10', '')}`} />}
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* AMOUNT INPUT + PAPERCLIP BUTTON */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-400 uppercase tracking-wider">Amount</label>
            <div className={`relative flex items-center p-4 rounded-xl border ${currentMode.bg} ${currentMode.border}`}>
              <span className={`text-2xl font-bold mr-2 ${currentMode.color}`}>$</span>
              <input type="number" step="0.01" autoFocus value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" className="w-full bg-transparent text-3xl font-bold text-white placeholder-white/20 outline-none" />
              
              {/* --- NEW: Paperclip Icon --- */}
              <div className="shrink-0 ml-2">
                 <label className={`cursor-pointer flex items-center justify-center w-10 h-10 rounded-full transition-all ${preview ? 'bg-white/10 text-emerald-400 ring-2 ring-emerald-500/50' : 'bg-black/20 text-slate-400 hover:bg-black/40 hover:text-white'}`}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleFileSelect} 
                    />
                    {preview ? (
                        <div className="relative w-full h-full rounded-full overflow-hidden">
                            <img src={preview} alt="Receipt" className="w-full h-full object-cover opacity-80 hover:opacity-100" />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <CheckCircle size={16} className="text-emerald-400 drop-shadow-md" />
                            </div>
                        </div>
                    ) : (
                        <Paperclip size={20} />
                    )}
                 </label>
              </div>
            </div>
          </div>

          {/* INSIDE MONEY TOGGLE */}
          <AnimatePresence>
            {type === 'investment' && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div 
                  onClick={() => setDeductFromWallet(!deductFromWallet)}
                  className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${deductFromWallet ? 'bg-indigo-500/20 border-indigo-500/50' : 'bg-slate-800/50 border-white/5'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${deductFromWallet ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                      <Wallet size={18} />
                    </div>
                    <div>
                      <p className={`text-sm font-bold ${deductFromWallet ? 'text-indigo-300' : 'text-slate-300'}`}>
                        {deductFromWallet ? 'Using Inside Money' : 'Using Outside Money'}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {deductFromWallet ? 'Deduct from Dashboard Balance' : 'Cash from pocket / External'}
                      </p>
                    </div>
                  </div>
                  
                  <div className={`w-10 h-5 rounded-full relative transition-colors ${deductFromWallet ? 'bg-indigo-500' : 'bg-slate-700'}`}>
                    <div className={`absolute top-1 left-1 w-3 h-3 bg-white rounded-full transition-transform ${deductFromWallet ? 'translate-x-5' : 'translate-x-0'}`} />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Date</label>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                <Calendar size={16} className="text-slate-400" />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full bg-transparent text-sm text-white outline-none [color-scheme:dark]" />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs text-slate-400">Category</label>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                <Tag size={16} className="text-slate-400" />
                <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="General" className="w-full bg-transparent text-sm text-white outline-none" />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs text-slate-400">Description</label>
            <div className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
              <FileText size={16} className="text-slate-400" />
              <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} placeholder={currentMode.placeholder} className="w-full bg-transparent text-sm text-white outline-none" />
            </div>
          </div>

          <button
            type="submit"
            disabled={!amount || loading}
            className={`w-full py-3 rounded-xl font-bold text-white shadow-lg transition-all transform active:scale-95 flex items-center justify-center gap-2 ${!amount || loading ? 'opacity-50 cursor-not-allowed bg-slate-700' : `${currentMode.bg.replace('/10', '')} hover:brightness-110`}`}
          >
            {loading ? <Loader className="animate-spin" size={20} /> : null}
            {loading ? (uploading ? 'Uploading Image...' : 'Saving...') : (editData ? 'Update Transaction' : `Add ${currentMode.label}`)}
          </button>
        </form>
      </motion.div>
    </div>,
    document.body
  );
};

export default AddTransactionModal;