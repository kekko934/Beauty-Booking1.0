
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HomePage from '@/pages/HomePage';
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import UserDashboardPage from '@/pages/dashboard/UserDashboardPage';
import AdminDashboardPage from '@/pages/dashboard/AdminDashboardPage';
import BookingPage from '@/pages/BookingPage';
import { motion } from 'framer-motion';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import AdminAvailabilityPage from '@/pages/dashboard/AdminAvailabilityPage';

const GlobalLoadingIndicator = () => (
  <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-beige-50">
    <div className="p-8 bg-white/80 backdrop-blur-md rounded-lg shadow-xl">
      <p className="text-xl text-primary font-semibold">Caricamento in corso...</p>
    </div>
  </div>
);

const ProtectedRoute = ({ children }) => {
  const { user, isAdminAuth, loading } = useAuth();

  if (loading) return <GlobalLoadingIndicator />;
  
  if (!user && !isAdminAuth) {
    return <Navigate to="/login" replace />;
  }
  // If it's a user route, and an admin is logged in but NOT as a regular user (user object is null)
  // redirect admin to their dashboard.
  if (!isAdminAuth && user) { // Regular user trying to access a generic protected route
     return children;
  }
  if (isAdminAuth && !user) { // Admin logged in via local creds, not Supabase user
    // If admin is trying to access a general user route (like /dashboard), redirect to admin dash
    // This specific check depends on route definition.
    // Here we assume /dashboard is for users, /admin/dashboard for admins.
    // For /book, an admin might book for a user or themselves if they also have a user account.
    // This logic needs to be fine-tuned based on exact requirements for each route.
    // For now, if it's a non-admin page, and only local admin is logged, redirect to admin dash.
    // This handles cases like /dashboard. /book might need more nuanced handling.
    // Let's assume for now if `adminOnly` is not set, it's a user-accessible route.
    // And if it's an admin trying to access it without a `user` object, they are just an admin.
    // Redirect to admin dashboard.
    // The current check `!user && !isAdminAuth` for navigation to login handles most cases.
    // The `adminOnly` prop is not used in this component anymore. Check `AdminRoute`.
  }

  // If user has a user object, they can access user routes.
  // If an admin also has a user object (logged in via Supabase and email matches admin list), they can also access.
  if (user) {
    return children;
  }

  // Fallback: if only isAdminAuth is true (local admin) and no user object,
  // redirect them to admin dashboard if they try to access a generic user page.
  // This case is tricky. Let's simplify: if not loading and no user, redirect.
  // The specific user vs admin distinction is better handled by separate routes or more complex logic.
  // Given the current structure, if user is null and isAdminAuth is false, redirect to login.
  // If user is present, access is granted.
  // AdminRoute will handle admin-specific protections.
  
  return <Navigate to="/login" replace />; // Default to redirect if conditions not met
};


const AdminRoute = ({ children }) => {
  const { isAdminAuth, loading } = useAuth();

  if (loading) return <GlobalLoadingIndicator />;

  if (!isAdminAuth) {
    return <Navigate to="/login" replace />; 
  }
  return children;
}

function AppContent() {
  const { loading } = useAuth(); // Only need loading state here for the global check
  const location = useLocation();

  if (loading) {
    return <GlobalLoadingIndicator />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-beige-50 text-slate-800">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <motion.div
          key={location.pathname} 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
        >
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <UserDashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin/dashboard" 
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              } 
            />
             <Route 
              path="/admin/availability" 
              element={
                <AdminRoute>
                  <AdminAvailabilityPage />
                </AdminRoute>
              } 
            />
            <Route 
              path="/book" 
              element={
                <ProtectedRoute>
                  <BookingPage />
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </motion.div>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
  