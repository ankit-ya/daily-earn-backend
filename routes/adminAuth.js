const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET;

// Admin Registration Route (protected by secret)
// In backend routes/admin.js (Admin Registration Route)
router.post('/register', async (req, res) => {
    const { username, email, password, secret } = req.body;
  
    if (secret !== process.env.ADMIN_REGISTRATION_SECRET) {
      return res.status(403).json({ msg: 'Unauthorized: Invalid secret' });
    }
  
    try {
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ msg: 'Admin already exists' });
      }
  
      // Middleware will hash password automatically, no need for manual hashing
      user = new User({ username, email, password, isAdmin: true });
      await user.save();
  
      res.status(201).json({ msg: 'Admin registered successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  });
  

// Admin Login Route
// Admin Login Route (Ensure bcrypt.compare works correctly)
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    if (!email || !password) {
      return res.status(400).json({ msg: 'Please provide both email and password' });
    }
  
    try {
      const user = await User.findOne({ email, isAdmin: true });
      if (!user) {
        return res.status(404).json({ msg: 'Admin not found' });3
        
      }
  
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ msg: 'Invalid credentials' });
      }
  
      const token = jwt.sign({ id: user._id, isAdmin: user.isAdmin }, JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, user: { username: user.username, isAdmin: user.isAdmin } });
    } catch (error) {
      console.error(error);
      res.status(500).json({ msg: 'Server error' });
    }
  });
  
  
  
module.exports = router;
