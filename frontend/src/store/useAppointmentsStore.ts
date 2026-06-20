import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  experience: number;
  hospital: string;
  fee: number;
  rating: number;
  reviewsCount: number;
  gender: 'Male' | 'Female';
  avatarUrl?: string;
  vacationMode: boolean;
  slots: string[];
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  doctorSpecialty: string;
  date: string;
  timeSlot: string;
  type: 'VIRTUAL' | 'PHYSICAL';
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
  patientId: string;
  patientName: string;
  reason: string;
  fee: number;
  familyMemberId?: string;
  uploadedRecordName?: string;
  paymentMethod: 'WALLET' | 'CARD';
  videoRoomId?: string;
}

export interface WalletTransaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  amount: number;
  description: string;
  date: string;
}

interface AppointmentsState {
  doctors: Doctor[];
  appointments: Appointment[];
  walletBalance: number;
  walletTransactions: WalletTransaction[];
  
  // Actions
  bookAppointment: (appointment: Omit<Appointment, 'id' | 'status' | 'videoRoomId'>) => { success: boolean; error?: string; appointmentId?: string };
  cancelAppointment: (appointmentId: string) => void;
  updateAppointmentStatus: (appointmentId: string, status: Appointment['status']) => void;
  toggleVacationMode: (doctorId: string, vacation: boolean) => void;
  addDoctorSlot: (doctorId: string, slot: string) => void;
  deleteDoctorSlot: (doctorId: string, slotId: string) => void;
  topUpWallet: (amount: number, description?: string) => void;
  deductWallet: (amount: number, description: string) => boolean;
}

const DEFAULT_DOCTORS: Doctor[] = [
  {
    id: 'doc-1',
    name: 'Dr. Sarah Specialist',
    specialty: 'General Medicine',
    experience: 12,
    hospital: 'MedCare+ General',
    fee: 500,
    rating: 4.9,
    reviewsCount: 128,
    gender: 'Female',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=300&q=80',
    vacationMode: false,
    slots: ['Monday 09:00 AM', 'Wednesday 02:00 PM', 'Friday 10:00 AM'],
  },
  {
    id: 'doc-2',
    name: 'Dr. Amanda Heart',
    specialty: 'Cardiology',
    experience: 15,
    hospital: 'City Heart Hospital',
    fee: 800,
    rating: 4.8,
    reviewsCount: 94,
    gender: 'Female',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813573-246434de83fb?auto=format&fit=crop&w=300&q=80',
    vacationMode: false,
    slots: ['Tuesday 10:00 AM', 'Thursday 02:00 PM', 'Saturday 11:30 AM'],
  },
  {
    id: 'doc-3',
    name: 'Dr. James Derm',
    specialty: 'Dermatology',
    experience: 8,
    hospital: 'Skin & Cosmetology Centre',
    fee: 600,
    rating: 4.7,
    reviewsCount: 56,
    gender: 'Male',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=300&q=80',
    vacationMode: false,
    slots: ['Monday 04:00 PM', 'Wednesday 11:00 AM', 'Thursday 03:30 PM'],
  },
  {
    id: 'doc-4',
    name: 'Dr. Emily Child',
    specialty: 'Pediatrics',
    experience: 10,
    hospital: 'Kids Care Hospital',
    fee: 500,
    rating: 4.9,
    reviewsCount: 82,
    gender: 'Female',
    avatarUrl: 'https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?auto=format&fit=crop&w=300&q=80',
    vacationMode: false,
    slots: ['Tuesday 09:30 AM', 'Wednesday 01:00 PM', 'Friday 04:00 PM'],
  },
  {
    id: 'doc-5',
    name: 'Dr. Robert Brain',
    specialty: 'Neurology',
    experience: 18,
    hospital: 'Brain & Nerve Center',
    fee: 1200,
    rating: 4.9,
    reviewsCount: 110,
    gender: 'Male',
    avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=300&q=80',
    vacationMode: false,
    slots: ['Monday 11:00 AM', 'Friday 02:30 PM'],
  },
  {
    id: 'doc-6',
    name: 'Dr. Lisa Bone',
    specialty: 'Orthopedics',
    experience: 14,
    hospital: 'Bone & Joint Clinic',
    fee: 700,
    rating: 4.6,
    reviewsCount: 42,
    gender: 'Female',
    avatarUrl: 'https://images.unsplash.com/photo-1527613426441-4da17471b66d?auto=format&fit=crop&w=300&q=80',
    vacationMode: false,
    slots: ['Tuesday 03:00 PM', 'Thursday 10:00 AM'],
  },
];

