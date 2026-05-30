import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import LoginRegister from './pages/LoginRegister';
import CustomerDashboard from './pages/CustomerDashboard';
import KitchenDashboard from './pages/KitchenDashboard';
import DeliveryDashboard from './pages/DeliveryDashboard';
import AdminDashboard from './pages/AdminDashboard';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="bg-slate-50 min-h-screen font-sans flex flex-col justify-between">
          <Navbar />
          
          {/* Main Content Router */}
          <main className="flex-grow">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginRegister />} />

              {/* Secure Customer Portal */}
              <Route
                path="/customer"
                element={
                  <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Secure Cook Portal */}
              <Route
                path="/kitchen"
                element={
                  <ProtectedRoute allowedRoles={['kitchen']}>
                    <KitchenDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Secure Delivery Portal */}
              <Route
                path="/delivery"
                element={
                  <ProtectedRoute allowedRoles={['delivery']}>
                    <DeliveryDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Secure Admin Portal */}
              <Route
                path="/admin"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Universal Fallback redirect to Home */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}
