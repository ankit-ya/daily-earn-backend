const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification'); // Notification model
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware'); // Import middlewares

// Send notification to all users (admin-only route)
/*router.post('/send-notification', adminMiddleware, async (req, res) => {
    const { message } = req.body;
    try {
        const notification = new Notification({ message });
        await notification.save();

        // Emit the notification to all connected users via WebSocket
        req.io.emit('notification', { message });

        res.status(201).json({ msg: 'Notification sent to all users' });
    } catch (error) {
        console.error(error); // Log the error for debugging
        res.status(500).json({ error: 'Server error' });
    }
}); */

// Get all notifications for the authenticated user
// Get all notifications for the authenticated user
router.get('/notifications', authMiddleware, async (req, res) => {
    try {
        const notifications = await Notification.find(); // Filter by userType
        console.log('Fetched notifications:', notifications); // Log notifications

        if (!notifications.length) {
            return res.status(404).json({ message: 'No notifications found' });
        }

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:',error); // Log the error for debugging
        res.status(500).json({ error: 'Server error' });
    }
});
module.exports = router;
