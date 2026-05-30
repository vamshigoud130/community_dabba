const mongoose = require('mongoose');

const FeedbackSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  foodRating: {
    type: Number,
    required: [true, 'Please provide a food rating (1-5)'],
    min: 1,
    max: 5
  },
  deliveryRating: {
    type: Number,
    required: [true, 'Please provide a delivery rating (1-5)'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Feedback', FeedbackSchema);
