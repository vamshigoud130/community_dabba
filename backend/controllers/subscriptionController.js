const Subscription = require('../models/Subscription');

const createSubscription = async (req, res) => {
  try {
    const { plan, mealTypes, pricePaid } = req.body;

    if (!plan || !mealTypes || mealTypes.length === 0) {
      return res.status(400).json({ success: false, message: 'Please specify plan duration and meal types' });
    }

    const startDate = new Date();
    let endDate = new Date();

    if (plan === 'Daily') {
      endDate.setDate(startDate.getDate() + 1);
    } else if (plan === 'Weekly') {
      endDate.setDate(startDate.getDate() + 7);
    } else if (plan === 'Monthly') {
      endDate.setDate(startDate.getDate() + 30);
    }

    // Cancel any existing active/pending subscriptions first to avoid duplicates
    await Subscription.updateMany(
      { userId: req.user._id, status: { $in: ['Active', 'Pending'] } },
      { status: 'Cancelled' }
    );

    const subscription = await Subscription.create({
      userId: req.user._id,
      plan,
      mealTypes,
      startDate,
      endDate,
      pricePaid,
      status: 'Pending'
    });

    const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
    const origin = req.body.origin || 'https://dabbahub.onrender.com';
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'inr',
            product_data: {
              name: `${plan} Meal Plan Subscription`,
              description: `Includes: ${mealTypes.join(' + ')}`,
            },
            unit_amount: pricePaid * 100, // in paise
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/customer?payment=success&type=subscription&id=${subscription._id}&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/customer?payment=cancel`,
      metadata: {
        subscriptionId: subscription._id.toString()
      }
    });

    res.status(201).json({ success: true, data: subscription, stripeSessionUrl: session.url });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMySubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({
      userId: req.user._id,
      status: { $in: ['Active', 'Paused'] }
    }).sort({ createdAt: -1 });

    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const togglePauseSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    if (subscription.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to modify this subscription' });
    }

    if (subscription.status === 'Active') {
      subscription.status = 'Paused';
    } else if (subscription.status === 'Paused') {
      subscription.status = 'Active';
    } else {
      return res.status(400).json({ success: false, message: `Cannot modify subscription in ${subscription.status} status` });
    }

    await subscription.save();
    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

//   Skip specific meal date
//    PUT /api/subscriptions/:id/skip
// Private
const skipSubscriptionDate = async (req, res) => {
  try {
    const { skipDate } = req.body; // e.g. "2026-05-21"
    
    if (!skipDate) {
      return res.status(400).json({ success: false, message: 'Please provide a skip date' });
    }

    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' });
    }

    const dateToSkip = new Date(skipDate);
    
    // Check if already in list
    const exists = subscription.pausedDates.some(
      (d) => d.toISOString().split('T')[0] === dateToSkip.toISOString().split('T')[0]
    );

    if (exists) {
      // Remove it (Toggle resume for this date)
      subscription.pausedDates = subscription.pausedDates.filter(
        (d) => d.toISOString().split('T')[0] !== dateToSkip.toISOString().split('T')[0]
      );
    } else {
      // Add it
      subscription.pausedDates.push(dateToSkip);
    }

    await subscription.save();
    res.json({ success: true, data: subscription });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    // Find all subscription orders created in the last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const Order = require('../models/Order');
    const Menu = require('../models/Menu');
    
    const todayOrders = await Order.find({
      orderType: 'Subscription',
      createdAt: { $gte: oneDayAgo }
    }).populate('items.menuId', 'category');

    const allMenuItems = await Menu.find({}, 'title category');

    const subscriptionsWithStatus = subscriptions.map(sub => {
      if (!sub.userId) return null;
      
      const subObj = sub.toObject();
      
      subObj.dispatchedToday = {
        Breakfast: false,
        Lunch: false,
        Dinner: false
      };

      todayOrders.forEach(order => {
        if (order.userId && order.userId.toString() === sub.userId._id.toString()) {
          order.items.forEach(item => {
            let category = item.menuId?.category;
            if (!category) {
              const matchedMenu = allMenuItems.find(m => m.title === item.title);
              category = matchedMenu?.category;
            }
            if (category) {
              subObj.dispatchedToday[category] = true;
            }
          });
        }
      });

      return subObj;
    }).filter(Boolean);

    res.json({ success: true, count: subscriptionsWithStatus.length, data: subscriptionsWithStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createSubscription,
  getMySubscription,
  togglePauseSubscription,
  skipSubscriptionDate,
  getAllSubscriptions
};
