import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Calendar, ShoppingBag, MapPin, Star, Sparkles, CheckCircle2, AlertCircle, Compass, Truck, MessageSquare } from 'lucide-react';

export default function CustomerDashboard() {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const [activeTab, setActiveTab] = useState(location.state?.activeTab || 'menu'); // menu, subscription, orders
  
  // Menu/Ordering states
  const [menuItems, setMenuItems] = useState([]);
  const [allMenuItems, setAllMenuItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Lunch');
  const [selectedType, setSelectedType] = useState('All');
  const [cart, setCart] = useState({});
  const [deliveryAddress, setDeliveryAddress] = useState(user?.address || '');
  const [phone, setPhone] = useState(user?.phone || '');
  
  // Subscription states
  const [mySub, setMySub] = useState(null);
  const [subPlan, setSubPlan] = useState('Monthly');
  const [subMealTypes, setSubMealTypes] = useState(['Lunch']);
  
  // Orders/Tracking states
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  
  // Feedback states
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [feedbackOrder, setFeedbackOrder] = useState(null);
  const [foodRating, setFoodRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  
  // Overlay modals
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutType, setCheckoutType] = useState('order'); // order, subscription
  const [paymentDone, setPaymentDone] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Card'); // Card (Stripe), Cash
  const [errorMsg, setErrorMsg] = useState('');
  
  useEffect(() => {
    fetchMenu();
    fetchSubscription();
    fetchOrders();
    fetchAllMenuItems();
  }, [selectedCategory, selectedType]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const type = params.get('type');
    const id = params.get('id');
    const sessionId = params.get('session_id');

    if (payment === 'success' && sessionId && type && id) {
      const verifyPayment = async () => {
        try {
          const res = await axios.post('/payments/verify', {
            session_id: sessionId,
            type,
            id
          });
          if (res.data.success) {
            alert(`🎉 Payment Successful! Your ${type} has been activated.`);
            // Clear query parameters
            window.history.replaceState({}, document.title, window.location.pathname);
            fetchOrders();
            fetchSubscription();
          }
        } catch (err) {
          console.error('Payment verification failed:', err);
          alert('Payment verification failed. Please try again.');
          window.history.replaceState({}, document.title, window.location.pathname);
        }
      };
      verifyPayment();
    } else if (payment === 'cancel') {
      alert('❌ Payment cancelled. You can try checking out again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const fetchMenu = async () => {
    try {
      let url = `/menu?category=${selectedCategory}`;
      if (selectedType !== 'All') {
        url += `&type=${selectedType}`;
      }
      const res = await axios.get(url);
      if (res.data.success) {
        setMenuItems(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching menu:', err);
    }
  };

  const fetchAllMenuItems = async () => {
    try {
      const res = await axios.get('/menu');
      if (res.data.success) {
        setAllMenuItems(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching all menu items:', err);
    }
  };

  const fetchSubscription = async () => {
    try {
      const res = await axios.get('/subscriptions/my');
      if (res.data.success) {
        setMySub(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching subscription:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await axios.get('/orders');
      if (res.data.success) {
        setOrders(res.data.data);
        if (res.data.data.length > 0 && !selectedOrder) {
          setSelectedOrder(res.data.data[0]); // default to tracking latest order
        }
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  // Cart operations
  const updateCartQty = (id, delta) => {
    const current = cart[id] || 0;
    const next = Math.max(0, current + delta);
    if (next === 0) {
      const updated = { ...cart };
      delete updated[id];
      setCart(updated);
    } else {
      setCart({ ...cart, [id]: next });
    }
  };

  const getCartTotal = () => {
    return Object.entries(cart).reduce((sum, [id, qty]) => {
      const item = menuItems.find(m => m._id === id);
      return sum + (item ? item.price * qty : 0);
    }, 0);
  };

  // One-Time Order Checkout
  const handlePlaceOrder = async () => {
    try {
      setErrorMsg('');
      const orderItems = Object.entries(cart).map(([id, qty]) => ({
        menuId: id,
        quantity: qty
      }));

      const res = await axios.post('/orders', {
        items: orderItems,
        deliveryAddress,
        phone,
        paymentMethod: paymentMethod,
        origin: window.location.origin
      });

      if (res.data.success) {
        if (res.data.stripeSessionUrl) {
          window.location.href = res.data.stripeSessionUrl;
          return;
        }
        setPaymentDone(true);
        setCart({});
        fetchOrders();
        setTimeout(() => {
          setCheckoutOpen(false);
          setPaymentDone(false);
          setActiveTab('orders');
        }, 1500);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error creating order');
    }
  };

  // Subscription Checkout
  const handleBuySubscription = async () => {
    try {
      setErrorMsg('');
      const factor = subMealTypes.length;
      const price = subPlan === 'Daily' ? 150 * factor : subPlan === 'Weekly' ? 900 * factor : 3500 * factor;
      const res = await axios.post('/subscriptions', {
        plan: subPlan,
        mealTypes: subMealTypes,
        pricePaid: price,
        origin: window.location.origin
      });

      if (res.data.success) {
        if (res.data.stripeSessionUrl) {
          window.location.href = res.data.stripeSessionUrl;
          return;
        }
        setPaymentDone(true);
        fetchSubscription();
        setTimeout(() => {
          setCheckoutOpen(false);
          setPaymentDone(false);
          setActiveTab('subscription');
        }, 1500);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Error subscribing');
    }
  };

  // Pause/Resume Subscription
  const handleTogglePause = async () => {
    if (!mySub) return;
    try {
      const res = await axios.put(`/subscriptions/${mySub._id}/pause`);
      if (res.data.success) {
        setMySub(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Skip custom calendar date
  const handleSkipDate = async (daysAhead) => {
    if (!mySub) return;
    try {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysAhead);
      const skipDateStr = targetDate.toISOString().split('T')[0];

      const res = await axios.put(`/subscriptions/${mySub._id}/skip`, {
        skipDate: skipDateStr
      });
      if (res.data.success) {
        setMySub(res.data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Feedback Submission
  const handleFeedbackSubmit = async () => {
    try {
      const res = await axios.post('/feedback', {
        orderId: feedbackOrder?._id,
        foodRating,
        deliveryRating,
        comment: feedbackComment
      });
      if (res.data.success) {
        setFeedbackOpen(false);
        setFeedbackComment('');
        alert('Thank you for your valuable feedback! We appreciate it.');
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen">
      {/* Welcome Widget */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-brand-900 rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 w-80 h-full bg-brand-500/10 rounded-l-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="bg-brand-500/20 text-brand-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-brand-500/30">
              Customer Hub 👤
            </span>
            <h1 className="text-3xl font-black mt-2">Welcome back, {user?.name}!</h1>
            <p className="text-slate-400 text-sm mt-1 max-w-lg leading-relaxed">
              Order your favorite hot daily lunch or configure subscription calendar settings for hostel, college, or home.
            </p>
          </div>
          {mySub ? (
            <div className="bg-white/10 backdrop-blur-md border border-white/15 px-6 py-4 rounded-2xl flex items-center gap-4">
              <span className="bg-green-500 h-3.5 w-3.5 rounded-full animate-ping"></span>
              <div>
                <p className="text-xs uppercase text-slate-300 font-extrabold">Active Subscription</p>
                <p className="text-sm font-black text-brand-400">{mySub.plan} ({mySub.mealTypes.join(' + ')})</p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => { setCheckoutType('subscription'); setCheckoutOpen(true); }}
              className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold px-6 py-3 rounded-2xl text-sm transition-all shadow-md shadow-brand-500/20"
            >
              🚀 Grab Subscription
            </button>
          )}
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200 mb-8 gap-4 overflow-x-auto pb-1">
        <button
          onClick={() => setActiveTab('menu')}
          className={`pb-3 font-extrabold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'menu' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ShoppingBag className="h-4.5 w-4.5" />
          Menu & Order
        </button>
        <button
          onClick={() => setActiveTab('subscription')}
          className={`pb-3 font-extrabold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'subscription' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Calendar className="h-4.5 w-4.5" />
          Subscription Manager
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 font-extrabold text-sm border-b-2 flex items-center gap-2 whitespace-nowrap transition-colors ${
            activeTab === 'orders' ? 'border-brand-500 text-brand-600' : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Truck className="h-4.5 w-4.5" />
          Track & History
        </button>
      </div>

      {/* ==================== TAB 1: MENU & ORDERING ==================== */}
      {activeTab === 'menu' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Menu Panel */}
          <div className="lg:col-span-2">
            {/* Filter Widgets */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div className="flex gap-2">
                {['Breakfast', 'Lunch', 'Dinner'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                      selectedCategory === cat
                        ? 'bg-slate-900 text-white shadow-md'
                        : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                {['All', 'Veg', 'Non-Veg'].map(type => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(type)}
                    className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                      selectedType === type
                        ? 'border-brand-500 text-brand-600 bg-brand-50'
                        : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {menuItems.map(item => (
                <div key={item._id} className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm flex flex-col justify-between hover:shadow-md transition-all">
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <img
                      src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider text-white shadow-sm ${
                        item.type === 'Veg' ? 'bg-green-600' : 'bg-rose-600'
                      }`}>
                        {item.type}
                      </span>
                      <span className="bg-slate-900/80 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-[10px] font-extrabold uppercase">
                        {item.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="font-extrabold text-lg text-slate-900">{item.title}</h3>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between mt-6">
                      <span className="text-2xl font-black text-slate-900">₹{item.price}</span>
                      
                      {cart[item._id] ? (
                        <div className="flex items-center gap-3 bg-brand-50 border border-brand-100 px-3 py-1.5 rounded-xl shadow-sm">
                          <button
                            onClick={() => updateCartQty(item._id, -1)}
                            className="text-brand-700 font-bold hover:scale-110 transition-transform"
                          >
                            -
                          </button>
                          <span className="text-sm font-black text-brand-700">{cart[item._id]}</span>
                          <button
                            onClick={() => updateCartQty(item._id, 1)}
                            className="text-brand-700 font-bold hover:scale-110 transition-transform"
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => updateCartQty(item._id, 1)}
                          disabled={!item.available}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                            item.available
                              ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-brand-500/10 hover:shadow-brand-500/20 hover:-translate-y-0.5'
                              : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                          }`}
                        >
                          {item.available ? 'Add To Basket' : 'Sold Out'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cart Sidebar */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-lg p-6 h-fit flex flex-col gap-6">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2 pb-4 border-b border-slate-100">
              🛒 Your Tiffin Basket
            </h3>
            {Object.keys(cart).length === 0 ? (
              <div className="text-center py-12 flex flex-col items-center gap-3">
                <div className="h-16 w-16 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center">
                  <ShoppingBag className="h-8 w-8" />
                </div>
                <p className="text-slate-400 font-semibold text-sm">Your basket is empty.</p>
                <p className="text-slate-400 text-xs">Add delicious menu boxes to place an order.</p>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-4 max-h-[300px] overflow-y-auto pr-1">
                  {Object.entries(cart).map(([id, qty]) => {
                    const item = menuItems.find(m => m._id === id);
                    if (!item) return null;
                    return (
                      <div key={id} className="flex justify-between items-center gap-2">
                        <div className="flex-1">
                          <h4 className="font-bold text-sm text-slate-800">{item.title}</h4>
                          <p className="text-xs text-slate-400 font-medium">₹{item.price} × {qty}</p>
                        </div>
                        <span className="font-black text-sm text-slate-800 pl-4">₹{item.price * qty}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-100 flex flex-col gap-4">
                  <div className="flex justify-between items-baseline">
                    <span className="font-bold text-slate-500 text-sm">Total Price:</span>
                    <span className="font-black text-2xl text-slate-950">₹{getCartTotal()}</span>
                  </div>

                  <div className="flex flex-col gap-3 mt-2">
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-1">Delivery Location</label>
                      <input
                        type="text"
                        value={deliveryAddress}
                        onChange={(e) => setDeliveryAddress(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none"
                        placeholder="Enter delivery address"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-1">Phone Number</label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full text-xs font-semibold px-3 py-2 border border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none"
                        placeholder="Enter your phone"
                      />
                    </div>
                  </div>

                  <button
                    onClick={() => { setCheckoutType('order'); setCheckoutOpen(true); }}
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-extrabold py-3.5 rounded-2xl text-sm transition-all shadow-md shadow-brand-500/15 flex items-center justify-center gap-2"
                  >
                    Place One-Time Order
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 2: SUBSCRIPTION MANAGER ==================== */}
      {activeTab === 'subscription' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Active Sub Card */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-lg p-8 flex flex-col justify-between hover:shadow-xl transition-all h-fit">
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <h3 className="text-xl font-black text-slate-900">Your Subscription</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border uppercase ${
                  mySub?.status === 'Active'
                    ? 'bg-green-50 text-green-700 border-green-200'
                    : mySub?.status === 'Paused'
                    ? 'bg-amber-50 text-amber-600 border-amber-200 animate-pulse'
                    : 'bg-slate-100 text-slate-400 border-slate-200'
                }`}>
                  {mySub ? mySub.status : 'No Active Plan'}
                </span>
              </div>

              {mySub ? (
                <div className="flex flex-col gap-6 mt-6">
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Plan Duration</label>
                    <p className="font-extrabold text-slate-800 text-lg">{mySub.plan} Subscription</p>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Meals Included</label>
                    <p className="font-extrabold text-slate-800 text-sm flex gap-1.5 flex-wrap mt-1">
                      {mySub.mealTypes.map(m => (
                        <span key={m} className="bg-brand-50 text-brand-700 px-2.5 py-1 rounded-lg border border-brand-100 text-xs">
                          {m}
                        </span>
                      ))}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Start Date</label>
                      <p className="font-extrabold text-slate-800 text-sm mt-0.5">
                        {new Date(mySub.startDate).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Expiry Date</label>
                      <p className="font-extrabold text-slate-800 text-sm mt-0.5">
                        {new Date(mySub.endDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  {mySub.pausedDates.length > 0 && (
                    <div>
                      <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Skipped/Paused Days</label>
                      <p className="text-slate-500 text-xs font-semibold mt-1">
                        Your account has credit for skipping {mySub.pausedDates.length} days:
                      </p>
                      <div className="flex gap-2 flex-wrap mt-2">
                        {mySub.pausedDates.map((dateStr, i) => (
                          <span key={i} className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[10px] font-bold border border-slate-200">
                            {new Date(dateStr).toLocaleDateString()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="py-10 text-center flex flex-col items-center gap-3">
                  <div className="bg-brand-50 p-4 rounded-full text-brand-500">
                    <Sparkles className="h-8 w-8" />
                  </div>
                  <p className="font-bold text-slate-700 text-sm">Subscribe to automatic home-cooking</p>
                  <p className="text-slate-400 text-xs leading-relaxed max-w-xs">
                    Choose from standard Daily, Weekly, or Monthly cycles. Save up to 25% compared to one-time orders!
                  </p>
                </div>
              )}
            </div>

            {mySub && (
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col gap-3">
                <button
                  onClick={handleTogglePause}
                  className={`w-full font-extrabold py-3 rounded-2xl text-xs transition-all border flex items-center justify-center gap-2 ${
                    mySub.status === 'Active'
                      ? 'bg-amber-500 hover:bg-amber-600 text-white border-transparent'
                      : 'bg-green-500 hover:bg-green-600 text-white border-transparent'
                  }`}
                >
                  {mySub.status === 'Active' ? '⏸ Pause Subscription' : '▶ Resume Subscription'}
                </button>
                <p className="text-[10px] text-slate-400 font-semibold text-center mt-1">
                  Pausing suspends all daily boxes immediately. Resume whenever you're back.
                </p>
              </div>
            )}
          </div>

          {/* Scheduling Calendar and Skip Meal Pane */}
          <div className="lg:col-span-2 flex flex-col gap-8">
            {mySub ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-8">
                <h3 className="text-xl font-black text-slate-900 pb-4 border-b border-slate-100">
                  📅 Skip Upcoming Days
                </h3>
                <p className="text-slate-500 text-xs font-semibold leading-relaxed mt-2">
                  Not at home or eating out? Toggle specific upcoming days to skip deliveries. You get extended credit!
                </p>
                
                {/* 5-day calendar stepper */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mt-8">
                  {[1, 2, 3, 4, 5].map((offset) => {
                    const futureDate = new Date();
                    futureDate.setDate(futureDate.getDate() + offset);
                    const formattedStr = futureDate.toISOString().split('T')[0];
                    const isSkipped = mySub.pausedDates.some(
                      (d) => new Date(d).toISOString().split('T')[0] === formattedStr
                    );

                    return (
                      <button
                        key={offset}
                        onClick={() => handleSkipDate(offset)}
                        className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center gap-2 group ${
                          isSkipped
                            ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-sm'
                            : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="text-[10px] font-black uppercase tracking-wider opacity-60">
                          {futureDate.toLocaleDateString(undefined, { weekday: 'short' })}
                        </span>
                        <span className="text-2xl font-black">{futureDate.getDate()}</span>
                        <span className="text-[10px] font-bold opacity-60">
                          {futureDate.toLocaleDateString(undefined, { month: 'short' })}
                        </span>
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-black uppercase mt-1 ${
                          isSkipped ? 'bg-rose-100 text-rose-800' : 'bg-green-100 text-green-800 opacity-0 group-hover:opacity-100'
                        }`}>
                          {isSkipped ? 'Skipped' : 'Deliver'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-8">
                <h3 className="text-xl font-black text-slate-900 pb-4 border-b border-slate-100">
                  ⚡ Choose a Meal Plan
                </h3>
                
                <div className="flex flex-col gap-6 mt-6">
                  {/* Select Plan Duration */}
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">Plan Period</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { label: 'Daily (Trial)', val: 'Daily' },
                        { label: 'Weekly', val: 'Weekly' },
                        { label: 'Monthly', val: 'Monthly' }
                      ].map(p => {
                        // Calculate price for this duration based on checked meal categories
                        const factor = subMealTypes.length;
                        const durationPrice = p.val === 'Daily' ? 150 * factor : p.val === 'Weekly' ? 900 * factor : 3500 * factor;
                        return (
                          <button
                            key={p.val}
                            onClick={() => setSubPlan(p.val)}
                            className={`p-4 rounded-2xl border text-left flex flex-col gap-1 transition-all ${
                              subPlan === p.val
                                ? 'border-brand-500 bg-brand-50/50 text-brand-900 ring-2 ring-brand-500/10'
                                : 'border-slate-200 hover:bg-slate-50 text-slate-600'
                            }`}
                          >
                            <span className="text-xs font-bold">{p.label}</span>
                            <span className="text-lg font-black text-slate-900">₹{durationPrice}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Meal Category Selections */}
                  <div className="flex flex-col gap-3">
                    <label className="text-xs text-slate-500 font-bold uppercase tracking-wider pl-1">Included Categories & Scheduled Dishes</label>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['Breakfast', 'Lunch', 'Dinner'].map(meal => {
                        const active = subMealTypes.includes(meal);
                        // Get dishes active for this category
                        const categoryDishes = allMenuItems.filter(item => item.category === meal && item.available);
                        
                        return (
                          <div key={meal} className="flex flex-col gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                if (active) {
                                  if (subMealTypes.length > 1) {
                                    setSubMealTypes(subMealTypes.filter(m => m !== meal));
                                  }
                                } else {
                                  setSubMealTypes([...subMealTypes, meal]);
                                }
                              }}
                              className={`w-full p-3.5 rounded-2xl border text-xs font-bold transition-all text-center ${
                                active
                                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
                              }`}
                            >
                              {meal}
                            </button>

                            <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 flex flex-col gap-1.5 max-h-32 overflow-y-auto">
                              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Scheduled Dishes:</span>
                              {categoryDishes.length > 0 ? (
                                categoryDishes.map(dish => (
                                  <div key={dish._id} className="text-[11px] text-slate-700 font-semibold flex justify-between gap-1">
                                    <span className="truncate">• {dish.title}</span>
                                    <span className="text-slate-400 shrink-0">({dish.day})</span>
                                  </div>
                                  ))
                                ) : (
                                  <span className="text-[10px] text-slate-400 italic">No scheduled dishes</span>
                                )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between mt-4">
                    <div>
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Subscribing to</p>
                      <p className="font-extrabold text-slate-800 text-sm mt-0.5">{subPlan} ({subMealTypes.join(' + ')})</p>
                    </div>
                    <button
                      onClick={() => { setCheckoutType('subscription'); setCheckoutOpen(true); }}
                      className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold px-6 py-3 rounded-xl text-xs transition-all shadow-md shadow-brand-500/10"
                    >
                      Configure & Checkout
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== TAB 3: LIVE TRACK & HISTORY ==================== */}
      {activeTab === 'orders' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Orders History List */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 h-fit max-h-[600px] overflow-y-auto flex flex-col gap-4">
            <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3">Your Tiffin Orders</h3>
            {orders.length === 0 ? (
              <div className="text-center py-10 text-slate-400 font-semibold text-sm">
                No orders booked yet.
              </div>
            ) : (
              orders.map(order => (
                <button
                  key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    selectedOrder?._id === order._id
                      ? 'border-brand-500 bg-brand-50/20 shadow-sm'
                      : 'border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="font-extrabold text-xs text-slate-400 uppercase">
                      📅 {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                      order.status === 'Delivered'
                        ? 'bg-green-100 text-green-800'
                        : order.status === 'Preparing'
                        ? 'bg-amber-100 text-amber-800'
                        : order.status === 'Cancelled'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-800 truncate">
                    {order.items.map(i => i.title).join(', ')}
                  </h4>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-slate-100">
                    <span className="text-xs text-slate-400 font-bold uppercase">One-Time</span>
                    <span className="font-black text-sm text-slate-800">₹{order.total}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {/* Stepper Tracking Visualizer & Mock Map */}
          <div className="lg:col-span-2">
            {selectedOrder ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-lg p-8 flex flex-col gap-8">
                {/* Visual Stepper Header */}
                <div className="pb-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <h3 className="text-xl font-black text-slate-900">Track Order #{selectedOrder._id.slice(-6)}</h3>
                    <p className="text-slate-400 text-xs font-semibold mt-1">
                      Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                    </p>
                  </div>
                  {selectedOrder.status === 'Delivered' && (
                    <button
                      onClick={() => { setFeedbackOrder(selectedOrder); setFeedbackOpen(true); }}
                      className="bg-brand-50 text-brand-700 hover:bg-brand-100 font-extrabold px-4 py-2 rounded-xl text-xs border border-brand-200 transition-all flex items-center gap-1.5"
                    >
                      <MessageSquare className="h-4 w-4" />
                      Submit Review & Rating
                    </button>
                  )}
                </div>

                {/* Workflow Stepper Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 relative">
                  {[
                    { label: 'Placed', stat: 'Pending', desc: 'Kitchen notified' },
                    { label: 'Cooking', stat: 'Preparing', desc: 'Preparing box' },
                    { label: 'Out', stat: 'Out for Delivery', desc: 'Picked up by agent' },
                    { label: 'Delivered', stat: 'Delivered', desc: 'Arrived at destination' }
                  ].map((step, idx) => {
                    const statuses = ['Pending', 'Preparing', 'Out for Delivery', 'Delivered'];
                    const currentIdx = statuses.indexOf(selectedOrder.status);
                    const isDone = currentIdx >= idx && selectedOrder.status !== 'Cancelled';
                    const isActive = currentIdx === idx && selectedOrder.status !== 'Cancelled';

                    return (
                      <div key={idx} className="flex flex-col items-center text-center relative group">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-extrabold text-sm border-2 transition-all ${
                          isActive
                            ? 'bg-brand-500 border-brand-500 text-white animate-soft-pulse scale-110 shadow-lg shadow-brand-500/20'
                            : isDone
                            ? 'bg-green-500 border-green-500 text-white'
                            : 'bg-white border-slate-200 text-slate-400'
                        }`}>
                          {isDone ? '✔' : idx + 1}
                        </div>
                        <h4 className={`text-xs font-black uppercase tracking-wider mt-3 ${isActive ? 'text-brand-500' : 'text-slate-800'}`}>
                          {step.label}
                        </h4>
                        <p className="text-[10px] text-slate-400 font-medium mt-0.5">{step.desc}</p>
                      </div>
                    );
                  })}
                </div>

                {/* Mock GPS Map Layout */}
                <div className="relative h-64 rounded-3xl border border-slate-200 overflow-hidden shadow-inner bg-slate-100 flex items-center justify-center">
                  {/* Grid Lines mockup */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#e2e8f0_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f0_1px,transparent_1px)] bg-[size:24px_24px] opacity-60"></div>
                  
                  {/* Simulated delivery pathways */}
                  <div className="relative z-10 flex flex-col items-center text-center gap-4 p-8">
                    <Compass className="h-12 w-12 text-brand-500 animate-spin" style={{ animationDuration: '6s' }} />
                    <div>
                      <p className="font-extrabold text-slate-900 text-sm">Simulated Map Navigation</p>
                      <p className="text-slate-500 text-xs mt-1">
                        {selectedOrder.status === 'Delivered'
                          ? 'Courier Ramu has marked this box as delivered. Bon Appetit!'
                          : selectedOrder.status === 'Out for Delivery'
                          ? '🛵 Driver Ramu is driving to Madhapur Hostel blocks (4.5 km away).'
                          : selectedOrder.status === 'Preparing'
                          ? '🍳 Cook is currently wrapping packing containers in high hygiene foil.'
                          : '⏱ Waiting for the Annapurna Kitchen cook to accept cooking task.'}
                      </p>
                    </div>
                  </div>

                  {/* Stepper map overlays */}
                  <div className="absolute bottom-4 left-4 bg-slate-900/90 text-white px-3.5 py-2 rounded-xl text-[10px] font-bold flex items-center gap-2 border border-slate-800 backdrop-blur-sm">
                    <Truck className="h-3.5 w-3.5 text-brand-400" />
                    <span>Courier Assigned: {selectedOrder.deliveryPerson?.name || 'Ramu Express (+91 76543 21098)'}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-10 text-center py-20 text-slate-400 font-semibold">
                No orders requested. Select a menu category to make a tiffin order!
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== MODAL: DYNAMIC CHECKOUT SIMULATOR ==================== */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden animate-slide-up">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div>
                <h3 className="font-black text-lg">💳 Secure Stripe Checkout</h3>
                <p className="text-slate-400 text-xs font-semibold mt-0.5">Community Dabba Live Gateway</p>
              </div>
              <button
                onClick={() => setCheckoutOpen(false)}
                className="text-slate-400 hover:text-white font-extrabold text-sm"
              >
                ✕
              </button>
            </div>

            <div className="p-8">
              {paymentDone ? (
                <div className="py-8 text-center flex flex-col items-center gap-4 animate-scale-up">
                  <div className="h-16 w-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center font-extrabold text-2xl shadow-sm">
                    ✔
                  </div>
                  <h4 className="font-black text-xl text-slate-950">Payment Approved!</h4>
                  <p className="text-slate-500 text-xs">Processing subscription routing...</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {errorMsg && (
                    <div className="p-3.5 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-xl">
                      {errorMsg}
                    </div>
                  )}

                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-baseline">
                    <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Total Booking Cost:</span>
                    <span className="font-black text-2xl text-slate-950">
                      ₹{checkoutType === 'order' ? getCartTotal() : (subPlan === 'Daily' ? 150 : subPlan === 'Weekly' ? 900 : 3500) * subMealTypes.length}
                    </span>
                  </div>

                  <div className="flex flex-col gap-3">
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider pl-1">Payment Method</p>
                    <div className="grid grid-cols-2 gap-2.5">
                      <button 
                        onClick={() => setPaymentMethod('Card')}
                        className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                          paymentMethod === 'Card' ? 'border-brand-500 bg-brand-50/50' : 'border-slate-200 opacity-70 hover:opacity-100'
                        }`}
                      >
                        <span className={`text-xs ${paymentMethod === 'Card' ? 'font-black text-brand-900' : 'font-bold text-slate-700'}`}>Stripe (Card)</span>
                      </button>
                      
                      {checkoutType === 'order' ? (
                        <button 
                          onClick={() => setPaymentMethod('Cash')}
                          className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 border-2 transition-all ${
                            paymentMethod === 'Cash' ? 'border-brand-500 bg-brand-50/50' : 'border-slate-200 opacity-70 hover:opacity-100'
                          }`}
                        >
                          <span className={`text-xs ${paymentMethod === 'Cash' ? 'font-black text-brand-900' : 'font-bold text-slate-700'}`}>Cash on Delivery</span>
                        </button>
                      ) : (
                        <div className="border border-dashed border-slate-200 p-3 rounded-2xl flex items-center justify-center bg-slate-50 opacity-50">
                          <span className="text-[10px] font-bold text-slate-400">CoD Unavailable</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center">
                    <p className="text-xs text-slate-600 font-semibold">
                      {paymentMethod === 'Card' 
                        ? '🔒 You will be redirected to the secure Stripe portal to enter details.'
                        : '🛵 Pay with cash directly to the delivery person on tiffin receipt.'
                      }
                    </p>
                  </div>

                  <button
                    onClick={checkoutType === 'order' ? handlePlaceOrder : handleBuySubscription}
                    className="w-full bg-brand-500 hover:bg-brand-600 text-white font-extrabold py-4 rounded-2xl text-sm transition-all shadow-md shadow-brand-500/10 mt-3"
                  >
                    {paymentMethod === 'Card' ? 'Proceed to Stripe Checkout' : 'Confirm Cash Order'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: FEEDBACK RATING SUBMITTER ==================== */}
      {feedbackOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div>
                <h3 className="font-black text-lg">⭐ Rate Your Food Experience</h3>
                <p className="text-slate-400 text-xs font-semibold mt-0.5">Order #{feedbackOrder?._id.slice(-6)} Review</p>
              </div>
              <button onClick={() => setFeedbackOpen(false)} className="text-slate-400 hover:text-white font-extrabold text-sm">✕</button>
            </div>

            <div className="p-8 flex flex-col gap-6">
              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">How was the food quality?</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setFoodRating(star)}
                      className="text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`h-8 w-8 ${foodRating >= star ? 'fill-current' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col items-center gap-2">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">How was the delivery driver?</span>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setDeliveryRating(star)}
                      className="text-amber-400 hover:scale-110 transition-transform"
                    >
                      <Star className={`h-8 w-8 ${deliveryRating >= star ? 'fill-current' : 'text-slate-200'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-1">Comment/Suggestions</label>
                <textarea
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Tell us what you liked or any cooking feedback..."
                  rows={3}
                  className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleFeedbackSubmit}
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-extrabold py-3.5 rounded-2xl text-sm transition-all"
              >
                Submit My Ratings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
