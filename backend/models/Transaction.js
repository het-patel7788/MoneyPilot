const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  // --- NEW SECURITY FIELD ---
  userId: {
    type: String,
    required: true, // Every transaction MUST belong to someone
    index: true     // Makes searching by user extremely fast
  },
  // --------------------------

  text: {
    type: String,
    trim: true,
    required: [true, 'Please add some text']
  },
  amount: {
    type: Number,
    required: [true, 'Please add a positive or negative number']
  },
  wallet: {
    type: String,
    required: true,
    default: 'personal'
  },
  category: {
    type: String,
    default: 'General'
  },
  date: {
    type: Date,
    default: Date.now
  },
  type: {
    type: String,
    enum: ['income', 'expense', 'investment'],
    default: 'expense'
  },
  status: {
    type: String,
    enum: ['active', 'closed'],
    default: 'active'
  },
  currentValue: {
    type: Number,
    default: 0
  },
  // LINKING FIELDS
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    default: null
  },
  rootId: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    default: null
  },
  imageUrl: {
    type: String, 
    required: false
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// INDEXING (For Speed)
// We add userId to the index so queries like "Find My Business Expenses" are instant
TransactionSchema.index({ userId: 1, wallet: 1, type: 1 });
TransactionSchema.index({ rootId: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);