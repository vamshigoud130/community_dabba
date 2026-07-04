const Feedback = require('../models/Feedback');

const createFeedback = async (req, res) => {
  try {
    const { orderId, foodRating, deliveryRating, comment } = req.body;

    if (!foodRating || !deliveryRating) {
      return res.status(400).json({ success: false, message: 'Please provide ratings for both food and delivery' });
    }

    const feedback = await Feedback.create({
      userId: req.user._id,
      orderId,
      foodRating: Number(foodRating),
      deliveryRating: Number(deliveryRating),
      comment: comment || ''
    });

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate('userId', 'name')
      .populate('orderId', 'createdAt')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: feedbacks.length, data: feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createFeedback,
  getFeedbacks
};
