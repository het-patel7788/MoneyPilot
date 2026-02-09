const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); 
const Transaction = require('../models/Transaction');

// Helper: Basic Sanitization
const sanitize = (str) => str ? str.trim().substring(0, 200) : '';

// ==========================================
// 1. STANDARD ROUTES
// ==========================================

router.get('/', async (req, res) => {
  try {
    const transactions = await Transaction.find().sort({ date: -1, createdAt: -1 });
    return res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

router.post('/', async (req, res) => {
  try {
    // 1: ADD imageUrl TO THIS LIST
    const { amount, type, date, deductFromWallet, imageUrl } = req.body;
    
    const text = sanitize(req.body.text) || 'Untitled Transaction';
    const category = sanitize(req.body.category) || 'General';
    const wallet = sanitize(req.body.wallet) || 'personal';

    const mainTransaction = await Transaction.create({
      text,
      amount,
      type,
      category,
      wallet,
      date: date || new Date(),
      imageUrl: imageUrl, // 2: SAVE IT TO DATABASE
      rootId: null
    });

    if (type === 'investment' && deductFromWallet === true) {
      await Transaction.create({
        text: `Transfer to ${text}`,
        amount: -Math.abs(amount),   
        type: 'expense',             
        category: 'Transfer',        
        wallet: wallet,
        date: date || new Date(),
        parentId: mainTransaction._id,
        rootId: mainTransaction._id
      });
    }

    return res.status(201).json({ success: true, data: mainTransaction });
  } catch (err) {
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(val => val.message);
      return res.status(400).json({ success: false, error: messages });
    } else {
      console.error(err);
      return res.status(500).json({ success: false, error: 'Server Error' });
    }
  }
});

router.delete('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }

    const transaction = await Transaction.findById(req.params.id);
    if (!transaction) return res.status(404).json({ success: false, error: 'Not found' });
    
    const hasChildren = await Transaction.findOne({ parentId: req.params.id });
    if (hasChildren) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete: This has dependent records (rollovers). Delete them first.' 
      });
    }

    if (transaction.type === 'investment') {
      await Transaction.deleteMany({ 
        parentId: transaction._id, 
        category: 'Transfer' 
      });
    }

    await transaction.deleteOne();
    return res.status(200).json({ success: true, data: {} });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

router.put('/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }

    // 3: ALLOW imageUrl TO BE UPDATED
    const allowedUpdates = ['text', 'amount', 'wallet', 'category', 'date', 'imageUrl'];
    const updates = {};
    
    allowedUpdates.forEach(field => {
      if (req.body[field] !== undefined) {
        if (field === 'text' || field === 'category' || field === 'wallet') {
           updates[field] = sanitize(req.body[field]);
        } else {
           updates[field] = req.body[field];
        }
      }
    });

    const updatedTransaction = await Transaction.findByIdAndUpdate(
      req.params.id, updates, { new: true, runValidators: true }
    );
    
    if (!updatedTransaction) return res.status(404).json({ success: false, error: "Not found" });
    res.status(200).json({ success: true, data: updatedTransaction });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// ==========================================
// 2. THE EXIT LOGIC (FINAL: NARRATIVE STYLE)
// ==========================================

router.post('/withdraw', async (req, res) => {
  try {
    // 1. REMOVE 'imageUrl' from input (Frontend won't send it anymore)
    const { originalId, withdrawAmount, remainingAmount, totalValue } = req.body; 

    // VALIDATION
    if (!originalId || !mongoose.Types.ObjectId.isValid(originalId)) {
      return res.status(400).json({ success: false, error: 'Invalid Investment ID' });
    }
    // Check Math (allow 1 cent variance)
    if (Math.abs((withdrawAmount + remainingAmount) - totalValue) > 0.01) {
       return res.status(400).json({ success: false, error: 'Math Error: Withdraw + Remaining must equal Total' });
    }

    const original = await Transaction.findById(originalId);
    if (!original) return res.status(404).json({ success: false, error: 'Investment not found' });
    
    if (original.status === 'closed') {
      return res.status(400).json({ success: false, error: 'Transaction Failed: This investment is already closed.' });
    }

    const rootReference = original.rootId || original._id;
    const originalPrincipal = Math.abs(original.amount);
    const isLoss = totalValue < originalPrincipal; 
    
    // --- NARRATIVE LOGIC ---
    const valStory = `($${Math.round(originalPrincipal)} ➔ $${Math.round(totalValue)})`;
    
    let splitStory = '';
    if (remainingAmount > 0) {
        splitStory = ` • Cash: $${Math.round(withdrawAmount)} | Active: $${Math.round(remainingAmount)}`;
    } else {
        splitStory = ` • Cash Out: $${Math.round(withdrawAmount)}`;
    }

    const logText = `${original.text} ${valStory}${splitStory}`;

    let label = 'Strategy Exit';
    if (remainingAmount > 0) label = 'Strategy Yield';
    if (isLoss) label = 'Strategy Loss'; 

    // --- 3. CREATE LOG (The Cash / Profit) ---
    if (withdrawAmount > 0) {
      await Transaction.create({
        text: `${label}: ${logText}`,
        amount: Math.abs(withdrawAmount), 
        wallet: original.wallet,
        category: 'Trade',
        type: 'income',
        date: new Date(), 
        rootId: rootReference,
        parentId: original._id,
        
        // FIX: No Receipt for "Cash Out" logs. 
        imageUrl: null 
      });
    }

    // --- 4. CLOSE OLD BUCKET ---
    original.status = 'closed';
    original.currentValue = totalValue;
    await original.save();

    // --- 5. CREATE ROLLOVER (The Remaining Asset) ---
    if (remainingAmount > 0) {
      const originalSign = original.amount >= 0 ? 1 : -1;
      const newText = original.text.includes('(Cont.)') ? original.text : `${original.text} (Cont.)`;
      
      await Transaction.create({
        text: newText,
        amount: originalSign * Math.abs(remainingAmount), 
        wallet: original.wallet,
        category: 'Investment',
        type: 'investment',
        status: 'active',
        parentId: original._id,
        rootId: rootReference,
        
        // FIX: Stop Inheritance. New active card has NO receipt.
        imageUrl: null, 
        
        date: original.date // Keep original date for sorting
      });
    }

    res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;