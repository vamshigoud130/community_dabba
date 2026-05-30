const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Subscription = require('../models/Subscription');

// @desc    Verify Stripe Checkout Session
// @route   POST /api/payments/verify
// @access  Private
const verifySession = async (req, res) => {
  try {
    const { session_id, type, id } = req.body;

    if (!session_id || !type || !id) {
      return res.status(400).json({ success: false, message: 'Please provide session_id, type, and resource id' });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    if (!session) {
      return res.status(404).json({ success: false, message: 'Stripe session not found' });
    }

    if (session.payment_status === 'paid') {
      if (type === 'order') {
        const order = await Order.findById(id);
        if (!order) {
          return res.status(404).json({ success: false, message: 'Order not found' });
        }
        order.paymentStatus = 'Paid';
        await order.save();
        return res.json({ success: true, message: 'Order payment verified successfully', data: order });
      } else if (type === 'subscription') {
        const subscription = await Subscription.findById(id);
        if (!subscription) {
          return res.status(404).json({ success: false, message: 'Subscription not found' });
        }
        subscription.status = 'Active';
        await subscription.save();
        return res.json({ success: true, message: 'Subscription payment verified successfully', data: subscription });
      } else {
        return res.status(400).json({ success: false, message: 'Invalid payment verification type' });
      }
    } else {
      return res.status(400).json({ success: false, message: 'Payment has not been completed yet', status: session.payment_status });
    }
  } catch (error) {
    console.error('Verify Session Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  verifySession
};
