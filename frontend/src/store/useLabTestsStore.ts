import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAppointmentsStore } from './useAppointmentsStore';

export interface LabTest {
  id: string;
  name: string;
  price: number;
  description: string;
  fastingRequired: boolean;
  reportingTime: string; // e.g. "12 Hours", "24 Hours"
  parameters: string[]; // e.g. ["Cholesterol", "HDL", "LDL"]
}

export interface LabPackage {
  id: string;
  name: string;
  price: number;
  description: string;
  testsCount: number;
  testsList: string[];
  fastingRequired: boolean;
  badge?: string;
}

export interface LabCartItem {
  id: string;
  name: string;
  price: number;
  isPackage: boolean;
}

export interface DiagnosticParameterResult {
  name: string;
  value: string;
  unit: string;
  referenceRange: string;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
}

export interface LabReport {
  id: string;
  bookingId: string;
  patientName: string;
  date: string;
  technicianName: string;
  results: DiagnosticParameterResult[];
}

export interface LabBooking {
  id: string;
  patientName: string;
  familyMemberId?: string;
  date: string;
  timeSlot: string;
  address: {
    street: string;
    city: string;
    pincode: string;
  };
  items: LabCartItem[];
  totalPrice: number;
  paymentMethod: 'WALLET' | 'CARD';
  status: 'PENDING_COLLECTION' | 'SAMPLE_COLLECTED' | 'RESULT_GENERATED' | 'CANCELLED';
  report?: LabReport;
}

interface LabTestsState {
  tests: LabTest[];
  packages: LabPackage[];
  cart: LabCartItem[];
  bookings: LabBooking[];
  
  // Actions
  addToCart: (item: LabCartItem) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  bookLabTests: (booking: Omit<LabBooking, 'id' | 'status' | 'report'>) => { success: boolean; error?: string; bookingId?: string };
  cancelBooking: (bookingId: string) => void;
  updateBookingStatus: (bookingId: string, status: LabBooking['status']) => void;
}

const DEFAULT_TESTS: LabTest[] = [
  { id: 'test-1', name: 'Lipid Profile Screen', price: 499, description: 'Measures cholesterol levels to evaluate cardiovascular risk.', fastingRequired: true, reportingTime: '12 Hours', parameters: ['Total Cholesterol', 'HDL Cholesterol', 'LDL Cholesterol', 'Triglycerides'] },
  { id: 'test-2', name: 'HbA1c (Glycated Haemoglobin)', price: 390, description: 'Indicates average blood glucose levels over the past 3 months.', fastingRequired: false, reportingTime: '12 Hours', parameters: ['HbA1c Level', 'Estimated Avg Glucose'] },
  { id: 'test-3', name: 'Complete Blood Count (CBC)', price: 299, description: 'Evaluates overall health and detects diverse disorders like anemia or infections.', fastingRequired: false, reportingTime: '8 Hours', parameters: ['Hemoglobin', 'White Blood Cells', 'Platelet Count', 'RBC Count'] },
  { id: 'test-4', name: 'Thyroid Profile (T3, T4, TSH)', price: 450, description: 'Assesses thyroid gland activity and metabolic hormone balances.', fastingRequired: true, reportingTime: '12 Hours', parameters: ['Triiodothyronine (T3)', 'Thyroxine (T4)', 'Thyroid Stimulating Hormone (TSH)'] },
  { id: 'test-5', name: 'Vitamin D3 (25-Hydroxy)', price: 999, description: 'Measures vitamin D levels which is vital for bone structural stability.', fastingRequired: false, reportingTime: '24 Hours', parameters: ['25-Hydroxy Vitamin D'] },
  { id: 'test-6', name: 'Liver Function Test (LFT)', price: 550, description: 'Screens for liver infections, damages, or clinical inflammation.', fastingRequired: true, reportingTime: '12 Hours', parameters: ['Bilirubin Total', 'SGOT / AST', 'SGPT / ALT', 'Alkaline Phosphatase'] },
];

const DEFAULT_PACKAGES: LabPackage[] = [
  {
    id: 'pkg-1',
    name: 'Active Wellness Health Package',
    price: 999,
    description: 'Essential wellness screening covering sugar levels, complete blood count, and key lipid parameters.',
    testsCount: 3,
    testsList: ['Complete Blood Count (CBC)', 'Lipid Profile Screen', 'Fasting Blood Sugar'],
    fastingRequired: true,
    badge: 'POPULAR',
  },
  {
    id: 'pkg-2',
    name: 'Comprehensive Full Body Panel',
    price: 1999,
    description: 'Thorough screening comprising thyroid profiles, renal filters, liver panels, and essential vitamin deposits.',
    testsCount: 6,
    testsList: ['Complete Blood Count (CBC)', 'Thyroid Profile', 'Liver Function Test (LFT)', 'Kidney Function Test (KFT)', 'Lipid Profile Screen', 'Vitamin D3 Check'],
    fastingRequired: true,
    badge: 'PREMIUM',
  },
  {
    id: 'pkg-3',
    name: 'Senior Citizen Special (Gold)',
    price: 1499,
    description: 'Specialized health panels configured for mature age groups to track heart, sugar, and bone parameters.',
    testsCount: 4,
    testsList: ['Lipid Profile Screen', 'HbA1c Glycated Haemoglobin', 'Thyroid Profile', 'Kidney Function Test (KFT)'],
    fastingRequired: true,
    badge: 'AGE CARE',
  }
];

