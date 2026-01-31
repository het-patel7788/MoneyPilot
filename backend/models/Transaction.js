const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
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
  rootId: { // <--- NEW FIELD: Points to the original investment
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    default: null
  },
  
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// INDEXING (For Speed)
TransactionSchema.index({ wallet: 1, type: 1 });
TransactionSchema.index({ rootId: 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);