const mongoose = require('mongoose');

const WithdrawalRequestSchema = new mongoose.Schema({
    user: { // Changed from userId to user for proper referencing
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to User model
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    upiId: { // New field for UPI ID
        type: String,
        required: true, // Ensure UPI ID is mandatory
    },
    status: {
        type: String,
        enum: ['Pending', 'Completed', 'Rejected'],
        default: 'Pending',
    },
    requestDate: {
        type: Date,
        default: Date.now,
    },
    completedDate: {
        type: Date,
    },
});

const WithdrawalRequest = mongoose.model('WithdrawalRequest', WithdrawalRequestSchema);

module.exports = WithdrawalRequest;
