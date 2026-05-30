const express = require('express');
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  claimOrder
} = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createOrder)
  .get(protect, getOrders);

router.route('/:id')
  .get(protect, getOrderById);

router.route('/:id/status')
  .put(protect, authorizeRoles('kitchen', 'delivery', 'admin'), updateOrderStatus);

router.route('/:id/claim')
  .put(protect, authorizeRoles('delivery', 'admin'), claimOrder);

module.exports = router;
