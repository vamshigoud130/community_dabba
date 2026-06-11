import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Calendar, Truck, ShieldCheck, HeartPulse, Star, ArrowRight } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

export default function Home() {
  const [feedbacks, setFeedbacks] = useState([]);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const getDashboardPath = (role) => {
    switch (role) {
      case 'admin': return '/admin';
      case 'kitchen': return '/kitchen';
      case 'delivery': return '/delivery';
      default: return '/customer';
    }
  };

  useEffect(() => {
    if (user) {
      navigate(getDashboardPath(user.role));
    }
  }, [user, navigate]);

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      const res = await axios.get('/feedback');
      if (res.data.success) {
        setFeedbacks(res.data.data.slice(0, 3)); // show top 3
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    }
  };

  const handleSubscribeClick = (e) => {
    e.preventDefault();
    if (user) {
      navigate('/customer', { state: { activeTab: 'subscription' } });
    } else {
      navigate('/login');
    }
  };

  const subscriptionPlans = [
    {
      title: 'Daily Plan',
      price: '₹150',
      period: '/day',
      desc: 'Perfect for tasting our kitchen\'s fresh meals. Single day delivery to your doorstep.',
      features: ['1-Day trial meal box', 'Veg/Non-Veg choices', 'Delivered hot & fresh', 'Free Delivery'],
      color: 'from-orange-400 to-amber-500'
    },
    {
      title: 'Weekly Plan',
      price: '₹900',
      period: '/week',
      desc: 'Great for testing out our service for a full week. Balanced nutrition and variety.',
      features: ['Full 7-day coverage', 'Pause/skip meal option', 'Veg/Non-Veg choices', 'Free Delivery'],
      color: 'from-brand-500 to-brand-600'
    },
    {
      title: 'Monthly Plan',
      price: '₹3,500',
      period: '/month',
      desc: 'Our best value plan for full month-long convenience. Ideal for working professionals and students.',
      features: ['Full 30-day coverage', 'Customizable skip list', 'Pause/resume anytime', 'Extra dessert on Fridays'],
      color: 'from-slate-700 to-slate-900',
      popular: true
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-6 md:py-32 bg-gradient-to-br from-brand-50 via-slate-50 to-amber-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="flex flex-col gap-6 text-center lg:text-left">
            <span className="self-center lg:self-start bg-brand-100 text-brand-700 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest border border-brand-200">
              🍲 Modernizing Tiffin Deliveries
            </span>
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-950 leading-tight">
              Home-cooked meals, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-amber-600">
                Delivered Daily.
              </span>
            </h1>
            <p className="text-slate-600 text-lg md:text-xl max-w-xl mx-auto lg:mx-0 font-medium">
              Community Dabba automates subscriptions, pauses, delivery tracking, and menus for hostels, PG accommodations, and working professionals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mt-4">
              <button
                onClick={handleSubscribeClick}
                className="bg-brand-500 hover:bg-brand-600 text-white font-bold px-8 py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-brand-500/20 hover:shadow-brand-500/35 hover:-translate-y-0.5 transition-all duration-300"
              >
                Get Subscribed Now
                <ArrowRight className="h-5 w-5" />
              </button>
              <a
                href="#plans"
                className="bg-white hover:bg-slate-100 text-slate-800 font-bold px-8 py-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-center transition-all"
              >
                Explore Meal Options
              </a>
            </div>
          </div>

          {/* Hero Banner Grid Image */}
          <div className="relative flex justify-center lg:justify-end animate-float">
            <div className="relative w-full max-w-md h-[400px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white shadow-brand-500/10">
              <img
                src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80"
                alt="Delicious Indian Dabba"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                <p className="text-2xl font-bold">100% Home Cooked</p>
                <p className="text-sm opacity-90">Hygiene approved kitchens, low spice, fresh ingredients.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grid Features */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-950">Why Choose Community Dabba?</h2>
          <p className="text-slate-500 font-medium mt-2">Ditch manual notebooks, payment reminders, and missed lunches.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="bg-brand-50 text-brand-500 p-4 rounded-xl inline-block mb-6 shadow-sm">
              <Calendar className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Dynamic Scheduling</h3>
            <p className="text-slate-500 text-sm">Going out this weekend? Pause or skip any lunch or dinner with a single click. Plan shifts automatically.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="bg-green-50 text-green-600 p-4 rounded-xl inline-block mb-6 shadow-sm">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Reliable Delivery</h3>
            <p className="text-slate-500 text-sm">Our dedicated delivery agents ensure dabbas arrive fresh and hot. Live tracking lets you know when to set the table.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="bg-rose-50 text-rose-500 p-4 rounded-xl inline-block mb-6 shadow-sm">
              <HeartPulse className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Hygiene Certified</h3>
            <p className="text-slate-500 text-sm">Trained home-cooks preparing food in sanitized environments. Only premium oils, organic vegetables, and RO water.</p>
          </div>
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all">
            <div className="bg-amber-50 text-amber-500 p-4 rounded-xl inline-block mb-6 shadow-sm">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold mb-2">Automated Billing</h3>
            <p className="text-slate-500 text-sm">Secure online payment methods. Instant invoice printouts, transparent transaction logging, and wallet capabilities.</p>
          </div>
        </div>
      </section>

      {/* Subscription Plans Section */}
      <section id="plans" className="py-20 px-6 bg-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-950">Simple, Transparent Pricing</h2>
            <p className="text-slate-500 font-medium mt-2">Subscribe to a plan that fits your PG, office, or college lifestyle.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {subscriptionPlans.map((plan, idx) => (
              <div
                key={idx}
                className={`bg-white rounded-3xl overflow-hidden border shadow-lg flex flex-col justify-between transition-all duration-300 hover:-translate-y-2 hover:shadow-xl ${
                  plan.popular ? 'border-brand-500 ring-4 ring-brand-500/10 scale-105 z-10' : 'border-slate-100'
                }`}
              >
                {plan.popular && (
                  <div className="bg-brand-500 text-white text-center py-2 text-xs font-black uppercase tracking-widest">
                    Best Seller 🌟
                  </div>
                )}
                <div className="p-8 flex-grow">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">{plan.title}</h3>
                  <p className="text-slate-500 text-sm mb-6 leading-relaxed">{plan.desc}</p>
                  <div className="flex items-baseline gap-1 mb-8">
                    <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                    <span className="text-slate-500 font-medium">{plan.period}</span>
                  </div>
                  <ul className="flex flex-col gap-4">
                    {plan.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-center gap-3 text-slate-700 text-sm font-medium">
                        <span className="bg-green-100 text-green-600 p-1 rounded-full text-xs">✔</span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-8 bg-slate-50 border-t border-slate-100">
                  <button
                    onClick={handleSubscribeClick}
                    className={`w-full block text-center py-3.5 rounded-2xl font-bold transition-all ${
                      plan.popular
                        ? 'bg-brand-500 hover:bg-brand-600 text-white shadow-md shadow-brand-500/20'
                        : 'bg-white hover:bg-slate-100 text-slate-900 border border-slate-200'
                    }`}
                  >
                    Subscribe Now
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Customer Reviews Section */}
      <section className="py-20 px-6 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-950">Overheard from our Community</h2>
          <p className="text-slate-500 font-medium mt-2">See how customers like Vamshi rate our daily home-cooked boxes.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {feedbacks.length > 0 ? (
            feedbacks.map((f, idx) => (
              <div key={idx} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="flex gap-1 mb-4 text-amber-400">
                    {[...Array(f.foodRating)].map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-current" />
                    ))}
                  </div>
                  <p className="text-slate-600 italic font-medium leading-relaxed">"{f.comment}"</p>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-3">
                  <div className="h-10 w-10 bg-brand-100 rounded-full flex items-center justify-center font-bold text-brand-700 text-sm">
                    {f.userId?.name[0] || 'C'}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">{f.userId?.name || 'Customer'}</h4>
                    <p className="text-slate-400 text-xs font-semibold uppercase">Verified Subscriber</p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-3 text-center py-8 text-slate-400 font-semibold">
              Loading reviews...
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-950 text-white py-12 px-6 border-t border-slate-900">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex flex-col gap-3">
            <h3 className="font-extrabold text-xl">
              Community<span className="text-brand-500">Dabba</span>
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              Connecting local kitchens, delivery networks, PG communities, and corporate users in a single food-fulfillment application.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm uppercase text-slate-300">Quick Operations</h4>
            <Link to="/login" className="text-slate-400 hover:text-white text-sm transition-colors">Start Meal Subscription</Link>
            <Link to="/login" className="text-slate-400 hover:text-white text-sm transition-colors">Register as Kitchen</Link>
            <Link to="/login" className="text-slate-400 hover:text-white text-sm transition-colors">Join Delivery Team</Link>
          </div>
          <div className="flex flex-col gap-3">
            <h4 className="font-bold text-sm uppercase text-slate-300">Contact & Support</h4>
            <p className="text-slate-400 text-sm">📞 Support Line: +91 7981389738</p>
            <p className="text-slate-400 text-sm">📧 Email: chenagonivamshi@gmail.com</p>
            <p className="text-slate-400 text-sm">📍 Head Office: Hitech City, Hyderabad,Telangana</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto border-t border-slate-900 mt-8 pt-8 text-center text-slate-500 text-xs font-semibold">
          © {new Date().getFullYear()} Community Dabba Service. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
