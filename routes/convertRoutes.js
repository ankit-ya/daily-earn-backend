const express = require('express');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/authMiddleware');
const router = express.Router();

// Convert coins to real money
router.post('/convert', authMiddleware, async (req, res) => {
    const { coinsToConvert } = req.body;

    try {
        const user = await User.findById(req.user.id);

        if (!user) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        if (!coinsToConvert || coinsToConvert <= 0 || isNaN(coinsToConvert)) {
            return res.status(400).json({ msg: 'Invalid coin amount.' });
        }

        const coinValueInRupees = 100; // 100 coins = ₹1
        const rupeesToConvert = coinsToConvert / coinValueInRupees;

        if (coinsToConvert > user.coins) {
            return res.status(400).json({ msg: 'Not enough coins to convert.' });
        }

        // Deduct coins and update earnings
        user.coins -= coinsToConvert;
        user.totalEarnings += rupeesToConvert;

        await user.save();

        console.log("Updated balance in backend:", user.totalEarnings); // Log backend response

        res.status(200).json({
            msg: 'Coins converted successfully',
            amountInRupees: rupeesToConvert,
            updatedBalance: user.totalEarnings, // Return updated balance (real money)
            updatedCoins: user.coins, // Return updated coins
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;  // Ensure you are exporting the router
