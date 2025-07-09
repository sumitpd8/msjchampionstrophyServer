const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema({
  teamName: String,
  category: String,
  homeGround: String,
  founded: String,
  captainName: String,
  captainPhone: String,
  captainEmail: String,
  viceCaptain: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  players: [
    {
      name: String,
      role: String,
    }
  ],

  // Razorpay-related fields:
  razorpay_payment_id: String,
  razorpay_order_id: String,
  razorpay_signature: String,
  amountPaid: Number,

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Registration', registrationSchema);
