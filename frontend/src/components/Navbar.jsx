import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { LogOut, Menu as MenuIcon, X, Utensils, User as UserIcon, Bell } from 'lucide-react';
import axios from 'axios';

export default function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  
  // Notification states
  const [notifications, setNotifications] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [toast, setToast] = useState(null);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    switch (user.role) {
      case 'admin': return '/admin';
      case 'kitchen': return '/kitchen';
      case 'delivery': return '/delivery';
      default: return '/customer';
    }
  };

  const fetchNotifications = async () => {
    try {
      const res = await axios.get('/notifications');
      if (res.data.success) {
        const newNotifications = res.data.data;
        // Check for new notifications to show toast
        if (newNotifications.length > notifications.length) {
          const fresh = newNotifications.filter(
            n => !notifications.some(old => old._id === n._id)
          );
          if (fresh.length > 0) {
            setToast(fresh[0]);
            // Auto dismiss toast after 4 seconds
            setTimeout(() => {
              setToast(null);
            }, 4000);
          }
        }
        setNotifications(newNotifications);
      }
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`/notifications/${id}/read`);
      setNotifications(prev => prev.filter(n => n._id !== id));
      // Refresh list to make sure sync
      fetchNotifications();
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  useEffect(() => {
    if (user && user.role === 'delivery') {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
      return () => clearInterval(interval);
    }
  }, [user, notifications.length]);

  return (
    <nav className="glass-panel sticky top-0 z-50 shadow-sm px-6 py-4 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 text-brand-600 font-extrabold text-2xl tracking-wide group">
          <div className="bg-brand-500 text-white p-2 rounded-xl group-hover:rotate-12 transition-transform duration-300 shadow-md shadow-brand-500/20">
            <Utensils className="h-6 w-6" />
          </div>
          <span className="font-extrabold text-slate-800">
            Community<span className="text-brand-500">Dabba</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-6">
          {!user && (
            <Link to="/" className="text-slate-600 hover:text-brand-500 font-medium transition-colors">Home</Link>
          )}
          
          {user ? (
            <>
              <Link to={getDashboardLink()} className="text-slate-600 hover:text-brand-500 font-medium transition-colors">
                Dashboard
              </Link>

              {/* Delivery Notifications Bell Icon & Dropdown */}
              {user.role === 'delivery' && (
                <div className="relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="relative p-2 text-slate-600 hover:text-brand-500 hover:bg-slate-50 rounded-xl transition-all"
                  >
                    <Bell className="h-6 w-6" />
                    {notifications.length > 0 && (
                      <span className="absolute top-1.5 right-1.5 h-4 w-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                        {notifications.length}
                      </span>
                    )}
                  </button>

                  {/* Dropdown Panel */}
                  {showDropdown && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl border border-slate-100 shadow-xl z-50 max-h-96 overflow-y-auto">
                      <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                        <span className="font-bold text-sm text-slate-900">Notifications</span>
                        <span className="text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full font-semibold">
                          {notifications.length} New
                        </span>
                      </div>
                      <div className="divide-y divide-slate-100">
                        {notifications.length > 0 ? (
                          notifications.map((n) => (
                            <div key={n._id} className="p-4 hover:bg-slate-50 transition-colors flex flex-col gap-2">
                              <div className="flex justify-between items-start">
                                <span className="font-bold text-xs text-slate-800">{n.title}</span>
                                <button
                                  onClick={() => handleMarkAsRead(n._id)}
                                  className="text-[10px] bg-slate-100 hover:bg-rose-100 hover:text-rose-700 text-slate-500 px-2 py-0.5 rounded-md font-semibold transition-colors"
                                >
                                  Dismiss
                                </button>
                              </div>
                              <p className="text-xs text-slate-500">{n.message}</p>
                              <span className="text-[10px] text-slate-400 self-end">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ))
                        ) : (
                          <div className="p-8 text-center text-slate-400 text-xs font-semibold">
                            No new notifications
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex items-center gap-4 pl-4 border-l border-slate-200">
                <span className="flex items-center gap-2 text-sm bg-brand-50 text-brand-700 px-3 py-1.5 rounded-full font-semibold border border-brand-100 shadow-sm">
                  <UserIcon className="h-4 w-4" />
                  Hi, {user.name.split(' ')[0]} ({user.role})
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-slate-800 text-white hover:bg-brand-600 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm hover:shadow-brand-500/20"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              className="bg-brand-500 text-white hover:bg-brand-600 px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 shadow-md shadow-brand-500/10 hover:shadow-brand-500/20 hover:-translate-y-0.5"
            >
              Sign In
            </Link>
          )}
        </div>

        {/* Global Toast Notification Popup overlay */}
        {toast && (
          <div className="fixed bottom-6 right-6 bg-slate-900 border border-slate-800 text-white p-5 rounded-2xl shadow-2xl z-[9999] flex items-start gap-4 max-w-sm animate-slide-in-up">
            <div className="bg-brand-500 p-2.5 rounded-xl text-white">
              <Bell className="h-5 w-5 animate-bounce" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-bold text-sm text-brand-400">{toast.title}</h4>
                <button onClick={() => setToast(null)} className="text-slate-400 hover:text-white transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">{toast.message}</p>
              <button
                onClick={() => {
                  handleMarkAsRead(toast._id);
                  setToast(null);
                  navigate('/delivery');
                }}
                className="mt-3 text-xs bg-brand-500 hover:bg-brand-600 text-white px-3 py-1.5 rounded-xl font-bold transition-all inline-block"
              >
                View Dashboard
              </button>
            </div>
          </div>
        )}

        {/* Mobile menu toggle */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-slate-600 hover:text-brand-500 focus:outline-none transition-colors"
        >
          {isOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isOpen && (
        <div className="md:hidden mt-4 pt-4 border-t border-slate-100 flex flex-col gap-3 animate-fade-in">
          {!user && (
            <Link
              to="/"
              onClick={() => setIsOpen(false)}
              className="text-slate-600 hover:text-brand-500 font-semibold py-2 transition-colors"
            >
              Home
            </Link>
          )}
          
          {user ? (
            <>
              <Link
                to={getDashboardLink()}
                onClick={() => setIsOpen(false)}
                className="text-slate-600 hover:text-brand-500 font-semibold py-2 transition-colors"
              >
                Dashboard
              </Link>
              <div className="py-2 border-t border-slate-100 mt-2 flex flex-col gap-3">
                <span className="text-sm text-brand-700 bg-brand-50 px-3 py-1.5 rounded-lg inline-block font-semibold">
                  Hi, {user.name} ({user.role})
                </span>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    handleLogout();
                  }}
                  className="flex items-center justify-center gap-2 w-full bg-slate-800 text-white hover:bg-brand-600 py-2.5 rounded-xl font-bold transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </div>
            </>
          ) : (
            <Link
              to="/login"
              onClick={() => setIsOpen(false)}
              className="bg-brand-500 text-white text-center hover:bg-brand-600 py-2.5 rounded-xl font-bold transition-all"
            >
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}
