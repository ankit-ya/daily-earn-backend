const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    title: { type: String, required: true }, // Title of the task
    description: { type: String, required: true }, // Detailed description of the task
    reward: { type: Number, required: true }, // Coins awarded for completing the task
    category: { type: String, required: true }, // New field for category
    completedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], // Reference to users who completed this task
    createdAt: { type: Date, default: Date.now }, // Task creation date
});

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
