const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// @route   GET /api/stats
router.get('/', async (req, res) => {
    try {
        const wallet = req.query.wallet || 'personal';
        const transactions = await Transaction.find({ wallet: wallet });

        // 1. CASH BALANCE (Liquid)
        const cashBalance = transactions.reduce((acc, item) => {
            if (item.status === 'closed') return acc;
            if (item.type === 'income') return acc + item.amount;
            if (item.type === 'expense') return acc + item.amount;
            return acc;
        }, 0);

        // 2. ASSET VALUE (Locked)
        const assetValue = transactions.reduce((acc, item) => {
            if (item.status === 'closed') return acc;
            if (item.type === 'investment') {
                const val = item.currentValue || item.amount;
                return acc + Math.abs(val);
            }
            return acc;
        }, 0);

        const netWorth = cashBalance + assetValue;

        return res.status(200).json({
            success: true, // Standardized response
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