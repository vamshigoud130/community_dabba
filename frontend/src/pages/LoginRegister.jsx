import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Mail, Lock, User, Phone, MapPin, Eye, EyeOff, Shield } from 'lucide-react';

export default function LoginRegister() {
  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();
  const [isLoginTab, setIsLoginTab] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'customer',
    phone: '',
    address: ''
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const getDashboardPath = (role) => {
      switch (role) {
        case 'admin': return '/admin';
        case 'kitchen': return '/kitchen';
        case 'delivery': return '/delivery';
        default: return '/customer';
      }
    };

    if (isLoginTab) {
      const res = await login(formData.email, formData.password);
      if (res.success) {
        setSuccessMsg('Logged in successfully! Redirecting...');
        setTimeout(() => {
          navigate(getDashboardPath(res.role));
        }, 1200);
      } else {
        setErrorMsg(res.message);
      }
    } else {
      if (!formData.name || !formData.email || !formData.password || !formData.phone) {
        setErrorMsg('Please fill in all required fields.');
        setLoading(false);
        return;
      }
      const res = await register(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        formData.phone,
        formData.address
      );
      if (res.success) {
        setSuccessMsg('Registration successful! Redirecting...');
        setTimeout(() => {
          navigate(getDashboardPath(res.role));
        }, 1200);
      } else {
        setErrorMsg(res.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex flex-col justify-center items-center py-12 px-6 bg-slate-50 relative overflow-hidden">
      {/* Dynamic Background Accents */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-200/20 rounded-full blur-3xl animate-float"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-amber-200/20 rounded-full blur-3xl" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden z-10">
        {/* Toggle Header Tabs */}
        <div className="flex border-b border-slate-100 bg-slate-50">
          <button
            type="button"
            onClick={() => { setIsLoginTab(true); setErrorMsg(''); }}
            className={`flex-1 py-4 font-bold text-sm transition-all ${
              isLoginTab ? 'bg-white text-brand-600 border-b-2 border-brand-500' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsLoginTab(false); setErrorMsg(''); }}
            className={`flex-1 py-4 font-bold text-sm transition-all ${
              !isLoginTab ? 'bg-white text-brand-600 border-b-2 border-brand-500' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Create Account
          </button>
        </div>

        <div className="p-8">
          {/* Headline */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-slate-950">
              {isLoginTab ? 'Welcome Back!' : 'Join Community Dabba'}
            </h2>
            <p className="text-slate-500 text-sm mt-1">
              {isLoginTab ? 'Please sign in to order your fresh daily meal.' : 'Register to subscribe or join our team.'}
            </p>
          </div>

          {/* Alert Banners */}
          {errorMsg && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 text-rose-700 text-sm font-bold rounded-2xl flex items-center gap-2">
              <span className="bg-rose-100 p-1 rounded-full text-xs">⚠️</span>
              {errorMsg}
            </div>
          )}
          {successMsg && (
            <div className="mb-6 p-4 bg-green-50 border border-green-100 text-green-700 text-sm font-bold rounded-2xl flex items-center gap-2">
              <span className="bg-green-100 p-1 rounded-full text-xs">✔</span>
              {successMsg}
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {!isLoginTab && (
              <div className="flex flex-col gap-1.5">
                <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-1">Full Name *</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Enter your full name"
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-brand-500 focus:outline-none text-slate-800 text-sm font-medium transition-all"
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-1">Email Address *</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@gmail.com"
                  className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-brand-500 focus:outline-none text-slate-800 text-sm font-medium transition-all"
                  required
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-1">Password *</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full pl-12 pr-12 py-3.5 rounded-2xl border border-slate-200 focus:border-brand-500 focus:outline-none text-slate-800 text-sm font-medium transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {!isLoginTab && (
              <>
                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="9876543210"
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-brand-500 focus:outline-none text-slate-800 text-sm font-medium transition-all"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-1">System Role *</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-brand-500 focus:outline-none text-slate-800 text-sm font-medium transition-all appearance-none bg-white cursor-pointer"
                    >
                      <option value="customer">Customer (Order Tiffins / Buy Subscriptions)</option>
                      <option value="kitchen">Kitchen Provider / Cook (Manage Menu & Prep)</option>
                      <option value="delivery">Delivery Agent (Deliver Orders & Navigate)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-slate-700 text-xs font-bold uppercase tracking-wider pl-1">Delivery/Kitchen Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-4 h-5 w-5 text-slate-400" />
                    <textarea
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Hostel, apartment, room number or shop address"
                      rows={3}
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-brand-500 focus:outline-none text-slate-800 text-sm font-medium transition-all"
                    />
                  </div>
                </div>
              </>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand-500 hover:bg-brand-600 text-white font-extrabold py-4 rounded-2xl transition-all duration-300 shadow-md shadow-brand-500/10 hover:shadow-brand-500/25 flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : isLoginTab ? (
                'Sign In'
              ) : (
                'Create My Account'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
