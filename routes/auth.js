const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { authMiddleware } = require('../middleware/authMiddleware');

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ msg: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded.id; // Correctly set the user ID from decoded token
    next();
  } catch (error) {
    res.status(400).json({ msg: 'Invalid token' });
  }
};

// Function to generate a unique referral code
const generateReferralCode = (userId) => {
  const randomString = Math.random().toString(36).substring(2, 8); // Generate a random string
  return `${userId}-${randomString}`; // Combine user ID with random string
};


// Register route
router.post('/register', async (req, res) => {
  const { username, email, password,referralCode } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    const newUser = new User({ username, email, password });
    newUser.referralCode = generateReferralCode(newUser._id);//generate refferal code
    if (referralCode) {
      const referrer = await User.findOne({ referralCode });
      if (referrer) {
        newUser.referredBy = referrer._id;
        referrer.referralCount += 1; // Increment referrer count
        await referrer.save(); // Save referrer
      }
    }
    await newUser.save();
    res.status(201).json({ msg: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login route
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    console.log("Attempting to login with email:", email);
    const user = await User.findOne({ email });
    console.log("Found user:", user); // Log the found user
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Provided Password:", password);
    console.log("Stored Hashed Password:", user.password);
    console.log("Password Match:", isMatch);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '1h' });

    res.json({
      token,
      user: {
        username: user.username,
        coins: user.coins,
        totalEarnings: user.totalEarnings,
        isAdmin: user.isAdmin // Include isAdmin in response
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get logged-in user's data
router.get('/user', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Update user data (including optional password change)
router.put('/user', authenticateToken, async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findById(req.user); // Get the user by ID from token
    if (!user) return res.status(404).json({ msg: 'User not found' });

    // Update username if provided
    if (username) user.username = username;

    // Update password if provided
    if (password) {
      user.password = password; // Simply assign the new password, hashing happens in 'pre-save'
    }

    await user.save(); // Save the user, password will be hashed by 'pre-save' middleware
    res.json({ msg: 'User updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
});
router.get('/referral-info', authenticateToken, async (req, res) => {
  try {
      const user = await User.findById(req.user);
      if (!user) return res.status(404).json({ msg: 'User not found' });

      res.json({
          referralCode: user.referralCode,
          referralCount: user.referralCount,
          rewardsEarned: user.rewardsEarned,
          referredUsers: [] // Populate this as needed
      });
  } catch (error) {
      console.error('Error fetching referral info:', error); // Log the error
      res.status(500).json({ message: 'Error fetching referral info' });
  }
});
module.exports = router;
