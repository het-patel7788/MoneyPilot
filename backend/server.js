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

app.get('/api/stats', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    const totalAmount = transactions.reduce((acc, item) => acc + item.amount, 0);

    res.json({ 
      netWorth: totalAmount, 
      count: transactions.length 
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