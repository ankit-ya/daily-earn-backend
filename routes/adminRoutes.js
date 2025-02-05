const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const Task = require('../models/Task');
const Withdraw = require('../models/Withdraw');
const User = require('../models/User');
const Notification = require('../models/Notification'); // Notification model

require('dotenv').config();


// Send notification to all users (admin-only route)
// Send notification to all users (admin-only route)
router.post('/send-notification',authMiddleware, adminMiddleware, async (req, res) => {
  const { message } = req.body;
  console.log('Notification message:', message); // Log message

  if (!message) {
      return res.status(400).json({ msg: 'Notification message is required' });
  }

  try {
      // Create a new notification with userType set to 'user'
      const notification = new Notification({ message});
      await notification.save();

      // Emit the notification to all connected users via WebSocket
      req.io.emit('notification', { message}); // Emit with userType

      res.status(201).json({ msg: 'Notification sent to all users' });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Server error' });
  }
});



// Task Management Routes
router.post('/tasks/bulk', authMiddleware, adminMiddleware, async (req, res) => {
  const tasks = req.body.tasks; // Expecting an array of task objects
  console.log('Received tasks:', tasks); // Log the received tasks

  // Check if tasks is an array and has at least one task
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return res.status(400).json({ msg: 'A non-empty array of tasks is required' });
  }

  // Validate that each task has title, description, reward, and category
  const invalidTasks = tasks.filter(task => !task.title || !task.description || !task.reward || !task.category);

  if (invalidTasks.length > 0) {
    return res.status(400).json({ msg: 'All tasks must have title, description, reward, and category fields' });
  }

  try {
    // Use insertMany to create multiple tasks in one operation, including the category field
    const createdTasks = await Task.insertMany(tasks);
    res.status(201).json({ msg: 'Tasks created successfully', tasks: createdTasks });
  } catch (error) {
    console.error('Error while adding tasks:', error); // Log detailed error
    res.status(500).json({ error: 'Server error' });
  }
});

// Get all tasks (Admin view) with optional category filtering
router.get('/tasks', authMiddleware, adminMiddleware, async (req, res) => {
  const { category } = req.query; // Get the category from query parameters

  try {
    // If a category is provided, filter by that category; otherwise, return all tasks
    const filter = category ? { category } : {};
    const tasks = await Task.find(filter);
    res.json(tasks);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});


// Update a task by ID
router.put('/tasks/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { title, description, reward } = req.body;

  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, reward },
      { new: true, runValidators: true }
    );

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    res.json(task);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Delete a task by ID
router.delete('/tasks/:id', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);

    if (!task) {
      return res.status(404).json({ msg: 'Task not found' });
    }

    res.json({ msg: 'Task deleted successfully' });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Withdrawal Management Routes
// Get all withdrawal requests
router.get('/withdrawals', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    const withdrawals = await Withdraw.find(); // Assuming you have a Withdraw model
    res.json(withdrawals);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Approve or reject a withdrawal request by ID
router.put('/withdrawals/:id', authMiddleware, adminMiddleware, async (req, res) => {
  const { status } = req.body;

  try {
    const withdrawal = await Withdraw.findById(req.params.id);

    if (!withdrawal) {
      return res.status(404).json({ msg: 'Withdrawal not found' });
    }

    withdrawal.status = status; // Update the status
    await withdrawal.save();

    res.json(withdrawal);
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

// Admin route to get all users and their referral info
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
  try {
    // Fetch all users, selecting specific fields related to referrals and rewards
    const users = await User.find().select('username referralCode referredBy referralCount rewardsEarned');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


// Admin route to update user rewards
router.post('/update-rewards', authMiddleware, adminMiddleware, async (req, res) => {
  const { userId, rewardAmount } = req.body;

  try {
    // Find the user by ID
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    // Update the user's rewards
    user.rewardsEarned += rewardAmount;
    await user.save();

    res.json({ msg: 'Rewards updated successfully', user });
  } catch (error) {
    console.error('Error updating rewards:', error);
    res.status(500).json({ error: 'Server error' });
  }
});


module.exports = router;
