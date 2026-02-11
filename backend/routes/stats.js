const express = require('express');
const router = express.Router();
const { requireAuth } = require('@clerk/express'); // <--- 1. IMPORT GUARD
const Transaction = require('../models/Transaction');

// @route   GET /api/stats (SECURED)
router.get('/', requireAuth(), async (req, res) => { // <--- 2. ADD GUARD
    try {
        const { userId } = req.auth; // <--- 3. GET USER ID
        const wallet = req.query.wallet || 'personal';

        // 4. FILTER BY USER ID (Critical Fix)
        // Only find transactions that match BOTH the wallet AND the user
        const transactions = await Transaction.find({ 
            wallet: wallet, 
            userId: userId 
        });

        // 1. CASH BALANCE (Liquid)
        const cashBalance = transactions.reduce((acc, item) => {
            if (item.status === 'closed') return acc;
            if (item.type === 'income') return acc + item.amount;
            if (item.type === 'expense') return acc + item.amount;
            return acc; // Investments don't count as cash
        }, 0);

        // 2. ASSET VALUE (Locked)
        const assetValue = transactions.reduce((acc, item) => {
            if (item.status === 'closed') return acc;
            if (item.type === 'investment') {
                // If we have an updated value, use it. Otherwise, use cost basis.
                const val = item.currentValue || item.amount; 
                return acc + Math.abs(val);
            }
            return acc;
        }, 0);

        const netWorth = cashBalance + assetValue;

        return res.status(200).json({
            success: true, 
            cashBalance,
            assetValue,
            netWorth,
            transactions
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, error: 'Server Error' });
    }
});

module.exports = router;