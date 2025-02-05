const mongoose = require('mongoose');

const earningsSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

const Earnings = mongoose.model('Earnings', earningsSchema);
module.exports = Earnings;
