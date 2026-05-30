import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ChefHat, ListTodo, Plus, Trash2, Edit3, Power, Flame, Calendar, IndianRupee, ImagePlus, X } from 'lucide-react';

export default function KitchenDashboard() {
  const [activeTab, setActiveTab] = useState('queue'); // queue, manage_menu
  const [orders, setOrders] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  
  // Menu Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [menuForm, setMenuForm] = useState({
    title: '',
    description: '',
    price: '',
    category: 'Lunch',
    day: 'Monday',
    type: 'Veg',
    available: true,
    image: ''
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    fetchOrdersQueue();
    fetchKitchenMenu();
    fetchSubscriptions();
  }, []);

  const fetchSubscriptions = async () => {
    try {
      const res = await axios.get('/subscriptions');
      if (res.data.success) {
        setSubscriptions(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching subscriptions:', err);
    }
  };

  const fetchOrdersQueue = async () => {
    try {
      const res = await axios.get('/orders?active=true');
      if (res.data.success) {
        setOrders(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching kitchen orders:', err);
    }
  };

  const fetchKitchenMenu = async () => {
    try {
      const res = await axios.get('/menu');
      if (res.data.success) {
        setMenuItems(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching menu items:', err);
    }
  };

  // Status transitions
  const handleUpdateStatus = async (id, nextStatus) => {
    try {
      const res = await axios.put(`/orders/${id}/status`, { status: nextStatus });
      if (res.data.success) {
        fetchOrdersQueue();
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Error updating order status');
    }
  };

  // Availability toggle
  const handleToggleAvailable = async (id, currentVal) => {
    try {
      const res = await axios.put(`/menu/${id}`, { available: !currentVal });
      if (res.data.success) {
        fetchKitchenMenu();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // CRUD operations
  const handleFormChange = (e) => {
    if (e.target.name === 'imageFile') {
      const file = e.target.files[0];
      if (file) {
        setImageFile(file);
        setImagePreview(URL.createObjectURL(file));
      }
      return;
    }
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setMenuForm({ ...menuForm, [e.target.name]: value });
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImagePreview('');
    setMenuForm({ ...menuForm, image: '' });
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setMenuForm({
      title: item.title,
      description: item.description,
      price: item.price,
      category: item.category,
      day: item.day,
      type: item.type,
      available: item.available,
      image: item.image
    });
    setImageFile(null);
    setImagePreview(item.image || '');
    setModalOpen(true);
  };

  const handleCreateClick = () => {
    setEditingItem(null);
    setMenuForm({
      title: '',
      description: '',
      price: '',
      category: 'Lunch',
      day: 'All',
      type: 'Veg',
      available: true,
      image: ''
    });
    setImageFile(null);
    setImagePreview('');
    setModalOpen(true);
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to delete this menu dish?')) return;
    try {
      const res = await axios.delete(`/menu/${id}`);
      if (res.data.success) {
        fetchKitchenMenu();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    try {
      // Build FormData for multipart upload
      const formData = new FormData();
      formData.append('title', menuForm.title);
      formData.append('description', menuForm.description);
      formData.append('price', menuForm.price);
      formData.append('category', menuForm.category);
      formData.append('day', menuForm.day);
      formData.append('type', menuForm.type);
      formData.append('available', menuForm.available);

      // Attach file if selected, otherwise send existing image URL
      if (imageFile) {
        formData.append('image', imageFile);
      } else if (menuForm.image) {
        formData.append('image', menuForm.image);
      }

      const config = { headers: { 'Content-Type': 'multipart/form-data' } };

      if (editingItem) {
        const res = await axios.put(`/menu/${editingItem._id}`, formData, config);
        if (res.data.success) {
          fetchKitchenMenu();
          setModalOpen(false);
        }
      } else {
        const res = await axios.post('/menu', formData, config);
        if (res.data.success) {
          fetchKitchenMenu();
          setModalOpen(false);
        }
      }
    } catch (err) {
      console.error('Error saving menu item:', err);
      alert(err.response?.data?.message || 'Error saving menu item');
    }
  };

  // Compile daily prep quantities needed
  const getDailyPrepCounts = () => {
    const prepCounts = {};
    orders.forEach(order => {
      if (['Pending', 'Preparing'].includes(order.status)) {
        order.items.forEach(item => {
          prepCounts[item.title] = (prepCounts[item.title] || 0) + item.quantity;
        });
      }
    });
    return Object.entries(prepCounts);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen">
      {/* Header Widget */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 w-80 h-full bg-amber-500/10 rounded-l-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-amber-500/30">
              Kitchen Provider Portal 🍳
            </span>
            <h1 className="text-3xl font-black mt-2">Annapurna Kitchen Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1 max-w-lg leading-relaxed">
              Compile raw prep summaries, fulfill active customer lunches, and adjust daily recipe menus.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'queue' ? 'bg-amber-500 text-white shadow-md' : 'bg-white/10 hover:bg-white/15 text-white'
              }`}
            >
              <ListTodo className="h-4 w-4" />
              Active Prep Queue ({orders.filter(o => ['Pending', 'Preparing'].includes(o.status)).length})
            </button>
            <button
              onClick={() => setActiveTab('subscriptions')}
              className={`px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'subscriptions' ? 'bg-amber-500 text-white shadow-md' : 'bg-white/10 hover:bg-white/15 text-white'
              }`}
            >
              <Calendar className="h-4 w-4" />
              Active Subscriptions
            </button>
            <button
              onClick={() => setActiveTab('manage_menu')}
              className={`px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'manage_menu' ? 'bg-amber-500 text-white shadow-md' : 'bg-white/10 hover:bg-white/15 text-white'
              }`}
            >
              <ChefHat className="h-4 w-4" />
              Manage Dishes
            </button>
          </div>
        </div>
      </div>

      {/* ==================== PANEL 1: COOKING QUEUE ==================== */}
      {activeTab === 'queue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Active Orders List */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            <h3 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              🔥 Live Cooking Queue
            </h3>
            
            {orders.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center py-20 text-slate-400 font-semibold">
                No active orders in the queue. You are all caught up!
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {orders.map(order => (
                  <div key={order._id} className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-all">
                    <div>
                      <div className="flex justify-between items-baseline mb-4 pb-3 border-b border-slate-100">
                        <span className="font-extrabold text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">
                          #{order._id.slice(-6)}
                        </span>
                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase ${
                          order.status === 'Preparing'
                            ? 'bg-amber-100 text-amber-800 animate-pulse'
                            : order.status === 'Out for Delivery'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {order.status}
                        </span>
                      </div>

                      {/* Items */}
                      <div className="flex flex-col gap-3 my-4">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center">
                            <span className="font-extrabold text-sm text-slate-800">{item.title}</span>
                            <span className="bg-brand-50 border border-brand-100 text-brand-700 text-xs font-black px-2 py-0.5 rounded">
                              Qty: {item.quantity}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* Customer Address & Phone */}
                      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col gap-1 text-slate-500 text-xs font-semibold">
                        <p>👤 Cust: {order.userId?.name || 'Customer'}</p>
                        <p>📞 Phone: {order.phone}</p>
                        <p className="truncate">📍 Loc: {order.deliveryAddress}</p>
                      </div>
                    </div>

                    {/* Operational Buttons */}
                    <div className="mt-6 pt-4 border-t border-slate-100">
                      {order.status === 'Pending' ? (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'Preparing')}
                          className="w-full bg-amber-500 hover:bg-amber-600 text-white font-extrabold py-3 rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                          <Flame className="h-4 w-4" />
                          Start Preparing
                        </button>
                      ) : order.status === 'Preparing' ? (
                        <button
                          onClick={() => handleUpdateStatus(order._id, 'Out for Delivery')}
                          className="w-full bg-green-500 hover:bg-green-600 text-white font-extrabold py-3 rounded-2xl text-xs transition-all shadow-md flex items-center justify-center gap-1.5"
                        >
                          ✔ Mark Ready for Courier
                        </button>
                      ) : (
                        <div className="text-center py-2.5 text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-xl font-bold uppercase tracking-wider">
                          🛵 Handed to Courier
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Aggregate Prep Counters */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 h-fit flex flex-col gap-6">
            <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              📊 Today's Prep Counts
            </h3>
            <p className="text-slate-400 text-xs font-semibold leading-relaxed">
              Consolidated kitchen counts for the cooking staff. Prepare these meals immediately to fulfill live orders.
            </p>
            {getDailyPrepCounts().length === 0 ? (
              <div className="text-center py-10 text-slate-400 text-sm font-semibold">
                No boxes left to cook. Good job!
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {getDailyPrepCounts().map(([title, count]) => (
                  <div key={title} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                    <span className="font-extrabold text-sm text-slate-800">{title}</span>
                    <span className="bg-slate-900 text-white text-xs font-black h-8 w-8 rounded-full flex items-center justify-center shadow">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ==================== PANEL 1.5: ACTIVE PLANS & SUBSCRIPTIONS ==================== */}
      {activeTab === 'subscriptions' && (
        <div className="flex flex-col gap-8">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <div>
              <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                📋 Active Customer Meal Plans
              </h3>
              <p className="text-slate-400 text-xs mt-1 font-semibold">
                Daily automated cooking checklist (excludes users who paused plans or set active skip dates).
              </p>
            </div>
            <button
              onClick={fetchSubscriptions}
              className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition-colors"
            >
              🔄 Refresh List
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {['Breakfast', 'Lunch', 'Dinner'].map((category) => {
              const todaysDateStr = new Date().toISOString().split('T')[0];
              const filtered = subscriptions.filter((sub) => {
                // Subscription must be active
                if (sub.status !== 'Active') return false;
                
                // Today must be within active duration
                const now = new Date();
                const start = new Date(sub.startDate);
                const end = new Date(sub.endDate);
                if (now < start || now > end) return false;

                // User must not have skipped today
                const isSkippedToday = sub.pausedDates.some(
                  (pausedDate) => new Date(pausedDate).toISOString().split('T')[0] === todaysDateStr
                );
                if (isSkippedToday) return false;

                // Category must match
                return sub.mealTypes.includes(category);
              });

              return (
                <div key={category} className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 flex flex-col gap-4">
                  <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                    <h4 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                      {category === 'Breakfast' ? '🌅 Breakfast Queue' : category === 'Lunch' ? '☀️ Lunch Queue' : '🌌 Dinner Queue'}
                    </h4>
                    <span className="bg-brand-100 text-brand-700 text-xs font-black px-2.5 py-1 rounded-full">
                      {filtered.length} Active
                    </span>
                  </div>

                  <div className="flex flex-col gap-3.5 max-h-[450px] overflow-y-auto pr-1">
                    {filtered.length > 0 ? (
                      filtered.map((sub) => (
                        <div key={sub._id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-2">
                          <div className="flex justify-between items-baseline">
                            <span className="font-bold text-sm text-slate-800">{sub.userId?.name || 'Subscriber'}</span>
                            <span className="text-[10px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded-md font-black uppercase">
                              {sub.plan}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-500 font-semibold leading-relaxed flex flex-col gap-0.5">
                            <p>📞 Phone: {sub.userId?.phone || 'N/A'}</p>
                            <p className="line-clamp-2">📍 Address: {sub.userId?.address || 'N/A'}</p>
                            <p className="text-slate-400 mt-1">Expiry: {new Date(sub.endDate).toLocaleDateString()}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-slate-400 text-xs font-semibold">
                        No {category.toLowerCase()} boxes scheduled for today.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ==================== PANEL 2: MANAGE MENU ==================== */}
      {activeTab === 'manage_menu' && (
        <div className="flex flex-col gap-6">
          <div className="flex justify-between items-center border-b border-slate-200 pb-3">
            <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
              📖 Kitchen Dishes Book
            </h3>
            <button
              onClick={handleCreateClick}
              className="bg-brand-500 hover:bg-brand-600 text-white font-extrabold px-5 py-3 rounded-2xl text-xs flex items-center gap-1.5 shadow-md shadow-brand-500/10 transition-all hover:-translate-y-0.5"
            >
              <Plus className="h-4 w-4" />
              Add Recipe Card
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {menuItems.map(item => (
              <div key={item._id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
                <div className="relative h-48 bg-slate-100">
                  <img
                    src={item.image || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&q=80'}
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-4 left-4 flex gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase text-white ${
                      item.type === 'Veg' ? 'bg-green-600' : 'bg-rose-600'
                    }`}>
                      {item.type}
                    </span>
                    <span className="bg-slate-900/80 backdrop-blur-sm text-white px-2 py-0.5 rounded text-[10px] font-bold">
                      {item.category}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-extrabold text-base text-slate-900 leading-tight">{item.title}</h4>
                      <span className="font-black text-lg text-slate-950">₹{item.price}</span>
                    </div>
                    <p className="text-slate-400 text-xs mt-1 leading-relaxed line-clamp-2">{item.description}</p>
                    
                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold mt-3">
                      <Calendar className="h-4.5 w-4.5 text-brand-500" />
                      Scheduled: <span className="text-brand-600 font-bold">{item.day}</span>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                    <button
                      onClick={() => handleToggleAvailable(item._id, item.available)}
                      className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase border tracking-wider transition-all flex items-center justify-center gap-1.5 ${
                        item.available
                          ? 'bg-green-50 text-green-700 border-green-200'
                          : 'bg-rose-50 text-rose-600 border-rose-200'
                      }`}
                    >
                      <Power className="h-3.5 w-3.5" />
                      {item.available ? 'Available' : 'Sold Out'}
                    </button>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="bg-slate-50 hover:bg-brand-50 text-slate-600 hover:text-brand-700 p-2.5 rounded-xl border border-slate-200 hover:border-brand-200 transition-colors"
                      >
                        <Edit3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item._id)}
                        className="bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 p-2.5 rounded-xl border border-slate-200 hover:border-rose-200 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== MODAL: ADD/EDIT DISH FORM ==================== */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="w-full max-w-lg bg-white rounded-3xl border border-slate-100 shadow-2xl overflow-hidden">
            <div className="bg-slate-900 text-white p-6 flex justify-between items-center">
              <div>
                <h3 className="font-black text-lg">{editingItem ? '✏ Edit Recipe Card' : '🍳 Launch Recipe Card'}</h3>
                <p className="text-slate-400 text-xs font-semibold mt-0.5">Community Dabba Kitchen registry</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-white font-extrabold text-sm">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-8 flex flex-col gap-5 max-h-[500px] overflow-y-auto">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-1">Dish Title *</label>
                <input
                  type="text"
                  name="title"
                  value={menuForm.title}
                  onChange={handleFormChange}
                  className="w-full text-xs font-semibold px-3 py-3 border border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none"
                  placeholder="e.g. Standard Basmati Rice Meals"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-1">Price (INR) *</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="number"
                      name="price"
                      value={menuForm.price}
                      onChange={handleFormChange}
                      className="w-full text-xs font-semibold pl-9 pr-3 py-3 border border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none"
                      placeholder="120"
                      required
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-1">Dietary Type</label>
                  <select
                    name="type"
                    value={menuForm.type}
                    onChange={handleFormChange}
                    className="w-full text-xs font-bold px-3 py-3 border border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="Veg">Vegetarian 🟢</option>
                    <option value="Non-Veg">Non-Vegetarian 🔴</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-1">Meal category</label>
                  <select
                    name="category"
                    value={menuForm.category}
                    onChange={handleFormChange}
                    className="w-full text-xs font-bold px-3 py-3 border border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="Breakfast">Breakfast 🌅</option>
                    <option value="Lunch">Lunch ☀️</option>
                    <option value="Dinner">Dinner 🌌</option>
                  </select>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-1">Weekday Schedule</label>
                  <select
                    name="day"
                    value={menuForm.day}
                    onChange={handleFormChange}
                    className="w-full text-xs font-bold px-3 py-3 border border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none bg-white cursor-pointer"
                  >
                    <option value="All">Everyday (All)</option>
                    <option value="Monday">Monday</option>
                    <option value="Tuesday">Tuesday</option>
                    <option value="Wednesday">Wednesday</option>
                    <option value="Thursday">Thursday</option>
                    <option value="Friday">Friday</option>
                    <option value="Saturday">Saturday</option>
                    <option value="Sunday">Sunday</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-1">Dish Description</label>
                <textarea
                  name="description"
                  value={menuForm.description}
                  onChange={handleFormChange}
                  className="w-full text-xs font-semibold px-3 py-2.5 border border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none"
                  placeholder="Low oil, turmeric yellow dal tarka served with soft hot rotis."
                  rows={2}
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider pl-1">Dish Photo</label>
                
                {/* Image Preview */}
                {imagePreview && (
                  <div className="relative w-full h-40 rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                    <img
                      src={imagePreview}
                      alt="Dish preview"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="absolute top-2 right-2 bg-white/90 hover:bg-white text-slate-600 hover:text-rose-600 p-1.5 rounded-full shadow-md transition-colors"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )}

                {/* Upload Input */}
                <label className="flex flex-col items-center justify-center gap-2 w-full py-4 px-3 border-2 border-dashed border-slate-200 hover:border-brand-400 rounded-xl cursor-pointer bg-slate-50/50 hover:bg-brand-50/30 transition-all group">
                  <ImagePlus className="h-6 w-6 text-slate-300 group-hover:text-brand-500 transition-colors" />
                  <span className="text-[11px] font-semibold text-slate-400 group-hover:text-brand-600 transition-colors">
                    {imageFile ? imageFile.name : 'Click to upload dish photo'}
                  </span>
                  <span className="text-[9px] text-slate-300">PNG, JPG, WEBP up to 5MB</span>
                  <input
                    type="file"
                    name="imageFile"
                    accept="image/*"
                    onChange={handleFormChange}
                    className="hidden"
                  />
                </label>
              </div>

              <div className="flex items-center gap-2 mt-2 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <input
                  type="checkbox"
                  id="available"
                  name="available"
                  checked={menuForm.available}
                  onChange={handleFormChange}
                  className="h-4 w-4 text-brand-500 border-slate-300 rounded focus:ring-brand-400 cursor-pointer"
                />
                <label htmlFor="available" className="text-xs text-slate-700 font-bold cursor-pointer selection:bg-transparent">
                  List as Active & In-Stock immediately
                </label>
              </div>

              <button
                type="submit"
                className="w-full bg-brand-500 hover:bg-brand-600 text-white font-extrabold py-3.5 rounded-2xl text-xs transition-all shadow-md mt-4"
              >
                {editingItem ? 'Save Updates' : 'Launch New Dish'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
