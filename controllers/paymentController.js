const Razorpay = require('razorpay');
const User = require('../models/User');
const Withdraw = require('../models/Withdraw');
const { sendVerificationEmail } = require('../services/emailService'); // Assuming you have email service
const crypto = require('crypto');

// Initialize Razorpay instance with your API credentials
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,      // Your Razorpay Key ID
    key_secret: process.env.RAZORPAY_SECRET,  // Your Razorpay Secret Key
});

// UPI Payout Function
exports.razorpayPayout = async (req, res) => {
    const { upiId, amount, name, email } = req.body;

    try {
        // Find the user initiating the payout
        const user = await User.findById(req.user.id);

        // Check if user has enough earnings for the withdrawal
        if (!user || user.totalEarnings < amount) {
            return res.status(400).json({ msg: 'Insufficient balance for withdrawal.' });
        }

        // Deduct the payout amount from user totalEarnings
        user.totalEarnings -= amount;
        await user.save();

        // Create the Razorpay payout
        const payout = await razorpay.payouts.create({
            account_number: 'Your_Admin_Account_Number', // Razorpay merchant account
            amount: amount * 100, // Amount in paisa (e.g., ₹1 = 100 paisa)
            currency: 'INR',
            mode: 'UPI',
            purpose: 'withdrawal',
            queue_if_low_balance: true,
            reference_id: 'txn_' + Date.now(),
            beneficiary: {
                vpa: upiId, // UPI ID of the user requesting the payout
                email: email, // User's email
                name: name // User's name
            }
        });

        // Save the withdrawal request to the database
        const newWithdraw = new Withdraw({
            userId: req.user.id,
            amount,
            status: 'pending',
            payoutId: payout.id, // Store Razorpay payout ID for reference
            isVerified: true // Assuming UPI is instant and doesn't need further verification here
        });
        await newWithdraw.save();

        // Send response to client
        res.status(200).json({ success: true, message: 'Payout initiated successfully', payout });
    } catch (error) {
        console.error('Error processing Razorpay UPI payout:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
