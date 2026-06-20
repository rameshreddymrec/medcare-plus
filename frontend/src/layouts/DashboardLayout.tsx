import React, { useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useUIStore } from '../store/useUIStore';
import { 
  LayoutDashboard, Calendar, FileText, ShoppingBag, Pill, FlaskConical, 
  ShieldCheck, Syringe, Users, Wallet, Settings, LogOut,
  Menu, X, CreditCard, UserCog, Activity, ShieldAlert, Globe
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DashboardLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated } = useAuthStore();
  const { sidebarOpen, toggleSidebar, setSidebarOpen } = useUIStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) {
    return null;
  }

  const role = user.role;

  // Determines if this role can access the public website
  const canBrowseWebsite = role === 'PATIENT';

  // Sidebar Links based on role
  const getNavLinks = () => {
    switch (role) {
      case 'PATIENT':
        return [
          { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
          { label: 'Appointments', path: '/dashboard/appointments', icon: <Calendar className="h-5 w-5" /> },
          { label: 'Medical Records', path: '/dashboard/records', icon: <FileText className="h-5 w-5" /> },
          { label: 'Medicine Orders', path: '/dashboard/orders', icon: <ShoppingBag className="h-5 w-5" /> },
          { label: 'Lab Reports', path: '/dashboard/lab-reports', icon: <FlaskConical className="h-5 w-5" /> },
          { label: 'Insurance Policy', path: '/dashboard/insurance', icon: <ShieldCheck className="h-5 w-5" /> },
          { label: 'Vaccinations', path: '/dashboard/vaccination', icon: <Syringe className="h-5 w-5" /> },
          { label: 'Family Members', path: '/dashboard/family', icon: <Users className="h-5 w-5" /> },
          { label: 'My Wallet', path: '/dashboard/wallet', icon: <Wallet className="h-5 w-5" /> },
          { label: 'Settings', path: '/dashboard/settings', icon: <Settings className="h-5 w-5" /> },
        ];
      case 'DOCTOR':
        return [
          { label: 'Dashboard', path: '/dashboard/doctor', icon: <LayoutDashboard className="h-5 w-5" /> },
          { label: 'Appointments', path: '/dashboard/doctor/appointments', icon: <Calendar className="h-5 w-5" /> },
          { label: 'My Patients', path: '/dashboard/doctor/patients', icon: <Users className="h-5 w-5" /> },
          { label: 'Availability', path: '/dashboard/doctor/slots', icon: <Activity className="h-5 w-5" /> },
          { label: 'Write Prescription', path: '/dashboard/doctor/prescription', icon: <Pill className="h-5 w-5" /> },
          { label: 'Consultations', path: '/dashboard/doctor/video', icon: <FileText className="h-5 w-5" /> },
          { label: 'Earnings', path: '/dashboard/doctor/earnings', icon: <Wallet className="h-5 w-5" /> },
          { label: 'Settings', path: '/dashboard/doctor/settings', icon: <Settings className="h-5 w-5" /> },
        ];
      case 'ADMIN':
      case 'SUPER_ADMIN':
        return [
          { label: 'Overview', path: '/dashboard/admin', icon: <LayoutDashboard className="h-5 w-5" /> },
          { label: 'Manage Users', path: '/dashboard/admin/users', icon: <UserCog className="h-5 w-5" /> },
          { label: 'Appointments', path: '/dashboard/admin/appointments', icon: <Calendar className="h-5 w-5" /> },
          { label: 'Medicines DB', path: '/dashboard/admin/medicines', icon: <Pill className="h-5 w-5" /> },
          { label: 'E-Shop Orders', path: '/dashboard/admin/orders', icon: <ShoppingBag className="h-5 w-5" /> },
          { label: 'Diagnostics', path: '/dashboard/admin/lab-tests', icon: <FlaskConical className="h-5 w-5" /> },
          { label: 'Insurances', path: '/dashboard/admin/insurance', icon: <ShieldCheck className="h-5 w-5" /> },
          { label: 'Payments Tracker', path: '/dashboard/admin/payments', icon: <CreditCard className="h-5 w-5" /> },
          { label: 'Audit Logs', path: '/dashboard/admin/logs', icon: <ShieldAlert className="h-5 w-5" /> },
          { label: 'Settings', path: '/dashboard/admin/settings', icon: <Settings className="h-5 w-5" /> },
        ];
      default:
        return [
          { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="h-5 w-5" /> },
          { label: 'Settings', path: '/dashboard/settings', icon: <Settings className="h-5 w-5" /> },
        ];
    }
  };

  const navLinks = getNavLinks();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isCurrentActive = (path: string) => {
    if (path === '/dashboard' || path === '/dashboard/doctor' || path === '/dashboard/admin') {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  // Role label and color
  const roleLabel: Record<string, string> = {
    PATIENT: 'Patient Workspace',
    DOCTOR: 'Doctor Workspace',
    ADMIN: 'Admin Console',
    SUPER_ADMIN: 'Super Admin Console',
  };

  const roleBadgeStyle: Record<string, { bg: string; text: string }> = {
    PATIENT: { bg: '#DBEAFE', text: '#1D4ED8' },
    DOCTOR: { bg: '#DCFCE7', text: '#15803D' },
    ADMIN: { bg: '#EDE9FE', text: '#7C3AED' },
    SUPER_ADMIN: { bg: '#FEE2E2', text: '#DC2626' },
  };

  const SidebarContent: React.FC<{ onLinkClick?: () => void }> = ({ onLinkClick }) => (
    <>
      {/* Logo / Brand */}
      <div className="h-16 flex items-center px-6 border-b border-light-border">
        {canBrowseWebsite ? (
          // Patients can click the logo to go back to the main website
          <Link to="/" className="flex items-center" onClick={onLinkClick}>
            <img 
              src="/medcare-logo.png" 
              alt="MedCare+" 
              style={{ 
                height: '32px', 
                width: 'auto',
                display: 'block'
              }} 
            />
          </Link>
        ) : (
          // Doctors/Admins see the logo but it doesn't navigate away
          <div className="flex items-center">
            <img 
              src="/medcare-logo.png" 
              alt="MedCare+" 
              style={{ 
                height: '32px', 
                width: 'auto',
                display: 'block'
              }} 
            />
          </div>
        )}
      </div>

      {/* Role badge */}
      <div className="px-4 pt-4 pb-2">
        <div style={{
          background: roleBadgeStyle[role]?.bg || '#F1F5F9',
          color: roleBadgeStyle[role]?.text || '#64748b',
          borderRadius: '0.5rem',
          padding: '0.375rem 0.75rem',
          fontSize: '0.7rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
          textAlign: 'center',
        }}>
          {role === 'DOCTOR' ? '👨‍⚕️' : role === 'ADMIN' || role === 'SUPER_ADMIN' ? '🛡️' : '👤'} {role}
        </div>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 overflow-y-auto px-4 py-3 space-y-1 scrollbar-thin">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            onClick={onLinkClick}
            className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all group ${
              isCurrentActive(link.path)
                ? 'bg-primary text-white shadow-md shadow-primary/15'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <span className={isCurrentActive(link.path) ? 'text-white' : 'text-slate-400 group-hover:text-primary'}>
              {link.icon}
            </span>
            <span>{link.label}</span>
          </Link>
        ))}

        {/* Patient-only: Browse Website link */}
        {canBrowseWebsite && (
          <div className="pt-3 mt-3 border-t border-slate-100">
            <Link
              to="/"
              onClick={onLinkClick}
              className="flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-50 hover:text-primary transition-all group"
            >
              <Globe className="h-5 w-5 text-slate-400 group-hover:text-primary" />
              <span>Browse Website</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-light-border">
        <button
          onClick={handleLogout}
          className="w-full flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-danger/5 transition-all cursor-pointer"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout Session</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-light-bg overflow-hidden text-slate-800 transition-colors duration-300">
      
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-64 bg-white border-r border-light-border flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer (Overlay) */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 z-40 bg-black lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white border-r border-light-border lg:hidden"
            >
              <div className="absolute top-4 right-4">
                <button onClick={() => setSidebarOpen(false)} className="p-1 rounded-lg text-slate-500 hover:bg-slate-100">
                  <X className="h-6 w-6" />
                </button>
              </div>
              <SidebarContent onLinkClick={() => setSidebarOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 bg-white border-b border-light-border flex-shrink-0 transition-colors duration-300">
          <div className="flex items-center space-x-3">
            <button
              onClick={toggleSidebar}
              className="lg:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 focus:outline-none"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-base sm:text-lg font-bold text-slate-800">
              {roleLabel[role] || 'Dashboard'}
            </h1>
          </div>

          <div className="flex items-center space-x-4">

            {/* Patient: quick link back to browse website */}
            {canBrowseWebsite && (
              <Link
                to="/"
                className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
              >
                <Globe className="h-4 w-4" />
                Browse Website
              </Link>
            )}

            {/* Profile Summary */}
            <div className="flex items-center space-x-3 border-l border-light-border pl-4">
              <span className="hidden sm:inline-block text-sm font-medium text-slate-700">
                {user.name}
              </span>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt={user.name} className="h-8 w-8 rounded-full border border-primary/20 object-cover" />
              ) : (
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold border border-primary/20">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Workspace */}
        <main className="flex-grow overflow-y-auto p-4 sm:p-6 bg-slate-50 scrollbar-thin">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-7xl mx-auto"
          >
            <Outlet />
          </motion.div>
        </main>
      </div>

    </div>
  );
};
