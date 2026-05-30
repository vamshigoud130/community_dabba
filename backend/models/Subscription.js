const mongoose = require('mongoose');

const SubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  plan: {
    type: String,
    required: [true, 'Please choose a plan duration'],
    enum: ['Daily', 'Weekly', 'Monthly']
  },
  mealTypes: {
    type: [String],
    required: [true, 'Please select at least one meal category (Breakfast, Lunch, Dinner)'],
    validate: {
      validator: function (arr) {
        return arr.length > 0;
      },
      message: 'Meal categories cannot be empty'
    }
  },
  startDate: {
    type: Date,
    default: Date.now
  },
  endDate: {
    type: Date,
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Active', 'Paused', 'Expired', 'Cancelled'],
    default: 'Pending'
  },
  pausedDates: {
    type: [Date],
    default: []
  },
  pricePaid: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Subscription', SubscriptionSchema);
