const express = require('express');
const router = express.Router();
const { createFeedback, getFeedbacks } = require('../controllers/feedbackController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createFeedback)
  .get(getFeedbacks);

module.exports = router;
