const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Assuming you have a User model

// Get leaderboard data
router.get('/leaderboard', async (req, res) => {
  try {
    // Fetch users sorted by total earnings, limited to top 10 users
    const users = await User.find()
      .sort({ totalEarnings: -1 }) // Sort by total earnings, descending
      .limit(10) // Limit to top 10 users
      .select('username totalEarnings tasksCompleted coins'); // Select necessary fields

    // Check if users are found
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }

    res.json(users);
  } catch (error) {
    console.error(error); // Log the error for debugging
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
