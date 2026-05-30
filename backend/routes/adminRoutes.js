const express = require('express');
const router = express.Router();
const {
  getAdminStats,
  getAllUsers,
  adminUpdateUser,
  adminDeleteUser
} = require('../controllers/adminController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

// Protect all admin routes
router.use(protect, authorizeRoles('admin'));

router.get('/stats', getAdminStats);
router.route('/users')
  .get(getAllUsers);

router.route('/users/:id')
  .put(adminUpdateUser)
  .delete(adminDeleteUser);

module.exports = router;
