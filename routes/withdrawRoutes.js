/*const express = require('express');
const router = express.Router();
const WithdrawalRequest = require('../models/WithdrawalRequest');
const User = require('../models/User');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');

// Route to request a withdrawal
router.post('/request', authMiddleware, async (req, res) => {
    const { amount } = req.body;
    console.log('Received withdrawal request:', { userId: req.user.id, amount });

    try {
        const user = await User.findById(req.user.id); // Get user ID from token
        if (!user) {
            console.error('User not found:', req.user.id);
            return res.status(404).json({ msg: 'User not found' });
        }

        if (user.coins < amount) {
            console.error('Insufficient balance for withdrawal:', { userId: user._id, coins: user.coins, amount });
            return res.status(400).json({ msg: 'Insufficient balance' });
        }

        // Create a new withdrawal request
        const newRequest = new WithdrawalRequest({
            user: user._id, // Ensure proper referencing to the User schema
            amount,
            status: 'Pending',
        });
        await newRequest.save();

        console.log('Withdrawal request saved:', newRequest);

        res.status(201).json({
            msg: 'Withdrawal request created successfully',
            request: newRequest,
        });

    } catch (error) {
        console.error('Error creating withdrawal request:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Route for admin to view all withdrawal requests
router.get('/admin/requests', authMiddleware, adminMiddleware, async (req, res) => {
    console.log('Fetching pending withdrawal requests');
    try {
        const requests = await WithdrawalRequest.find({ status: 'Pending' }).populate('user', 'username email'); // Populating user details
        console.log('Pending requests fetched:', requests);
        res.status(200).json(requests);
    } catch (error) {
        console.error('Error fetching withdrawal requests:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// Route for admin to approve or reject a withdrawal request
router.post('/admin/update', authMiddleware, adminMiddleware, async (req, res) => {
    const { requestId, action } = req.body; // action: "approve" or "reject"

    try {
        const request = await WithdrawalRequest.findById(requestId);
        if (!request || request.status !== 'Pending') {
            return res.status(400).json({ msg: 'Invalid or already processed request' });
        }

        const user = await User.findById(request.user); // Ensure user details are fetched
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        if (action === 'approve') {
            // Mark request as completed
            request.status = 'Completed';
            request.completedDate = new Date();
            await request.save();

            // Deduct the amount from the user's balance
            user.coins -= request.amount;
            await user.save();

            res.status(200).json({ msg: 'Withdrawal request approved successfully' });
        } else if (action === 'reject') {
            // Mark request as rejected
            request.status = 'Rejected';
            request.rejectedDate = new Date();
            await request.save();

            res.status(200).json({ msg: 'Withdrawal request rejected successfully' });
        } else {
            res.status(400).json({ msg: 'Invalid action' });
        }
    } catch (error) {
        console.error('Error processing withdrawal request:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

// User route to view their own withdrawal requests
router.get('/my-requests', authMiddleware, async (req, res) => {
    try {
        const requests = await WithdrawalRequest.find({ user: req.user.id }).sort({ createdDate: -1 });
        res.status(200).json(requests);
    } catch (error) {
        console.error('Error fetching user withdrawal requests:', error);
        res.status(500).json({ msg: 'Server error' });
    }
});

module.exports = router;  */