const DEFAULT_TRANSACTIONS: WalletTransaction[] = [
  { id: 'tx-1', type: 'DEBIT', amount: 500.00, description: 'Consultation Fee - Dr. Sarah Specialist', date: new Date().toISOString().split('T')[0] },
  { id: 'tx-2', type: 'CREDIT', amount: 1500.00, description: 'Added funds via Stripe', date: new Date(Date.now() - 86400000).toISOString().split('T')[0] },
  { id: 'tx-3', type: 'DEBIT', amount: 350.00, description: 'E-Pharmacy order #ORD-8821', date: new Date(Date.now() - 86400000 * 4).toISOString().split('T')[0] },
];

export const useAppointmentsStore = create<AppointmentsState>()(
  persist(
    (set, get) => ({
      doctors: DEFAULT_DOCTORS,
      appointments: [
        {
          id: 'apt-1',
          doctorId: 'doc-1',
          doctorName: 'Dr. Sarah Specialist',
          doctorSpecialty: 'General Medicine',
          date: new Date().toISOString().split('T')[0],
          timeSlot: '05:30 PM',
          type: 'VIRTUAL',
          status: 'CONFIRMED',
          patientId: 'pat-default',
          patientName: 'John Patient',
          reason: 'General Consultation',
          fee: 500,
          paymentMethod: 'WALLET',
          videoRoomId: 'room-doc-1-default',
        },
        {
          id: 'apt-2',
          doctorId: 'doc-2',
          doctorName: 'Dr. Amanda Heart',
          doctorSpecialty: 'Cardiology',
          date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
          timeSlot: '10:30 AM',
          type: 'PHYSICAL',
          status: 'PENDING',
          patientId: 'pat-default',
          patientName: 'Emily Doe',
          reason: 'Cardiology Exam',
          fee: 800,
          paymentMethod: 'CARD',
        }
      ],
      walletBalance: 2500.00,
      walletTransactions: DEFAULT_TRANSACTIONS,

      bookAppointment: (aptDetails) => {
        const id = `apt-${Math.random().toString(36).substring(2, 9)}`;
        const status = aptDetails.type === 'VIRTUAL' ? 'CONFIRMED' : 'PENDING';
        const videoRoomId = aptDetails.type === 'VIRTUAL' ? `room-${aptDetails.doctorId}-${id}` : undefined;

        // If paying via wallet, verify balance
        if (aptDetails.paymentMethod === 'WALLET') {
          const success = get().deductWallet(aptDetails.fee, `Consultation Fee - ${aptDetails.doctorName}`);
          if (!success) {
            return { success: false, error: 'Insufficient wallet balance' };
          }
        }

        const newAppointment: Appointment = {
          ...aptDetails,
          id,
          status,
          videoRoomId,
        };

        set((state) => ({
          appointments: [newAppointment, ...state.appointments],
        }));

        return { success: true, appointmentId: id };
      },

      cancelAppointment: (id) => set((state) => ({
        appointments: state.appointments.map((apt) => 
          apt.id === id ? { ...apt, status: 'CANCELLED' } : apt
        )
      })),

      updateAppointmentStatus: (id, status) => set((state) => ({
        appointments: state.appointments.map((apt) => 
          apt.id === id ? { ...apt, status } : apt
        )
      })),

      toggleVacationMode: (doctorId, vacation) => set((state) => ({
        doctors: state.doctors.map((doc) => 
          doc.id === doctorId ? { ...doc, vacationMode: vacation } : doc
        )
      })),

      addDoctorSlot: (doctorId, slot) => set((state) => ({
        doctors: state.doctors.map((doc) => 
          doc.id === doctorId ? { ...doc, slots: [...doc.slots, slot] } : doc
        )
      })),

      deleteDoctorSlot: (doctorId, slot) => set((state) => ({
        doctors: state.doctors.map((doc) => 
          doc.id === doctorId ? { ...doc, slots: doc.slots.filter((s) => s !== slot) } : doc
        )
      })),

      topUpWallet: (amount, description = 'Added funds (Simulated)') => set((state) => {
        const newBalance = state.walletBalance + amount;
        const newTx: WalletTransaction = {
          id: `tx-${Math.random().toString(36).substring(2, 9)}`,
          type: 'CREDIT',
          amount,
          description,
          date: new Date().toISOString().split('T')[0],
        };
        return {
          walletBalance: newBalance,
          walletTransactions: [newTx, ...state.walletTransactions],
        };
      }),

      deductWallet: (amount, description) => {
        const currentBalance = get().walletBalance;
        if (currentBalance < amount) return false;
        
        set((state) => {
          const newBalance = state.walletBalance - amount;
          const newTx: WalletTransaction = {
            id: `tx-${Math.random().toString(36).substring(2, 9)}`,
            type: 'DEBIT',
            amount,
            description,
            date: new Date().toISOString().split('T')[0],
          };
          return {
            walletBalance: newBalance,
            walletTransactions: [newTx, ...state.walletTransactions],
          };
        });
        return true;
      },
    }),
    {
      name: 'medcare-appointments-store',
    }
  )
);
