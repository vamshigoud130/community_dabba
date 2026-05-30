import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { ShieldAlert, Users, TrendingUp, ShoppingCart, Calendar, Star, Trash2, Edit, Save, X } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview'); // overview, users, feedback
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [feedbacks, setFeedbacks] = useState([]);

  // Editing state for User Accounts
  const [editingUserId, setEditingUserId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    role: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    fetchAdminStats();
    fetchUsersRoster();
    fetchFeedbacksLog();
  }, [activeTab]);

  const fetchAdminStats = async () => {
    try {
      const res = await axios.get('/admin/stats');
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching admin stats:', err);
    }
  };

  const fetchUsersRoster = async () => {
    try {
      const res = await axios.get('/admin/users');
      if (res.data.success) {
        setUsers(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const fetchFeedbacksLog = async () => {
    try {
      const res = await axios.get('/feedback');
      if (res.data.success) {
        setFeedbacks(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching feedbacks:', err);
    }
  };

  // Modify User Roster
  const handleEditClick = (u) => {
    setEditingUserId(u._id);
    setEditForm({
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      address: u.address || ''
    });
  };

  const handleEditChange = (e) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleSaveUser = async (id) => {
    try {
      const res = await axios.put(`/admin/users/${id}`, editForm);
      if (res.data.success) {
        alert('User details updated successfully!');
        setEditingUserId(null);
        fetchUsersRoster();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating user');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await axios.delete(`/admin/users/${id}`);
      if (res.data.success) {
        fetchUsersRoster();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting user');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen">
      {/* Header Panel */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 w-80 h-full bg-brand-500/10 rounded-l-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="bg-brand-500/20 text-brand-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-brand-500/30">
              Admin Control Board 🔑
            </span>
            <h1 className="text-3xl font-black mt-2">Dabba Operations Manager</h1>
            <p className="text-slate-400 text-sm mt-1 max-w-lg leading-relaxed">
              Verify platform accounts, modify partnership roles, monitor live revenue analytics, and audit feedback reviews.
            </p>
          </div>
          <div className="flex gap-4 flex-wrap">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'overview' ? 'bg-brand-500 text-white shadow-md' : 'bg-white/10 hover:bg-white/15 text-white'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
              Overview
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'users' ? 'bg-brand-500 text-white shadow-md' : 'bg-white/10 hover:bg-white/15 text-white'
              }`}
            >
              <Users className="h-4 w-4" />
              Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('feedback')}
              className={`px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'feedback' ? 'bg-brand-500 text-white shadow-md' : 'bg-white/10 hover:bg-white/15 text-white'
              }`}
            >
              <Star className="h-4 w-4" />
              Feedback Audit ({feedbacks.length})
            </button>
          </div>
        </div>
      </div>

      {/* ==================== PANEL 1: OVERVIEW METRICS & CHART ==================== */}
      {activeTab === 'overview' && stats && (
        <div className="flex flex-col gap-10">
          {/* Dashboard Metric Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
              <div className="bg-green-50 text-green-600 p-4 rounded-2xl">
                <TrendingUp className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Gross Income</p>
                <h4 className="text-2xl font-black text-slate-900 mt-0.5">₹{stats.metrics.totalRevenue}</h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Orders + Subscriptions</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
              <div className="bg-brand-50 text-brand-500 p-4 rounded-2xl">
                <ShoppingCart className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Orders</p>
                <h4 className="text-2xl font-black text-slate-900 mt-0.5">{stats.metrics.totalOrders} Built</h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">One-time and deliveries</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
              <div className="bg-indigo-50 text-indigo-600 p-4 rounded-2xl">
                <Calendar className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Subscriptions</p>
                <h4 className="text-2xl font-black text-slate-900 mt-0.5">{stats.metrics.activeSubscriptions} Active</h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{stats.metrics.pausedSubscriptions} Paused plans</p>
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all">
              <div className="bg-amber-50 text-amber-500 p-4 rounded-2xl">
                <Star className="h-6 w-6 fill-current" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Satisfaction Star</p>
                <h4 className="text-2xl font-black text-slate-900 mt-0.5">{stats.metrics.avgFoodRating} ★</h4>
                <p className="text-[10px] text-slate-500 font-semibold mt-0.5">Avg food quality rating</p>
              </div>
            </div>
          </div>

          {/* Revenue timelines graphs Area */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-8">
            <h3 className="text-lg font-black text-slate-900 pb-4 border-b border-slate-100 mb-6">
              📈 Sales Performance Timeline
            </h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.dailyStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold' }} />
                  <YAxis tickLine={false} tick={{ fontSize: 11, fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ background: '#0f172a', color: '#fff', borderRadius: '12px', border: 'none', fontSize: '12px' }} />
                  <Area type="monotone" dataKey="revenue" stroke="#ea580c" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PANEL 2: USER ACCOUNTS MANAGER ==================== */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-8 flex flex-col gap-6 overflow-x-auto">
          <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-4">
            👤 User Registry
          </h3>

          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-slate-100 text-xs text-slate-400 font-bold uppercase tracking-wider">
                <th className="pb-3 pl-2">User details</th>
                <th className="pb-3">Contact</th>
                <th className="pb-3">System Role</th>
                <th className="pb-3">Home Address</th>
                <th className="pb-3 pr-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const isEditing = editingUserId === u._id;
                return (
                  <tr key={u._id} className="border-b border-slate-50 text-sm font-semibold text-slate-700 hover:bg-slate-50/50 transition-colors">
                    {/* Name */}
                    <td className="py-4 pl-2">
                      {isEditing ? (
                        <input
                          type="text"
                          name="name"
                          value={editForm.name}
                          onChange={handleEditChange}
                          className="px-2 py-1.5 text-xs border border-slate-200 rounded-xl focus:border-brand-500 focus:outline-none"
                        />
                      ) : (
                        <div>
                          <p className="font-extrabold text-slate-900">{u.name}</p>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">{u._id.slice(-6)}</p>
                        </div>
                      )}
                    </td>

                    {/* Email/Phone */}
                    <td className="py-4">
                      {isEditing ? (
                        <div className="flex flex-col gap-1.5">
                          <input
                            type="email"
                            name="email"
                            value={editForm.email}
                            onChange={handleEditChange}
                            className="px-2 py-1 text-xs border border-slate-200 rounded-lg"
                          />
                          <input
                            type="text"
                            name="phone"
                            value={editForm.phone}
                            onChange={handleEditChange}
                            className="px-2 py-1 text-xs border border-slate-200 rounded-lg"
                          />
                        </div>
                      ) : (
                        <div>
                          <p className="text-slate-800 text-xs">{u.email}</p>
                          <p className="text-slate-400 text-xs mt-0.5">{u.phone}</p>
                        </div>
                      )}
                    </td>

                    {/* Role Dropdown */}
                    <td className="py-4">
                      {isEditing ? (
                        <select
                          name="role"
                          value={editForm.role}
                          onChange={handleEditChange}
                          className="px-2 py-1 text-xs border border-slate-200 rounded-lg cursor-pointer bg-white font-bold"
                        >
                          <option value="customer">customer</option>
                          <option value="kitchen">kitchen</option>
                          <option value="delivery">delivery</option>
                          <option value="admin">admin</option>
                        </select>
                      ) : (
                        <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${
                          u.role === 'admin'
                            ? 'bg-rose-50 text-rose-700 border-rose-200'
                            : u.role === 'kitchen'
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : u.role === 'delivery'
                            ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                            : 'bg-green-50 text-green-700 border-green-200'
                        }`}>
                          {u.role}
                        </span>
                      )}
                    </td>

                    {/* Address */}
                    <td className="py-4 max-w-[200px] truncate text-slate-400 font-medium">
                      {isEditing ? (
                        <input
                          type="text"
                          name="address"
                          value={editForm.address}
                          onChange={handleEditChange}
                          className="w-full px-2 py-1.5 text-xs border border-slate-200 rounded-xl"
                        />
                      ) : (
                        u.address || 'Address not listed'
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-4 pr-2 text-right">
                      {isEditing ? (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleSaveUser(u._id)}
                            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-xl border border-transparent shadow transition-colors"
                          >
                            <Save className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setEditingUserId(null)}
                            className="bg-slate-100 hover:bg-slate-200 text-slate-500 p-2 rounded-xl border border-slate-200 transition-colors"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => handleEditClick(u)}
                            className="bg-slate-50 hover:bg-brand-50 text-slate-600 hover:text-brand-700 p-2 rounded-xl border border-slate-200 hover:border-brand-200 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteUser(u._id)}
                            className="bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 p-2 rounded-xl border border-slate-200 hover:border-rose-200 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ==================== PANEL 3: CUSTOMER FEEDBACKS & REVIEW LOGS ==================== */}
      {activeTab === 'feedback' && (
        <div className="bg-white rounded-3xl border border-slate-100 shadow-md p-8 flex flex-col gap-6">
          <h3 className="text-lg font-black text-slate-900 border-b border-slate-100 pb-4">
            ⭐ Platform Reviews
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {feedbacks.length === 0 ? (
              <div className="col-span-2 text-center py-12 text-slate-400 font-semibold">
                No customer feedback logged yet.
              </div>
            ) : (
              feedbacks.map(f => (
                <div key={f._id} className="bg-slate-50 p-6 rounded-3xl border border-slate-100 flex flex-col justify-between hover:shadow shadow-sm transition-all">
                  <div>
                    <div className="flex justify-between items-baseline border-b border-slate-200/50 pb-3 mb-4">
                      <h4 className="font-extrabold text-sm text-slate-900">👤 {f.userId?.name || 'Customer'}</h4>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">
                        {new Date(f.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <p className="text-slate-600 italic font-medium leading-relaxed">"{f.comment || 'No text review left.'}"</p>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-200/50 flex gap-6 text-xs font-bold text-slate-500">
                    <span className="flex items-center gap-1 bg-amber-50 text-amber-700 px-2.5 py-1 rounded-lg border border-amber-100">
                      🍛 Food: {f.foodRating} ★
                    </span>
                    <span className="flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2.5 py-1 rounded-lg border border-indigo-100">
                      🛵 Rider: {f.deliveryRating} ★
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
