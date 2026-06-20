import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';

import {
  Menu, X, ShoppingCart, LogOut, LayoutDashboard, AlertTriangle, Phone
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const Header: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuthStore();
  const cartItems = useCartStore((state) => state.items);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const navLinks = [
    { label: 'Find Doctors', path: '/doctors' },
    { label: 'Pharmacy', path: '/pharmacy' },
    { label: 'Lab Tests', path: '/lab-tests' },
    { label: 'Insurance', path: '/insurance' },
    { label: 'AI Assistant', path: '/ai-assistant' },
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
    setProfileDropdownOpen(false);
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200">
      {/* Top bar */}
      <div className="bg-primary text-white text-xs py-1.5 px-4 text-center hidden md:block">
        <span>🏥 Trusted by 2M+ patients across India &nbsp;·&nbsp; 24/7 Emergency: </span>
        <a href="tel:1800000000" className="font-bold underline underline-offset-2">1800-000-0000</a>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link to="/" className="flex items-center cursor-pointer select-none flex-shrink-0">
          <img
            src="/medcare-logo.png"
            alt="MedCare+"
            style={{
              height: '44px',
              width: 'auto',
              display: 'block'
            }}
          />
        </Link>


        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center space-x-6">
          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-colors border-b-2 py-1 ${active
                  ? 'text-primary border-primary'
                  : 'text-slate-600 border-transparent hover:text-primary hover:border-primary/40'
                  }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="hidden lg:flex items-center space-x-3">
          {/* Emergency */}
          <Link to="/emergency">
            <button className="flex items-center space-x-1.5 text-danger border border-danger/30 bg-danger/5 hover:bg-danger/10 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer">
              <Phone className="h-3.5 w-3.5" />
              <span>Emergency</span>
            </button>
          </Link>

          {/* Cart */}
          <Link to="/pharmacy/cart" className="relative p-2 text-slate-500 hover:text-primary rounded-lg hover:bg-slate-50 transition-all cursor-pointer">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Auth */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 focus:outline-none cursor-pointer bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 hover:bg-slate-100 transition-colors"
              >
                <div className="h-6 w-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs">
                  {user.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-slate-700 max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
              </button>

              <AnimatePresence>
                {profileDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setProfileDropdownOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 8 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-52 rounded-xl border border-slate-200 bg-white shadow-lg p-2 z-40"
                    >
                      <div className="px-3 py-2 border-b border-slate-100 mb-1">
                        <p className="text-sm font-semibold text-slate-800 truncate">{user.name}</p>
                        <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      </div>

                      <Link
                        to="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        <span>My Dashboard</span>
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-danger hover:bg-red-50 rounded-lg transition-colors mt-0.5 cursor-pointer text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        <span>Log Out</span>
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link to="/login">
                <button className="text-sm font-medium text-slate-700 hover:text-primary px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                  Sign In
                </button>
              </Link>
              <Link to="/register">
                <button className="text-sm font-semibold bg-primary text-white px-4 py-1.5 rounded-lg hover:bg-primary-hover transition-colors cursor-pointer">
                  Get Started
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle */}
        <div className="flex items-center space-x-2 lg:hidden">
          <Link to="/pharmacy/cart" className="relative p-2 text-slate-500 rounded-lg cursor-pointer">
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-slate-200 bg-white"
          >
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2.5 text-sm rounded-lg font-medium transition-colors ${isActive(link.path)
                    ? 'bg-primary/5 text-primary font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                    }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>

            <div className="border-t border-slate-100 px-4 py-4 space-y-2">
              <Link to="/emergency" onClick={() => setMobileMenuOpen(false)}>
                <button className="w-full flex items-center justify-center space-x-2 text-sm font-semibold text-danger border border-danger/30 bg-danger/5 py-2.5 rounded-lg">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Emergency SOS</span>
                </button>
              </Link>
              {isAuthenticated && user ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full flex items-center space-x-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 py-2.5 px-4 rounded-lg">
                      <LayoutDashboard className="h-4 w-4" />
                      <span>My Dashboard</span>
                    </button>
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center space-x-2 text-sm font-medium text-danger py-2.5 px-4 rounded-lg hover:bg-red-50">
                    <LogOut className="h-4 w-4" />
                    <span>Log Out</span>
                  </button>
                </>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full border border-slate-300 text-slate-700 text-sm font-medium py-2.5 rounded-lg hover:bg-slate-50">Sign In</button>
                  </Link>
                  <Link to="/register" onClick={() => setMobileMenuOpen(false)}>
                    <button className="w-full bg-primary text-white text-sm font-semibold py-2.5 rounded-lg hover:bg-primary-hover">Get Started</button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