const DEFAULT_BOOKINGS: LabBooking[] = [
  {
    id: 'lb-101',
    patientName: 'John Patient',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '08:00 AM - 10:00 AM',
    address: { street: '100 Health Avenue', city: 'Mumbai', pincode: '400001' },
    items: [{ id: 'test-1', name: 'Lipid Profile Screen', price: 499, isPackage: false }],
    totalPrice: 499,
    paymentMethod: 'WALLET',
    status: 'RESULT_GENERATED',
    report: {
      id: 'rep-8890',
      bookingId: 'lb-101',
      patientName: 'John Patient',
      date: new Date().toISOString().split('T')[0],
      technicianName: 'Dr. Michael Diagnostics',
      results: [
        { name: 'Total Cholesterol', value: '185', unit: 'mg/dL', referenceRange: '125 - 200', status: 'OPTIMAL' },
        { name: 'HDL Cholesterol', value: '42', unit: 'mg/dL', referenceRange: '> 40', status: 'OPTIMAL' },
        { name: 'LDL Cholesterol', value: '115', unit: 'mg/dL', referenceRange: '< 100', status: 'WARNING' },
        { name: 'Triglycerides', value: '140', unit: 'mg/dL', referenceRange: '< 150', status: 'OPTIMAL' }
      ]
    }
  },
  {
    id: 'lb-102',
    patientName: 'Leo Doe',
    date: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
    timeSlot: '10:00 AM - 12:00 PM',
    address: { street: '100 Health Avenue', city: 'Mumbai', pincode: '400001' },
    items: [{ id: 'test-3', name: 'Complete Blood Count (CBC)', price: 299, isPackage: false }],
    totalPrice: 299,
    paymentMethod: 'CARD',
    status: 'PENDING_COLLECTION'
  }
];

export const useLabTestsStore = create<LabTestsState>()(
  persist(
    (set) => ({
      tests: DEFAULT_TESTS,
      packages: DEFAULT_PACKAGES,
      cart: [],
      bookings: DEFAULT_BOOKINGS,

      addToCart: (item) => set((state) => {
        // Prevent duplicate checks in cart
        if (state.cart.some((c) => c.id === item.id)) return {};
        return { cart: [...state.cart, item] };
      }),

      removeFromCart: (itemId) => set((state) => ({
        cart: state.cart.filter((c) => c.id !== itemId),
      })),

      clearCart: () => set({ cart: [] }),

      bookLabTests: (bookingDetails) => {
        const id = `lb-${Math.random().toString(36).substring(2, 9)}`;
        
        // E-Wallet logic
        if (bookingDetails.paymentMethod === 'WALLET') {
          const deductSuccess = useAppointmentsStore.getState().deductWallet(
            bookingDetails.totalPrice,
            `Diagnostic Booking #${id.toUpperCase()}`
          );
          if (!deductSuccess) {
            return { success: false, error: 'Insufficient wallet balance' };
          }
        }

        const newBooking: LabBooking = {
          ...bookingDetails,
          id,
          status: 'PENDING_COLLECTION',
        };

        set((state) => ({
          bookings: [newBooking, ...state.bookings],
          cart: [], // Clear cart after booking
        }));

        return { success: true, bookingId: id };
      },

      cancelBooking: (id) => set((state) => ({
        bookings: state.bookings.map((b) => 
          b.id === id ? { ...b, status: 'CANCELLED' } : b
        )
      })),

      updateBookingStatus: (id, status) => set((state) => {
        return {
          bookings: state.bookings.map((b) => {
            if (b.id !== id) return b;
            
            let report: LabReport | undefined = b.report;
            // Auto generate report if status completes
            if (status === 'RESULT_GENERATED' && !b.report) {
              const mockResults: DiagnosticParameterResult[] = b.items.flatMap((item) => {
                if (item.id === 'test-1' || item.id === 'pkg-1') {
                  // Lipid mock parameters
                  return [
                    { name: 'Total Cholesterol', value: '190', unit: 'mg/dL', referenceRange: '125 - 200', status: 'OPTIMAL' },
                    { name: 'HDL Cholesterol', value: '45', unit: 'mg/dL', referenceRange: '> 40', status: 'OPTIMAL' },
                    { name: 'LDL Cholesterol', value: '130', unit: 'mg/dL', referenceRange: '< 100', status: 'WARNING' },
                  ];
                }
                if (item.id === 'test-2') {
                  // HbA1c
                  return [
                    { name: 'HbA1c Level', value: '6.4', unit: '%', referenceRange: '4.0 - 5.6', status: 'WARNING' },
                    { name: 'Estimated Avg Glucose', value: '137', unit: 'mg/dL', referenceRange: '80 - 120', status: 'WARNING' },
                  ];
                }
                // Fallback default Complete Blood Count parameters
                return [
                  { name: 'Hemoglobin', value: '13.8', unit: 'g/dL', referenceRange: '12.0 - 16.0', status: 'OPTIMAL' },
                  { name: 'White Blood Cells', value: '7,500', unit: '/cu mm', referenceRange: '4,000 - 11,000', status: 'OPTIMAL' },
                  { name: 'Platelet Count', value: '250,000', unit: '/cu mm', referenceRange: '150,000 - 450,000', status: 'OPTIMAL' },
                ];
              });

              report = {
                id: `rep-${Math.floor(1000 + Math.random() * 9000)}`,
                bookingId: b.id,
                patientName: b.patientName,
                date: new Date().toISOString().split('T')[0],
                technicianName: 'Dr. Michael Diagnostics',
                results: mockResults,
              };
            }

            return { ...b, status, report };
          })
        };
      })
    }),
    {
      name: 'medcare-lab-tests-store',
    }
  )
);
