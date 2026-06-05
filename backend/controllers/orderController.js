const Order = require('../models/Order');
const Menu = require('../models/Menu');
const Notification = require('../models/Notification');

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  try {
    const { items, paymentMethod, deliveryAddress, phone } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'No items in order' });
    }

    // Verify pricing and calculate total
    let total = 0;
    const orderItems = [];

    for (const item of items) {
      const dbMenuItem = await Menu.findById(item.menuId);
      if (!dbMenuItem) {
        return res.status(404).json({ success: false, message: `Menu item ${item.menuId} not found` });
      }

      if (!dbMenuItem.available) {
        return res.status(400).json({ success: false, message: `${dbMenuItem.title} is currently sold out!` });
      }

      const itemTotal = dbMenuItem.price * item.quantity;
      total += itemTotal;

      orderItems.push({
        menuId: dbMenuItem._id,
        title: dbMenuItem.title,
        price: dbMenuItem.price,
        quantity: item.quantity
      });
    }

    const order = await Order.create({
      userId: req.user._id,
      items: orderItems,
      total,
      deliveryAddress: deliveryAddress || req.user.address || 'Default Address',
      phone: phone || req.user.phone || '0000000000',
      paymentMethod: paymentMethod || 'UPI',
      paymentStatus: 'Pending', // All orders start as Pending payment until verified (except Cash which remains Pending)
      status: 'Pending'
    });

    if (paymentMethod !== 'Cash') {
      const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
      const origin = req.body.origin || 'https://community-dabba.onrender.com';
      const lineItems = orderItems.map(item => ({
        price_data: {
          currency: 'inr',
          product_data: {
            name: item.title,
          },
          unit_amount: item.price * 100, // in paise
        },
        quantity: item.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${origin}/customer?payment=success&type=order&id=${order._id}&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/customer?payment=cancel`,
        metadata: {
          orderId: order._id.toString()
        }
      });

      return res.status(201).json({ success: true, data: order, stripeSessionUrl: session.url });
    }

    // Send email for Cash on Delivery orders
    const { sendOrderPlacedEmail } = require('../config/emailService');
    sendOrderPlacedEmail(req.user.email, req.user.name, order).catch(err => console.error('Error sending COD email:', err));

    res.status(201).json({ success: true, data: order });
  } catch (error) {
    console.error('Create Order Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user or role-based orders
// @route   GET /api/orders
// @access  Private
const getOrders = async (req, res) => {
  try {
    let query = {};

    // Filter list according to the logged-in role
    if (req.user.role === 'customer') {
      query.userId = req.user._id;
    } else if (req.user.role === 'delivery') {
      // Delivery staff see either:
      // 1. Orders assigned specifically to them
      // 2. Orders that are ready for pickup (Preparing or Pending or Out for Delivery) with no delivery person assigned yet
      const { status } = req.query;
      if (status === 'unassigned') {
        query.deliveryPerson = null;
        query.status = { $in: ['Pending', 'Preparing', 'Out for Delivery'] };
      } else {
        query.deliveryPerson = req.user._id;
      }
    } else if (req.user.role === 'kitchen') {
      // Kitchen is interested in active cooking tasks
      const { active } = req.query;
      if (active === 'true') {
        query.status = { $in: ['Pending', 'Preparing', 'Out for Delivery'] };
      }
    }
    // Admin role has no constraints, queries all

    const orders = await Order.find(query)
      .populate('userId', 'name email phone')
      .populate('deliveryPerson', 'name phone')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('deliveryPerson', 'name phone');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Access control check
    if (
      req.user.role === 'customer' &&
      order.userId._id.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order' });
    }

    res.json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Role-based status constraints
    if (req.user.role === 'kitchen') {
      if (!['Preparing', 'Out for Delivery', 'Cancelled'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Kitchen can only set status to Preparing, Out for Delivery, or Cancelled' });
      }
    } else if (req.user.role === 'delivery') {
      if (order.deliveryPerson && order.deliveryPerson.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Not authorized: Order assigned to another delivery agent' });
      }
      if (!['Out for Delivery', 'Delivered'].includes(status)) {
        return res.status(400).json({ success: false, message: 'Delivery staff can only transition status to Out for Delivery or Delivered' });
      }
    }

    const previousStatus = order.status;
    order.status = status;
    
    if (status === 'Delivered') {
      order.paymentStatus = 'Paid';
    }

    const updatedOrder = await order.save();

    // Trigger Notification & Email if order status changes
    const { sendOutOfDeliveryEmail, sendOrderDeliveredEmail } = require('../config/emailService');
    
    if (status === 'Out for Delivery' && previousStatus !== 'Out for Delivery') {
      if (order.userId && order.userId.email) {
        sendOutOfDeliveryEmail(order.userId.email, order.userId.name, order._id).catch(err => console.error('Error sending out of delivery email:', err));
      }
      try {
        await Notification.create({
          title: 'Order Ready for Delivery',
          message: `Order #${order._id.toString().slice(-6)} is ready for pickup and delivery!`,
          orderId: order._id,
          recipientRole: 'delivery'
        });
      } catch (err) {
        console.error('Error creating notification:', err);
      }
    } else if (status === 'Delivered' && previousStatus !== 'Delivered') {
      if (order.userId && order.userId.email) {
        sendOrderDeliveredEmail(order.userId.email, order.userId.name, order._id).catch(err => console.error('Error sending delivered email:', err));
      }
    }
    
    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Claim order for delivery
// @route   PUT /api/orders/:id/claim
// @access  Private (Delivery, Admin)
const claimOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('userId', 'name email');

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    if (order.deliveryPerson) {
      return res.status(400).json({ success: false, message: 'Order already claimed by another delivery person' });
    }

    const previousStatus = order.status;
    order.deliveryPerson = req.user._id;
    order.status = 'Out for Delivery'; // transition to out for delivery upon pickup claim
    
    const updatedOrder = await order.save();

    if (previousStatus !== 'Out for Delivery') {
      const { sendOutOfDeliveryEmail } = require('../config/emailService');
      if (order.userId && order.userId.email) {
        sendOutOfDeliveryEmail(order.userId.email, order.userId.name, order._id).catch(err => console.error('Error sending out of delivery email:', err));
      }
    }

    res.json({ success: true, data: updatedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
  claimOrder
};
