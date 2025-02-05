const express = require('express');
const { razorpayPayout } = require('../controllers/paymentController');
const router = express.Router();

// Route to handle UPI payout withdrawal
router.post('/upi', razorpayPayout);

module.exports = router;
