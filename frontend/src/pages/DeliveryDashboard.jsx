import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Truck, Compass, DollarSign, MapPin, CheckCircle, Navigation, Phone, ShieldCheck } from 'lucide-react';

export default function DeliveryDashboard() {
  const [activeTab, setActiveTab] = useState('active'); // active, pool, history
  const [activeOrders, setActiveOrders] = useState([]);
  const [poolOrders, setPoolOrders] = useState([]);
  const [historyOrders, setHistoryOrders] = useState([]);

  useEffect(() => {
    fetchActiveDeliveries();
    fetchUnassignedPool();
    fetchDeliveryHistory();
  }, [activeTab]);

  const fetchActiveDeliveries = async () => {
    try {
      const res = await axios.get('/orders'); // returns orders assigned to this delivery guy
      if (res.data.success) {
        setActiveOrders(res.data.data.filter(o => ['Preparing', 'Out for Delivery'].includes(o.status)));
      }
    } catch (err) {
      console.error('Error fetching active deliveries:', err);
    }
  };

  const fetchUnassignedPool = async () => {
    try {
      const res = await axios.get('/orders?status=unassigned');
      if (res.data.success) {
        setPoolOrders(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching pool:', err);
    }
  };

  const fetchDeliveryHistory = async () => {
    try {
      const res = await axios.get('/orders');
      if (res.data.success) {
        setHistoryOrders(res.data.data.filter(o => o.status === 'Delivered'));
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  // Claim order
  const handleClaimOrder = async (id) => {
    try {
      const res = await axios.put(`/orders/${id}/claim`);
      if (res.data.success) {
        alert('Pickup claimed successfully! Drive safe.');
        fetchActiveDeliveries();
        fetchUnassignedPool();
        setActiveTab('active');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error claiming pickup');
    }
  };

  // Complete delivery status
  const handleMarkDelivered = async (id) => {
    try {
      const res = await axios.put(`/orders/${id}/status`, { status: 'Delivered' });
      if (res.data.success) {
        alert('Tiffin delivered successfully! Commission logged.');
        fetchActiveDeliveries();
        fetchDeliveryHistory();
        setActiveTab('history');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error completing delivery');
    }
  };

  // Calculate earnings (₹45 flat fee per delivery)
  const getCommissionTotal = () => {
    return historyOrders.length * 45;
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 min-h-screen">
      {/* Header Widget */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-3xl p-8 mb-8 text-white relative overflow-hidden shadow-xl border border-slate-800">
        <div className="absolute right-0 top-0 w-80 h-full bg-indigo-500/10 rounded-l-full blur-2xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="bg-indigo-500/20 text-indigo-400 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-indigo-500/30">
              Delivery Courier Center 🛵
            </span>
            <h1 className="text-3xl font-black mt-2">Courier Delivery Dashboard</h1>
            <p className="text-slate-400 text-sm mt-1 max-w-lg leading-relaxed">
              Claim food canisters from regional cooks, navigate to local customer addresses, and log your commissions.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'active' ? 'bg-indigo-500 text-white shadow-md' : 'bg-white/10 hover:bg-white/15 text-white'
              }`}
            >
              <Navigation className="h-4 w-4" />
              Active Route ({activeOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('pool')}
              className={`px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 transition-all ${
                activeTab === 'pool' ? 'bg-indigo-500 text-white shadow-md' : 'bg-white/10 hover:bg-white/15 text-white'
              }`}
            >
              <Truck className="h-4 w-4" />
              Pickup Pool ({poolOrders.length})
            </button>
          </div>
        </div>
      </div>

      {/* Grid: Main Panel & Earnings widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Main Panel Content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* ==================== ACTIVE ROUTINGS ==================== */}
          {activeTab === 'active' && (
            <>
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                🛵 Your Active Routes
              </h3>
              
              {activeOrders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center py-20 text-slate-400 font-semibold">
                  No active routings claimed. Open the "Pickup Pool" tab to earn commissions!
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  {activeOrders.map(order => (
                    <div key={order._id} className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 flex flex-col md:flex-row justify-between gap-6 hover:shadow-lg transition-all">
                      <div className="flex-1 flex flex-col gap-4">
                        <div className="flex justify-between items-baseline mb-2">
                          <span className="font-extrabold text-[10px] bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded uppercase">
                            Route #{order._id.slice(-6)}
                          </span>
                          <span className="bg-amber-100 text-amber-800 px-2 py-0.5 rounded text-[9px] font-black uppercase animate-pulse">
                            {order.status}
                          </span>
                        </div>

                        {/* Customer profile details */}
                        <div className="flex flex-col gap-1 text-slate-700 text-sm font-semibold">
                          <h4 className="font-bold text-slate-900 text-base">👤 {order.userId?.name || 'Customer'}</h4>
                          <p className="flex items-center gap-1.5 text-slate-500">
                            <Phone className="h-4 w-4 text-indigo-500" />
                            Call: {order.phone}
                          </p>
                          <p className="flex items-start gap-1.5 text-slate-500 leading-relaxed mt-1">
                            <MapPin className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                            Drop: {order.deliveryAddress}
                          </p>
                        </div>

                        {/* Items list */}
                        <div className="mt-3 bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-1">
                          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Tiffins to Deliver</span>
                          <p className="font-extrabold text-xs text-slate-800">
                            {order.items.map(i => `${i.title} (x${i.quantity})`).join(', ')}
                          </p>
                        </div>
                      </div>

                      {/* Map coordinates simulator and delivery completer */}
                      <div className="w-full md:w-72 bg-slate-950 text-white rounded-2xl p-6 border border-slate-800 flex flex-col justify-between shadow-inner">
                        <div className="flex items-center gap-3">
                          <Compass className="h-8 w-8 text-brand-500 animate-spin" style={{ animationDuration: '8s' }} />
                          <div>
                            <p className="text-[10px] text-brand-400 font-black uppercase tracking-wider">GPS Navigator</p>
                            <p className="font-bold text-xs text-slate-300">Madhapur blocks ➡️ 3.2 Km</p>
                          </div>
                        </div>
                        
                        <div className="my-6 border-t border-slate-800"></div>

                        <button
                          onClick={() => handleMarkDelivered(order._id)}
                          className="w-full bg-green-500 hover:bg-green-600 text-white font-extrabold py-3.5 rounded-xl text-xs transition-all shadow-md"
                        >
                          📦 Mark Delivered
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ==================== PICKUP POOL ==================== */}
          {activeTab === 'pool' && (
            <>
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                📦 Regional Pickup Pool
              </h3>
              
              {poolOrders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center py-20 text-slate-400 font-semibold">
                  No pending pickups available right now. The cooks are prepping, check back soon!
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {poolOrders.map(order => (
                    <div key={order._id} className="bg-white rounded-3xl border border-slate-100 shadow-md p-6 flex flex-col justify-between hover:shadow-lg transition-all">
                      <div>
                        <div className="flex justify-between items-baseline mb-4 pb-3 border-b border-slate-100">
                          <span className="font-extrabold text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">
                            Pickup #{order._id.slice(-6)}
                          </span>
                          <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded text-[9px] font-black uppercase">
                            Ready
                          </span>
                        </div>

                        <div className="flex flex-col gap-2 my-4">
                          <p className="font-extrabold text-sm text-slate-800">
                            {order.items.map(i => `${i.title} (x${i.quantity})`).join(', ')}
                          </p>
                          <p className="text-xs text-slate-500 leading-relaxed mt-1 flex items-start gap-1">
                            <MapPin className="h-4.5 w-4.5 text-indigo-500 shrink-0" />
                            Dest: {order.deliveryAddress.slice(0, 45)}...
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => handleClaimOrder(order._id)}
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-extrabold py-3 rounded-2xl text-xs transition-all shadow-md"
                      >
                        🏍 Claim Delivery Pickup
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* ==================== DELIVERY HISTORY ==================== */}
          {activeTab === 'history' && (
            <>
              <h3 className="text-xl font-black text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
                📋 Completed Deliveries
              </h3>
              
              {historyOrders.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-12 text-center py-20 text-slate-400 font-semibold">
                  You haven't completed any deliveries today.
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {historyOrders.map(order => (
                    <div key={order._id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex justify-between items-center">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-green-50 text-green-500 rounded-full flex items-center justify-center font-extrabold">
                          ✔
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-slate-800">Route #{order._id.slice(-6)}</h4>
                          <p className="text-slate-400 text-xs font-semibold uppercase mt-0.5">
                            Delivered to {order.userId?.name || 'Customer'}
                          </p>
                        </div>
                      </div>
                      <span className="bg-slate-900 text-white text-xs font-black px-3 py-1.5 rounded-lg border border-slate-800">
                        +₹45 Commission
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Riders Earnings Panel */}
        <div className="flex flex-col gap-6">
          
          {/* Earnings card widget */}
          <div className="bg-white rounded-3xl border border-slate-100 shadow-lg p-6 flex flex-col justify-between hover:shadow-xl transition-all">
            <div className="pb-6 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                💼 Rider Account Profile
              </h3>
              <p className="text-slate-400 text-xs font-semibold mt-1">Courier ID: CD-RAMU-504</p>
            </div>

            <div className="my-6 flex flex-col gap-6">
              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Completed Rides Today</label>
                <p className="font-black text-slate-900 text-3xl mt-1">{historyOrders.length} Dabbas</p>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total Commission Earned</label>
                <div className="flex items-baseline gap-1 mt-1 text-green-600">
                  <span className="text-4xl font-black">₹{getCommissionTotal()}</span>
                  <span className="text-xs font-bold text-slate-400 uppercase">Paid Out</span>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                <ShieldCheck className="h-6 w-6 text-green-600" />
                <div>
                  <p className="text-[10px] text-slate-500 font-extrabold uppercase">Payout Account Connected</p>
                  <p className="text-xs text-slate-400 font-bold mt-0.5">State Bank of India ******4023</p>
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-slate-400 font-bold text-center leading-relaxed">
              * Flat payout commission of ₹45 per delivery. Settlement completes at 11:59 PM daily.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
