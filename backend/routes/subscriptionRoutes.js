const express = require('express');
const router = express.Router();
const {
  createSubscription,
  getMySubscription,
  togglePauseSubscription,
  skipSubscriptionDate,
  getAllSubscriptions
} = require('../controllers/subscriptionController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createSubscription)
  .get(protect, authorizeRoles('admin', 'kitchen'), getAllSubscriptions);

router.route('/my')
  .get(protect, getMySubscription);

router.route('/:id/pause')
  .put(protect, togglePauseSubscription);

router.route('/:id/skip')
  .put(protect, skipSubscriptionDate);

module.exports = router;
