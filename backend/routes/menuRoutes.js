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
const upload = require('../middleware/upload');

router.route('/')
  .get(getMenuItems)
  .post(protect, authorizeRoles('kitchen', 'admin'), upload.single('image'), createMenuItem);

router.route('/:id')
  .get(getMenuItemById)
  .put(protect, authorizeRoles('kitchen', 'admin'), upload.single('image'), updateMenuItem)
  .delete(protect, authorizeRoles('kitchen', 'admin'), deleteMenuItem);

module.exports = router;
