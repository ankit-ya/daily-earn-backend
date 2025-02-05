const mongoose = require('mongoose');

const withdrawSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  status: { type: String, enum: ['pending', 'completed', 'rejected'], default: 'pending' },
  date: { type: Date, default: Date.now },
  verificationCode: { type: String },  // New field for the verification code
  expiresAt: { type: Date, required: true },  // Expiration time for the verification code
  transactionLog: { // To store transaction details after success
    method: { type: String }, // e.g., 'PayPal'
    time: { type: Date },
    status: { type: String } // e.g., 'Success', 'Failed'
  },
});

const Withdraw = mongoose.model('Withdraw', withdrawSchema);
module.exports = Withdraw;
