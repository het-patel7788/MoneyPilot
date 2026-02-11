const express = require('express');
const router = express.Router();
const mongoose = require('mongoose'); 
const { requireAuth } = require('@clerk/express'); // <--- 1. IMPORT THE GUARD
const Transaction = require('../models/Transaction');

// Helper: Basic Sanitization
const sanitize = (str) => {
  if (!str) return '';
  return str.trim().replace(/[<>"']/g, '').substring(0, 200);
};

// ==========================================
// 1. STANDARD ROUTES (SECURED)
// ==========================================

// GET ALL TRANSACTIONS (Only for the logged-in user)
router.get('/', requireAuth(), async (req, res) => { // <--- 2. ADD THE GUARD
  try {
    const { userId } = req.auth; // <--- 3. GET USER ID FROM TOKEN
    
    // Find transactions ONLY for this user
    const transactions = await Transaction.find({ userId }).sort({ date: -1, createdAt: -1 });
    
    return res.status(200).json({ success: true, count: transactions.length, data: transactions });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// CREATE TRANSACTION (Stamped with User ID)
router.post('/', requireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth; // <--- GET USER ID
    const { amount, type, date, deductFromWallet, imageUrl } = req.body;
    
    const text = sanitize(req.body.text) || 'Untitled Transaction';
    const category = sanitize(req.body.category) || 'General';
    const wallet = sanitize(req.body.wallet) || 'personal';

    const mainTransaction = await Transaction.create({
      userId, // <--- SAVE USER ID
      text,
      amount,
      type,
      category,
      wallet,
      date: date || new Date(),
      imageUrl: imageUrl, 
      rootId: null
    });

    if (type === 'investment' && deductFromWallet === true) {
      await Transaction.create({
        userId, // <--- SAVE USER ID HERE TOO
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

// DELETE TRANSACTION (Only if you own it)
router.delete('/:id', requireAuth(), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }

    // Find transaction AND verify ownership
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.auth.userId });
    
    if (!transaction) return res.status(404).json({ success: false, error: 'Not found or unauthorized' });
    
    // --- 1. SMART SAFETY CHECK ---
    const hasRollover = await Transaction.findOne({ 
      parentId: req.params.id, 
      userId: req.auth.userId, // Check ownership
      type: 'investment',   
      status: 'active'      
    });

    if (hasRollover) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot delete: This investment has a future rollover. Delete the newest record first.' 
      });
    }

    // --- 2. BULLETPROOF CLEANUP ---
    await Transaction.deleteMany({ parentId: transaction._id, userId: req.auth.userId });

    // --- 3. DELETE MAIN RECORD ---
    await transaction.deleteOne();
    
    return res.status(200).json({ success: true, data: {} });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, error: 'Server Error' });
  }
});

// UPDATE TRANSACTION (Only if you own it)
router.put('/:id', requireAuth(), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ success: false, error: 'Invalid ID format' });
    }

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

    // FIND AND UPDATE (With Ownership Check)
    const updatedTransaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.auth.userId }, // <--- OWNERSHIP CHECK
      updates, 
      { new: true, runValidators: true }
    );
    
    if (!updatedTransaction) return res.status(404).json({ success: false, error: "Not found or unauthorized" });
    res.status(200).json({ success: true, data: updatedTransaction });
  } catch (err) {
    res.status(500).json({ success: false, error: "Server Error" });
  }
});

// ==========================================
// 2. THE EXIT LOGIC (SECURED)
// ==========================================

router.post('/withdraw', requireAuth(), async (req, res) => {
  try {
    const { userId } = req.auth; // <--- GET USER ID
    const { originalId, withdrawAmount, remainingAmount, totalValue } = req.body; 

    // VALIDATION
    if (!originalId || !mongoose.Types.ObjectId.isValid(originalId)) {
      return res.status(400).json({ success: false, error: 'Invalid Investment ID' });
    }
    if (Math.abs((withdrawAmount + remainingAmount) - totalValue) > 0.01) {
       return res.status(400).json({ success: false, error: 'Math Error: Withdraw + Remaining must equal Total' });
    }

    // Find Original (Verify Ownership)
    const original = await Transaction.findOne({ _id: originalId, userId });
    
    if (!original) return res.status(404).json({ success: false, error: 'Investment not found or unauthorized' });
    
    if (original.status === 'closed') {
      return res.status(400).json({ success: false, error: 'Transaction Failed: This investment is already closed.' });
    }

    const rootReference = original.rootId || original._id;
    const originalPrincipal = Math.abs(original.amount);
    const isLoss = totalValue < originalPrincipal; 
    
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

    // --- 3. CREATE LOG (With userId) ---
    if (withdrawAmount > 0) {
      await Transaction.create({
        userId, // <--- STAMP USER ID
        text: `${label}: ${logText}`,
        amount: Math.abs(withdrawAmount), 
        wallet: original.wallet,
        category: 'Trade',
        type: 'income',
        date: new Date(), 
        rootId: rootReference,
        parentId: original._id,
        imageUrl: null 
      });
    }

    // --- 4. CLOSE OLD BUCKET ---
    original.status = 'closed';
    original.currentValue = totalValue;
    await original.save();

    // --- 5. CREATE ROLLOVER (With userId) ---
    if (remainingAmount > 0) {
      const originalSign = original.amount >= 0 ? 1 : -1;
      const newText = original.text.includes('(Cont.)') ? original.text : `${original.text} (Cont.)`;
      
      await Transaction.create({
        userId, // <--- STAMP USER ID
        text: newText,
        amount: originalSign * Math.abs(remainingAmount), 
        wallet: original.wallet,
        category: 'Investment',
        type: 'investment',
        status: 'active',
        parentId: original._id,
        rootId: rootReference,
        imageUrl: null, 
        date: original.date 
      });
    }

    res.status(200).json({ success: true });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Server Error' });
  }
});

module.exports = router;