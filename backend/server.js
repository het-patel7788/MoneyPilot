require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const Transaction = require('./models/Transaction');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB Error:', err));


app.get('/', (req, res) => res.send('MoneyPilot Online ✈️'));

// GET Stats (Smart Filter)
app.get('/api/stats', async (req, res) => {
  try {
    const walletType = req.query.wallet; // Check if frontend sent ?wallet=business
    
    let query = {};
    // If a specific wallet is requested, filter by it. 
    // If NO wallet is requested (Wallet 0), query stays empty {} (Find All)
    if (walletType && walletType !== 'home') {
      query = { wallet: walletType };
    }

    // 1. Get transactions based on the filter
    const transactions = await Transaction.find(query).sort({ createdAt: -1 });
    
    // 2. Calculate Total for THIS view only
    const totalAmount = transactions.reduce((acc, item) => acc + item.amount, 0);

    res.json({ 
      netWorth: totalAmount, 
      transactions: transactions 
    });
  } catch (error) {
    res.status(500).json({ error: 'Server Error' });
  }
});

app.post('/api/transaction', async (req, res) => {
  try {
    const newTx = await Transaction.create(req.body);
    console.log("New Transaction Added:", newTx.text);
    res.status(201).json(newTx);
  } catch (error) {
    res.status(400).json({ error: 'Failed to add transaction' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));