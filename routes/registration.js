const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const router = express.Router();
const Registration = require('../models/Registration');
require('dotenv').config(); // Make sure this is loaded

router.post('/', async (req, res) => {
  console.log("➡️ Incoming Registration Data:", req.body);

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = req.body;

  // Step 1: Validate payment signature using Razorpay secret
  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.RAZORPAY_SECRET)
    .update(body.toString())
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    console.warn("❌ Invalid Razorpay Signature");
    return res.status(400).json({ message: "Payment not completed" });
  }

  // Step 2: Save to MongoDB after successful verification
  try {
    const newRegistration = new Registration(req.body);
    await newRegistration.save();
    console.log("✅ Registration saved to DB");
    res.status(201).json({ message: "Registration successful" });
  } catch (error) {
    console.error("❌ Error saving to DB:", error);
    res.status(500).json({ error: "Error saving registration data" });
  }
});

const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Unauthorized: No token' });

  const token = authHeader.split(' ')[1];

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Forbidden: Invalid token' });

    req.user = user;
    next();
  });
};

// ✅ Route to fetch all registration data
router.get('/', authenticate, async (req, res) => {
  try {
    const registrations = await Registration.find();
    res.status(200).json(registrations);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch registrations' });
  }
});

router.put('/:id', authenticate, async (req, res) => {
  const updated = await Registration.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(updated);
});

module.exports = router;
