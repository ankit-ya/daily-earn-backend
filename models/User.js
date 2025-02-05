const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  coins: { type: Number, default: 0 }, // Coins earned
  totalEarnings: { type: Number, default: 0 ,min: 0 },
  withdrawalCount: { type: Number, default: 0 }, // Track number of withdrawals
  tasksCompleted: { type: Number, default: 0 }, // Add this field to track tasks
  isAdmin: { type: Boolean, default: false }, // New field to differentiate admin users
  referralCode: { type: String, unique: true }, // Unique referral code
  referredBy: { type: String }, // User ID or email of the referrer
  referralCount: { type: Number, default: 0 }, // Number of users referred
  rewardsEarned: { type: Number, default: 0 }, // Total rewards earned
  completedTasks: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Task' }], // Add this field
  
});

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

const User = mongoose.model('User', userSchema);
module.exports = User;
