import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { initializeTheme } from './store/useUIStore';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { DashboardLayout } from './layouts/DashboardLayout';

// Route Guards
import { ProtectedRoute } from './routes/ProtectedRoute';
import { RoleRoute } from './routes/RoleRoute';

// Public Pages
import { Home } from './pages/Home';
import { Doctors } from './pages/Doctors';
import { Pharmacy } from './pages/Pharmacy';
import { CartPage } from './pages/CartPage';
import { LabTests } from './pages/LabTests';
import { Insurance } from './pages/Insurance';
import { AIAssistant } from './pages/AIAssistant';
import { Emergency } from './pages/Emergency';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { VerifyOtp } from './pages/VerifyOtp';
import { VideoConsultation } from './pages/VideoConsultation';

// Dashboard Pages
import { PatientDashboard } from './pages/PatientDashboard';
import { PatientAppointments } from './pages/PatientAppointments';
import { PatientLabReports } from './pages/PatientLabReports';
import { PatientInsurance } from './pages/PatientInsurance';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { DoctorAppointments } from './pages/DoctorAppointments';
import { AdminDashboard } from './pages/AdminDashboard';

// Query Client setup
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Dashboard Placeholder for nested routes
const DashPlaceholder: React.FC<{ title: string }> = ({ title }) => (
  <div className="bg-white border border-light-border rounded-xl p-6 shadow-sm">
    <h3 className="text-xl font-bold text-slate-800 mb-2">{title} Page</h3>
    <p className="text-slate-400 text-sm">
      This view will be fully functional when we reach the corresponding development phase. Standard mockups and backend integrations will follow.
    </p>
  </div>
);

function App() {
  useEffect(() => {
    initializeTheme();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routing Section */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="doctors" element={<Doctors />} />
            <Route path="pharmacy" element={<Pharmacy />} />
            <Route path="pharmacy/cart" element={<CartPage />} />
            <Route path="lab-tests" element={<LabTests />} />
            <Route path="insurance" element={<Insurance />} />
            <Route path="ai-assistant" element={<AIAssistant />} />
            <Route path="emergency" element={<Emergency />} />
            
            {/* Guest Only Auth Routes */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="verify-otp" element={<VerifyOtp />} />
          </Route>

          {/* Protected Video Consultation Route */}
          <Route 
            path="/video-consultation/:id" 
            element={
              <ProtectedRoute>
                <VideoConsultation />
              </ProtectedRoute>
            } 
          />

          {/* Protected Patient Dashboard Routing */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['PATIENT']}>
                  <DashboardLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<PatientDashboard />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="records" element={<PatientDashboard />} />
            <Route path="orders" element={<DashPlaceholder title="Medicine Orders" />} />
            <Route path="lab-reports" element={<PatientLabReports />} />
            <Route path="insurance" element={<PatientInsurance />} />
            <Route path="vaccination" element={<DashPlaceholder title="Vaccinations" />} />
            <Route path="family" element={<PatientDashboard />} />
            <Route path="wallet" element={<PatientDashboard />} />
            <Route path="settings" element={<DashPlaceholder title="Patient Settings" />} />
          </Route>

          {/* Protected Doctor Dashboard Routing */}
          <Route 
            path="/dashboard/doctor" 
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['DOCTOR']}>
                  <DashboardLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<DoctorDashboard />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="patients" element={<DoctorDashboard />} />
            <Route path="slots" element={<DoctorDashboard />} />
            <Route path="prescription" element={<DoctorDashboard />} />
            <Route path="video" element={<DashPlaceholder title="Telehealth Video Consultations" />} />
            <Route path="earnings" element={<DashPlaceholder title="Doctor Earnings Ledger" />} />
            <Route path="settings" element={<DashPlaceholder title="Doctor Settings" />} />
          </Route>

          {/* Protected Admin Dashboard Routing */}
          <Route 
            path="/dashboard/admin" 
            element={
              <ProtectedRoute>
                <RoleRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                  <DashboardLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="users" element={<DashPlaceholder title="Platform User Management" />} />
            <Route path="appointments" element={<DashPlaceholder title="Appointment Registry" />} />
            <Route path="medicines" element={<DashPlaceholder title="Medicine Catalog DB" />} />
            <Route path="orders" element={<DashPlaceholder title="Pharmacy E-Commerce Orders" />} />
            <Route path="lab-tests" element={<DashPlaceholder title="Lab Test Inventory" />} />
            <Route path="insurance" element={<DashPlaceholder title="Insurance Packages Setup" />} />
            <Route path="payments" element={<DashPlaceholder title="Payments Settlement Dashboard" />} />
            <Route path="logs" element={<DashPlaceholder title="Admin System Audit Logs" />} />
            <Route path="settings" element={<DashPlaceholder title="Platform Config Settings" />} />
          </Route>

          {/* 404 Fallback redirection */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
