const express = require('express');
const router = express.Router();
const { getNotifications, markNotificationAsRead } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .get(protect, getNotifications);

router.route('/:id/read')
  .put(protect, markNotificationAsRead);

module.exports = router;
