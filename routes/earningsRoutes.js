const express = require('express');
const router = express.Router();
const Earnings = require('../models/Earnings');
const Transaction = require('../models/Transaction');
const Withdraw = require('../models/Withdraw'); // Make sure to import Withdraw
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware'); 

// Add earnings (accessible to authenticated users)
router.post('/earnings', authMiddleware, async (req, res) => {
  try {
    const { amount } = req.body;

    // Ensure amount is provided
    if (amount === undefined || amount === null) {
      return res.status(400).json({ message: 'Amount is required' });
    }

    // Create new earnings
    const earnings = new Earnings({ userId: req.user.id, amount });
    await earnings.save();

    res.status(201).json({ message: 'Earnings added successfully', earnings }); // Include earnings object in the response
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
});

// Get earnings by user (accessible to authenticated users)
// Get earnings by user (accessible to authenticated users)
router.get('/earnings', authMiddleware, async (req, res) => {
  try {
    const earnings = await Earnings.find({ userId: req.user.id });

    // Check if any earnings were found
    if (earnings.length === 0) {
      return res.status(404).json({ message: 'No earnings found for this user' });
    }

    res.json(earnings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
});


// Example Admin-only route (accessible to admins only)
router.get('/admin/earnings', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const allEarnings = await Earnings.find();  // Admin can view all earnings
    res.json(allEarnings);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error, please try again later' });
  }
});


router.get('/transaction-history', authMiddleware, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json(transactions);
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    res.status(500).json({ error: 'Server error' });
  }
});



// Ensure proper route registration in Server.js
module.exports = router;
