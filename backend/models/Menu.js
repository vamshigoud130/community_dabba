const mongoose = require('mongoose');

const MenuSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please add a meal title'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  price: {
    type: Number,
    required: [true, 'Please add a price']
  },
  category: {
    type: String,
    required: [true, 'Please specify category'],
    enum: ['Breakfast', 'Lunch', 'Dinner']
  },
  day: {
    type: String,
    required: [true, 'Please specify day of week'],
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday', 'All'],
    default: 'All'
  },
  type: {
    type: String,
    enum: ['Veg', 'Non-Veg'],
    default: 'Veg'
  },
  available: {
    type: Boolean,
    default: true
  },
  image: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Menu', MenuSchema);
