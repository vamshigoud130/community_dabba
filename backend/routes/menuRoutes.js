const express = require('express');
const router = express.Router();
const {
  getMenuItems,
  getMenuItemById,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem
} = require('../controllers/menuController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.route('/')
  .get(getMenuItems)
  .post(protect, authorizeRoles('kitchen', 'admin'), createMenuItem);

router.route('/:id')
  .get(getMenuItemById)
  .put(protect, authorizeRoles('kitchen', 'admin'), updateMenuItem)
  .delete(protect, authorizeRoles('kitchen', 'admin'), deleteMenuItem);

module.exports = router;
