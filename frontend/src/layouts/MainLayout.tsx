import React from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Header } from '../components/layout/Header';
import { Footer } from '../components/layout/Footer';
import { motion } from 'framer-motion';

const AUTH_ONLY_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-otp'];

export const MainLayout: React.FC = () => {
  const location = useLocation();
  const { isAuthenticated, user } = useAuthStore();

  const hideHeaderFooter = AUTH_ONLY_PATHS.includes(location.pathname);

  // If a Doctor or Admin is logged in and tries to access the public website,
  // redirect them to their dedicated dashboard immediately.
  if (isAuthenticated && user && !hideHeaderFooter) {
    if (user.role === 'DOCTOR') {
      return <Navigate to="/dashboard/doctor" replace />;
    }
    if (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN') {
      return <Navigate to="/dashboard/admin" replace />;
    }
    // PATIENT can browse the website freely — no redirect
  }

  return (
    <div className="flex flex-col min-h-screen bg-light-bg transition-colors duration-300">
      {!hideHeaderFooter && <Header />}
      <main className="flex-grow">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          <Outlet />
        </motion.div>
      </main>
      {!hideHeaderFooter && <Footer />}
    </div>
  );
};
