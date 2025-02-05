const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, required: true }, // e.g., 'withdrawal', 'earning'
    amount: { type: Number, required: true },
    status: { type: String, required: true }, // e.g., 'Completed', 'Pending'
    date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Transaction', TransactionSchema);
