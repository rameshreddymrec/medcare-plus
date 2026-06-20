import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

export type UserRole = 
  | 'PATIENT' 
  | 'DOCTOR' 
  | 'LAB_TECH' 
  | 'PHARMACIST' 
  | 'INSURANCE_AGENT' 
  | 'ADMIN' 
  | 'SUPER_ADMIN';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  createdAt: string;
  phoneNumber?: string;
  patientId?: string;
  doctorId?: string;
}

interface AuthState {
  user: UserProfile | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (user: UserProfile, token: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (updatedUser: Partial<UserProfile>) => void;
  
  // Async Database Actions with Client Fallback
  loginWithCredentials: (email: string, password: string, requestedRole?: UserRole) => Promise<{ success: boolean; error?: string; user?: UserProfile }>;
  registerUser: (name: string, email: string, password: string, role: UserRole, phoneNumber?: string) => Promise<{ success: boolean; error?: string }>;
  forgotPasswordRequest: (email: string) => Promise<{ success: boolean; error?: string }>;
  verifyOtpRequest: (email: string, otp: string) => Promise<{ success: boolean; error?: string; resetToken?: string }>;
  resetPasswordRequest: (email: string, newPassword: string, resetToken: string) => Promise<{ success: boolean; error?: string }>;
}

const API_BASE = 'http://localhost:5000/api/v1';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isAuthenticated: false,
      
      login: (user, token, refreshToken) => set({
        user,
        token,
        refreshToken,
        isAuthenticated: true,
      }),
      
      logout: () => {
        // Attempt backend logout, ignore if server offline
        axios.post(`${API_BASE}/auth/logout`).catch(() => {});
        set({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },
      
      updateUser: (updatedUser) => set((state) => ({
        user: state.user ? { ...state.user, ...updatedUser } : null,
      })),

      loginWithCredentials: async (email, password, requestedRole) => {
        try {
          const response = await axios.post(`${API_BASE}/auth/login`, { email, password, role: requestedRole });
          if (response.data?.success) {
            const { accessToken, user } = response.data.data;
            set({
              user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatarUrl: user.avatarUrl,
                phoneNumber: user.phoneNumber,
                patientId: user.patientId,
                doctorId: user.doctorId,
                createdAt: new Date().toISOString(),
              },
              token: accessToken,
              refreshToken: accessToken, // mock refresh fallback
              isAuthenticated: true,
            });
            return { success: true, user: get().user || undefined };
          }
          return { success: false, error: response.data?.message || 'Login failed' };
        } catch (err: any) {
          // If server is down, handle locally via clean mock sandbox fallbacks
          if (!err.response) {
            console.warn('[MedCare+ Auth] Backend down. Applying local mock fallback...');
            
            // Standard simulated credentials check
            if (email === 'admin@medcareplus.com' && password === 'admin123') {
              const mockUser: UserProfile = {
                id: 'usr-admin-mock',
                name: 'System Admin',
                email: 'admin@medcareplus.com',
                role: 'ADMIN',
                createdAt: new Date().toISOString(),
                phoneNumber: '+15550100',
              };
              set({ user: mockUser, token: 'mock-token', refreshToken: 'mock-refresh', isAuthenticated: true });
              return { success: true, user: mockUser };
            }
            
            // Default sandbox login for patient or doctor
            const mockRole = requestedRole || 'PATIENT';
            const name = mockRole === 'DOCTOR' ? 'Dr. Sarah Specialist' : 'John Patient';
            const mockUser: UserProfile = {
              id: `usr_${Math.random().toString(36).substring(2, 9)}`,
              name,
              email: email || 'patient@medcareplus.com',
              role: mockRole,
              createdAt: new Date().toISOString(),
              phoneNumber: '+15550199',
            };
            set({ user: mockUser, token: 'mock-token', refreshToken: 'mock-refresh', isAuthenticated: true });
            return { success: true, user: mockUser };
          }
          return { success: false, error: err.response?.data?.message || 'Invalid credentials' };
        }
      },

      registerUser: async (name, email, password, role, phoneNumber) => {
        try {
          const response = await axios.post(`${API_BASE}/auth/register`, {
            name, email, password, role, phoneNumber
          });
          if (response.data?.success) {
            return { success: true };
          }
          return { success: false, error: response.data?.message || 'Registration failed' };
        } catch (err: any) {
          if (!err.response) {
            console.warn('[MedCare+ Auth] Backend offline. Falling back to local mock register.');
            return { success: true }; // Allow signup simulation offline
          }
          return { success: false, error: err.response?.data?.message || 'Email already registered' };
        }
      },

      forgotPasswordRequest: async (email) => {
        try {
          const response = await axios.post(`${API_BASE}/auth/forgot-password`, { email });
          if (response.data?.success) {
            return { success: true };
          }
          return { success: false, error: response.data?.message };
        } catch (err: any) {
          if (!err.response) {
            console.warn('[MedCare+ Auth] Backend down. Simulating OTP code: 1234');
            return { success: true };
          }
          return { success: false, error: err.response?.data?.message || 'Failed' };
        }
      },

      verifyOtpRequest: async (email, otp) => {
        try {
          const response = await axios.post(`${API_BASE}/auth/verify-otp`, { email, otp });
          if (response.data?.success) {
            return { success: true, resetToken: response.data.data.resetToken };
          }
          return { success: false, error: response.data?.message };
        } catch (err: any) {
          if (!err.response) {
            if (otp === '1234') {
              return { success: true, resetToken: 'mock-reset-token-1234' };
            }
            return { success: false, error: 'Invalid verification OTP. Use 1234 for simulation.' };
          }
          return { success: false, error: err.response?.data?.message || 'Incorrect OTP' };
        }
      },

      resetPasswordRequest: async (email, newPassword, resetToken) => {
        try {
          const response = await axios.post(`${API_BASE}/auth/reset-password`, {
            email, newPassword, resetToken
          });
          if (response.data?.success) {
            return { success: true };
          }
          return { success: false, error: response.data?.message };
        } catch (err: any) {
          if (!err.response) {
            return { success: true };
          }
          return { success: false, error: err.response?.data?.message || 'Failed to reset' };
        }
      },
    }),
    {
      name: 'medcare-auth-store',
    }
  )
);
