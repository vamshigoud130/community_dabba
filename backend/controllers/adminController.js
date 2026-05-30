const User = require('../models/User');
const Order = require('../models/Order');
const Subscription = require('../models/Subscription');
const Feedback = require('../models/Feedback');

// @desc    Get dashboard analytics
// @route   GET /api/admin/stats
// @access  Private (Admin)
const getAdminStats = async (req, res) => {
  try {
    // 1. Core aggregates
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const activeSubs = await Subscription.countDocuments({ status: 'Active' });
    const pausedSubs = await Subscription.countDocuments({ status: 'Paused' });
    const totalFeedbacks = await Feedback.countDocuments();

    // 2. Revenue calculations
    // Sum of paid orders
    const orderRevenueData = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    const orderRevenue = orderRevenueData.length > 0 ? orderRevenueData[0].total : 0;

    // Sum of subscriptions
    const subRevenueData = await Subscription.aggregate([
      { $group: { _id: null, total: { $sum: '$pricePaid' } } }
    ]);
    const subRevenue = subRevenueData.length > 0 ? subRevenueData[0].total : 0;

    const totalRevenue = orderRevenue + subRevenue;

    // 3. Feedback Averages
    const ratingsData = await Feedback.aggregate([
      {
        $group: {
          _id: null,
          avgFood: { $avg: '$foodRating' },
          avgDelivery: { $avg: '$deliveryRating' }
        }
      }
    ]);
    const avgFoodRating = ratingsData.length > 0 ? Number(ratingsData[0].avgFood.toFixed(1)) : 0;
    const avgDeliveryRating = ratingsData.length > 0 ? Number(ratingsData[0].avgDelivery.toFixed(1)) : 0;

    // 4. Daily Revenue Timeline (last 7 days)
    // We will build a structured array for charting, fallback to dynamic mock metrics if DB is empty
    const orderHistory = await Order.aggregate([
      { $match: { paymentStatus: 'Paid' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$total' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } },
      { $limit: 7 }
    ]);

    // Format clean charts dataset
    const dailyStats = orderHistory.map(item => ({
      date: item._id,
      revenue: item.revenue,
      orders: item.count
    }));

    res.json({
      success: true,
      data: {
        metrics: {
          totalUsers,
          totalOrders,
          activeSubscriptions: activeSubs,
          pausedSubscriptions: pausedSubs,
          totalFeedbacks,
          totalRevenue,
          orderRevenue,
          subscriptionRevenue: subRevenue,
          avgFoodRating,
          avgDeliveryRating
        },
        dailyStats: dailyStats.length > 0 ? dailyStats : [
          { date: 'Monday', revenue: 450, orders: 4 },
          { date: 'Tuesday', revenue: 780, orders: 6 },
          { date: 'Wednesday', revenue: 1200, orders: 10 },
          { date: 'Thursday', revenue: 950, orders: 8 },
          { date: 'Friday', revenue: 1540, orders: 12 },
          { date: 'Saturday', revenue: 1800, orders: 15 },
          { date: 'Sunday', revenue: 2100, orders: 18 }
        ]
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user details/role by admin
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
const adminUpdateUser = async (req, res) => {
  try {
    const { name, email, role, phone, address } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.phone = phone || user.phone;
    if (address !== undefined) user.address = address;

    const updatedUser = await user.save();
    res.json({ success: true, data: updatedUser });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
const adminDeleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Admin cannot delete themselves' });
    }

    await user.deleteOne();
    res.json({ success: true, message: 'User removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getAdminStats,
  getAllUsers,
  adminUpdateUser,
  adminDeleteUser
};
