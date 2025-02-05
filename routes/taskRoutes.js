const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Import your User model
const Task = require('../models/Task'); // Import your Task model
const { authMiddleware } = require('../middleware/authMiddleware'); // Import your auth middleware

// Get all tasks
router.get('/', async (req, res) => {
    try {
        const tasks = await Task.find(); // Fetch all tasks from the database
        res.json(tasks);
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).send('Server error');
    }
});

// Create a new task (admin-only route)
router.post('/create', authMiddleware, async (req, res) => {
    const { title, description, coins, category } = req.body; // Include category

    try {
        const newTask = new Task({ title, description, coins, category }); // Include category
        await newTask.save();
        res.status(201).json({ message: 'Task created successfully', task: newTask });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).send('Server error');
    }
});

// Get a specific task by ID
router.get('/:id', async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).send('Task not found');
        res.json(task);
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).send('Server error');
    }
});

// Get tasks by category
router.get('/category/:category', async (req, res) => {
    try {
        const tasks = await Task.find({ category: req.params.category });
        res.json(tasks);
    } catch (err) {
        console.error('Error fetching tasks by category:', err);
        res.status(500).send('Server error');
    }
});

//Start a task (new route to allow users to start tasks)
router.post('/start/:taskId', authMiddleware, async (req, res) => {
    const { taskId } = req.params;

    try {
        const task = await Task.findById(taskId);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }

        // Here, you can add any logic for starting a task, such as navigating to instructions
        res.status(200).json({ message: 'Task started successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

  router.post('/submit/:id', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    try {
        const task = await Task.findById(req.params.id);
        if (!task) {
            return res.status(404).json({ message: 'Task not found' });
        }
 
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
 
        if (user.completedTasks.includes(task._id)) {
            return res.status(400).json({ message: 'Task already completed' });
        }
 
        user.completedTasks.push(task._id);
        user.coins += task.reward;
        user.tasksCompleted += 1;
 
        await user.save();
 
        res.status(200).json({
            message: 'Task completed successfully',
            reward: task.reward, // Ensure reward is sent
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
 }); 

  
module.exports = router;
