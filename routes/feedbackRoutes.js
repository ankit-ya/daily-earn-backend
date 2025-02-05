const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback'); // Import Feedback model

// Route to submit feedback
router.post('/', async (req, res) => {
  const { feedback , email} = req.body;

  if (!feedback || !email) {
    return res.status(400).json({ message: 'Feedback and email is required!' });
  }

  try {
    const newFeedback = new Feedback({ feedback,email });
    await newFeedback.save(); // Save feedback to the database
    res.status(200).json({ message: 'Feedback submitted successfully!' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// Route to retrieve all feedbacks (for admin)
router.get('/', async (req, res) => {
  try {
    const feedbacks = await Feedback.find({}, 'email feedback createdAt'); // Get all feedback from the database
    res.json(feedbacks);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

module.exports = router;
