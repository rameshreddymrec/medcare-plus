import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { useAppointmentsStore } from '../store/useAppointmentsStore';
import type { Doctor } from '../store/useAppointmentsStore';
import { useAuthStore } from '../store/useAuthStore';
import { Card, CardHeader, CardTitle, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input, Select } from '../components/common/Input';
import { 
  Search, Star, Video, MapPin, 
  User, Stethoscope, Upload, Lock, CheckCircle, CreditCard, 
  Wallet, ChevronRight, ArrowLeft, Info, AlertTriangle 
} from 'lucide-react';

export const Doctors: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const defaultDoctors = useAppointmentsStore((state) => state.doctors);
  const bookAppointment = useAppointmentsStore((state) => state.bookAppointment);
  const walletBalance = useAppointmentsStore((state) => state.walletBalance);

  const [specialistList, setSpecialistList] = useState<Doctor[]>([]);

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/v1/catalog/doctors');
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          const mapped: Doctor[] = response.data.data.map((d: any) => ({
            id: d.id,
            name: d.user?.name || 'Dr. Medical Expert',
            specialty: d.specialty,
            hospital: d.hospitalName || 'MedCare+ General Hospital',
            experience: d.experience || 5,
            fee: d.consultationFee || 500,
            rating: d.rating || 4.8,
            reviewsCount: d.reviewsCount || 120,
            gender: d.gender || 'All',
            vacationMode: false,
            slots: d.slots ? (typeof d.slots === 'string' ? JSON.parse(d.slots) : d.slots) : ['09:00 AM', '10:30 AM', '12:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'],
          }));
          setSpecialistList(mapped);
        } else {
          setSpecialistList(defaultDoctors);
        }
      } catch (err) {
        console.warn('[MedCare+ Doctors] Catalog API offline, using local fallback.');
        setSpecialistList(defaultDoctors);
      }
    };
    fetchDoctors();
  }, [defaultDoctors]);



  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSpecialty, setSelectedSpecialty] = useState('All');
  const [selectedGender, setSelectedGender] = useState<'All' | 'Male' | 'Female'>('All');
  const [maxFee, setMaxFee] = useState<number>(1500);

  // Booking Modal States
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [bookingStep, setBookingStep] = useState<1 | 2 | 3 | 4>(1); // 1: Date & Slot, 2: Patient Info, 3: Payment Type, 4: simulated Gateway / Processing / Success

  // Booking details
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [consultationType, setConsultationType] = useState<'VIRTUAL' | 'PHYSICAL'>('VIRTUAL');
  const [patientName, setPatientName] = useState(user?.name || 'John Patient');
  const [reason, setReason] = useState('');
  const [uploadedRecord, setUploadedRecord] = useState<string>('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'CARD'>('WALLET');

  // Credit Card mock inputs
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [cardHolder, setCardHolder] = useState(user?.name || '');
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [bookingError, setBookingError] = useState('');

  // Auto-set filters from URL search params
  useEffect(() => {
    const specialtyParam = searchParams.get('specialty');
    if (specialtyParam) {
      setSelectedSpecialty(specialtyParam);
    }
  }, [searchParams]);

  // List of specialties
  const specialties = ['All', 'General Medicine', 'Cardiology', 'Dermatology', 'Pediatrics', 'Neurology', 'Orthopedics'];

  // Filter logic
  const filteredDoctors = useMemo(() => {
    return specialistList.filter((doc) => {
      // Exclude doctors on vacation
      if (doc.vacationMode) return false;

      const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            doc.hospital.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSpecialty = selectedSpecialty === 'All' || doc.specialty === selectedSpecialty;
      const matchesGender = selectedGender === 'All' || doc.gender === selectedGender;
      const matchesFee = doc.fee <= maxFee;

      return matchesSearch && matchesSpecialty && matchesGender && matchesFee;
    });
  }, [specialistList, searchQuery, selectedSpecialty, selectedGender, maxFee]);

  // Next 5 dates builder
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 5; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      const formatted = nextDate.toISOString().split('T')[0];
      const display = nextDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      dates.push({ formatted, display });
    }
    return dates;
  }, []);

  // Predefined hourly slots if doctor slots list is empty
  const defaultTimeSlots = ['09:00 AM', '10:30 AM', '12:00 PM', '02:30 PM', '04:00 PM', '05:30 PM'];

  const handleOpenBooking = (doc: Doctor) => {
    if (!isAuthenticated) {
      // Prompt user or auto-login with custom prompt
      navigate('/login?redirect=doctors');
      return;
    }
    setSelectedDoctor(doc);
    setBookingStep(1);
    setSelectedDate(availableDates[0].formatted);
    setSelectedSlot(doc.slots[0] || defaultTimeSlots[0]);
    setConsultationType('VIRTUAL');
    setReason('');
    setUploadedRecord('');
    setBookingError('');
    setPaymentSuccess(false);
    setShowOtpInput(false);
    setOtpValue('');
  };

  const handleCloseBooking = () => {
    setSelectedDoctor(null);
    setBookingStep(1);
  };

  // Mock File Upload
  const simulateFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    setIsUploading(true);
    setUploadProgress(10);
    
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadedRecord(file.name);
          return 100;
        }
        return prev + 30;
      });
    }, 200);
  };

  // Billing calculation
  const billingSummary = useMemo(() => {
    if (!selectedDoctor) return { fee: 0, tax: 0, total: 0 };
    const fee = selectedDoctor.fee;
    const tax = Math.round(fee * 0.18); // 18% GST standard healthcare service tax
    const total = fee + tax;
    return { fee, tax, total };
  }, [selectedDoctor]);

  // Handle Payment Submit
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor) return;

    setBookingError('');

    if (paymentMethod === 'WALLET') {
      setIsProcessingPayment(true);
      setTimeout(() => {
        const result = bookAppointment({
          doctorId: selectedDoctor.id,
          doctorName: selectedDoctor.name,
          doctorSpecialty: selectedDoctor.specialty,
          date: selectedDate,
          timeSlot: selectedSlot,
          type: consultationType,
          patientId: user?.id || 'pat-guest',
          patientName,
          reason: reason || 'Routine wellness screening',
          fee: billingSummary.total,
          uploadedRecordName: uploadedRecord || undefined,
          paymentMethod: 'WALLET',
        });

        setIsProcessingPayment(false);
        if (result.success) {
          setPaymentSuccess(true);
          setBookingStep(4);
        } else {
          setBookingError(result.error || 'Payment failed. Please review details.');
        }
      }, 1500);
    } else {
      // Card payment triggers OTP
      if (!cardNumber || !cardExpiry || !cardCVC || !cardHolder) {
        setBookingError('All card fields are mandatory.');
        return;
      }
      setShowOtpInput(true);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDoctor || otpValue !== '1234') {
      setBookingError('Incorrect OTP. For testing, use 1234.');
      return;
    }

    setBookingError('');
    setIsProcessingPayment(true);
    
    setTimeout(() => {
      const result = bookAppointment({
        doctorId: selectedDoctor.id,
        doctorName: selectedDoctor.name,
        doctorSpecialty: selectedDoctor.specialty,
        date: selectedDate,
        timeSlot: selectedSlot,
        type: consultationType,
        patientId: user?.id || 'pat-guest',
        patientName,
        reason: reason || 'Routine checkup consult',
        fee: billingSummary.total,
        uploadedRecordName: uploadedRecord || undefined,
        paymentMethod: 'CARD',
      });

      setIsProcessingPayment(false);
      if (result.success) {
        setPaymentSuccess(true);
        setShowOtpInput(false);
        setBookingStep(4);
      } else {
        setBookingError(result.error || 'Booking reservation failed.');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Hero Header */}
      <div style={{
        background: '#fff',
        border: '1px solid #E2E8F0',
        borderRadius: '1.25rem',
        padding: '2rem 2.5rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1.5rem',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
            <Stethoscope style={{ height: '0.875rem', width: '0.875rem', color: '#2563EB' }} />
            <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.12em' }}>Digital Appointment Portal</span>
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: '0 0 0.35rem' }}>Consult Medical Specialists</h1>
          <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Book virtual video sessions or in-person clinical consultations instantly.</p>
        </div>
        <div style={{ position: 'relative', width: '16rem' }}>
          <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', height: '0.875rem', width: '0.875rem', color: '#94a3b8' }} />
          <input
            placeholder="Search by name, clinic..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%', paddingLeft: '2.5rem', paddingRight: '1rem', paddingTop: '0.625rem', paddingBottom: '0.625rem',
              border: '1px solid #E2E8F0', borderRadius: '0.625rem', fontSize: '0.875rem',
              color: '#0F172A', outline: 'none', background: '#F8FAFC', boxSizing: 'border-box',
            }}
          />
        </div>
      </div>

      {/* Main filter & listing grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-bold">Filter Specialists</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              
              {/* Specialty selection */}
              <div className="space-y-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Specialty</span>
                <div className="flex flex-col gap-1.5">
                  {specialties.map((spec) => (
                    <button
                      key={spec}
                      onClick={() => setSelectedSpecialty(spec)}
                      className={`text-left px-3 py-2 rounded-lg text-xs font-semibold transition-all ${
                        selectedSpecialty === spec
                          ? 'bg-primary text-white'
                          : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {spec}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gender selection */}
              <div>
                <Select
                  label="Doctor Gender"
                  options={[
                    { value: 'All', label: 'Any Gender' },
                    { value: 'Male', label: 'Male' },
                    { value: 'Female', label: 'Female' },
                  ]}
                  value={selectedGender}
                  onChange={(e) => setSelectedGender(e.target.value as any)}
                />
              </div>

              {/* Max Consultation Fee */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-semibold text-slate-500">
                  <span>Max Fee</span>
                  <span>₹{maxFee}</span>
                </div>
                <input
                  type="range"
                  min="400"
                  max="1500"
                  step="100"
                  value={maxFee}
                  onChange={(e) => setMaxFee(parseInt(e.target.value))}
                  className="w-full accent-primary"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Doctor Profiles Listings */}
        <div className="lg:col-span-3">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredDoctors.map((doc) => (
              <div
                key={doc.id}
                style={{
                  background: '#fff',
                  border: '1px solid #E2E8F0',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
                  cursor: 'pointer',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                  (e.currentTarget as HTMLElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLElement).style.transform = 'none';
                }}
              >
                {/* Avatar + specialty */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.875rem' }}>
                  <div style={{
                    height: '3.25rem', width: '3.25rem', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #EFF6FF, #DBEAFE)',
                    border: '2px solid #BFDBFE',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 700, fontSize: '0.875rem', color: '#2563EB', flexShrink: 0,
                  }}>
                    {doc.name.replace('Dr. ', '').split(' ').map((n: string) => n[0]).join('')}
                  </div>
                  <div>
                    <span style={{
                      display: 'inline-block', fontSize: '0.65rem', fontWeight: 700,
                      background: '#EFF6FF', color: '#2563EB',
                      padding: '0.15rem 0.6rem', borderRadius: '9999px',
                      textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.25rem',
                    }}>{doc.specialty}</span>
                    <h3 style={{ fontSize: '0.9375rem', fontWeight: 700, color: '#0F172A', margin: 0 }}>{doc.name}</h3>
                  </div>
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: '#64748b' }}>
                    <MapPin style={{ height: '0.75rem', width: '0.75rem', color: '#94a3b8' }} />
                    {doc.hospital}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: '#64748b' }}>
                    <Star style={{ height: '0.75rem', width: '0.75rem', color: '#f59e0b', fill: '#f59e0b' }} />
                    {doc.rating} <span style={{ color: '#94a3b8' }}>({doc.reviewsCount} reviews)</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.25rem' }}>
                    <span style={{ fontSize: '0.8125rem', color: '#64748b' }}>Exp: <strong style={{ color: '#334155' }}>{doc.experience} yrs</strong></span>
                    <span style={{ fontSize: '0.9375rem', fontWeight: 800, color: '#0F172A' }}>₹{doc.fee}</span>
                  </div>
                </div>

                {/* Button */}
                <button
                  onClick={() => handleOpenBooking(doc)}
                  style={{
                    width: '100%', padding: '0.625rem',
                    background: '#2563EB', color: '#fff',
                    border: 'none', borderRadius: '0.625rem',
                    fontSize: '0.875rem', fontWeight: 700, cursor: 'pointer',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
                  onMouseLeave={(e) => (e.currentTarget as HTMLElement).style.opacity = '1'}
                >
                  Book Appointment
                </button>
              </div>
            ))}
            {filteredDoctors.length === 0 && (
              <div className="col-span-full text-center py-12">
                <p className="text-slate-500">No doctors found matching filters.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>

      {/* Booking Modal Overlay */}
      <AnimatePresence>
        {selectedDoctor && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseBooking}
              className="fixed inset-0 z-50 bg-black"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-light-border">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-bold">Book Appointment</h3>
                    <p className="text-xs text-slate-450">{selectedDoctor.name} - {selectedDoctor.specialty}</p>
                  </div>
                  <button onClick={handleCloseBooking} className="text-slate-400 hover:text-slate-655 text-xl font-bold">
                    &times;
                  </button>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="w-full bg-slate-100 h-1">
                <motion.div 
                  className="bg-primary h-full"
                  animate={{ width: `${(bookingStep / 4) * 100}%` }}
                />
              </div>

              {/* Body */}
              <div className="p-6 max-h-[60vh] overflow-y-auto space-y-4">
                {bookingError && (
                  <div className="p-3 bg-danger/10 border border-danger/20 text-danger rounded-lg flex items-center space-x-2 text-xs">
                    <AlertTriangle className="h-4 w-4 shrink-0" />
                    <span>{bookingError}</span>
                  </div>
                )}

                {/* STEP 1: Date and slots */}
                {bookingStep === 1 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-450 block">Select Date</label>
                      <div className="grid grid-cols-5 gap-2">
                        {availableDates.map((date) => (
                          <button
                            key={date.formatted}
                            onClick={() => setSelectedDate(date.formatted)}
                            className={`p-2 rounded-lg border text-center transition-all cursor-pointer ${
                              selectedDate === date.formatted
                                ? 'bg-primary text-white border-primary font-semibold'
                                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            <span className="text-[10px] block leading-none">{date.display.split(',')[0]}</span>
                            <span className="text-sm font-bold block mt-1 leading-none">{date.display.split(' ')[2] || date.display.split(' ')[1]}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-450 block">Available Time Slots</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(selectedDoctor.slots.length > 0 ? selectedDoctor.slots : defaultTimeSlots).map((slot) => {
                          const timeStr = slot.includes(' ') && slot.split(' ').length > 1 ? slot.substring(slot.indexOf(' ') + 1) : slot;
                          return (
                            <button
                              key={slot}
                              onClick={() => setSelectedSlot(slot)}
                              className={`p-2.5 rounded-lg border text-center text-xs font-semibold transition-all cursor-pointer ${
                                selectedSlot === slot
                                  ? 'bg-primary text-white border-primary'
                                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              {timeStr}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-450 block">Consultation Type</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setConsultationType('VIRTUAL')}
                          className={`p-3 rounded-xl border-2 text-left flex items-start space-x-3 transition-all cursor-pointer ${
                            consultationType === 'VIRTUAL'
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-slate-200/70 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <Video className="h-5 w-5 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-xs font-semibold block">Virtual Consult</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Video consultation room.</span>
                          </div>
                        </button>
                        <button
                          onClick={() => setConsultationType('PHYSICAL')}
                          className={`p-3 rounded-xl border-2 text-left flex items-start space-x-3 transition-all cursor-pointer ${
                            consultationType === 'PHYSICAL'
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-slate-200/70 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <MapPin className="h-5 w-5 mt-0.5 shrink-0" />
                          <div>
                            <span className="text-xs font-semibold block">In-Person Visit</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Visit doctor at hospital.</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 2: Patient Info */}
                {bookingStep === 2 && (
                  <div className="space-y-3">
                    <Input
                      label="Patient Name"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="Enter patient full name"
                      leftIcon={<User className="h-4 w-4 text-slate-400" />}
                      required
                    />

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-450 block">Reason for Visit</label>
                      <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Briefly describe symptoms or purpose"
                        className="w-full p-2.5 rounded-lg border border-slate-200 bg-transparent text-xs text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all min-h-[80px]"
                      />
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-semibold text-slate-450 block">Medical Records / Prescription (Optional)</span>
                      <div className="border border-dashed border-slate-350 rounded-xl p-4 text-center hover:bg-slate-50 transition-all relative">
                        <input
                          type="file"
                          accept=".pdf,.png,.jpg"
                          onChange={simulateFileUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          disabled={isUploading}
                        />
                        {isUploading ? (
                          <div className="space-y-2 text-xs">
                            <p className="text-primary font-medium">Uploading record...</p>
                            <div className="w-full bg-slate-100 h-1 rounded overflow-hidden max-w-xs mx-auto">
                              <div className="bg-primary h-full" style={{ width: `${uploadProgress}%` }} />
                            </div>
                          </div>
                        ) : uploadedRecord ? (
                          <div className="flex items-center justify-center space-x-2 text-xs">
                            <CheckCircle className="h-5 w-5 text-success" />
                            <span className="font-semibold">{uploadedRecord}</span>
                          </div>
                        ) : (
                          <div className="space-y-1 text-xs text-slate-455">
                            <Upload className="h-5 w-5 mx-auto text-slate-400 mb-1" />
                            <p>Drag or browse to select files</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* STEP 3: Payment Type & Billing Summary */}
                {bookingStep === 3 && (
                  <div className="space-y-4">
                    {/* Invoice */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200/50 space-y-2">
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>Consultation fee</span>
                        <span>₹{billingSummary.fee.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs text-slate-500">
                        <span>Healthcare GST (18%)</span>
                        <span>₹{billingSummary.tax.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-slate-200 pt-2 flex justify-between items-center text-sm font-bold">
                        <span>Total Payable</span>
                        <span className="text-primary">₹{billingSummary.total.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Method Selector */}
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-450 block">Payment Method</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setPaymentMethod('WALLET')}
                          className={`p-3 rounded-xl border-2 text-left flex items-center space-x-3 transition-all cursor-pointer ${
                            paymentMethod === 'WALLET'
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-slate-200/70 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <Wallet className="h-5 w-5 shrink-0" />
                          <div>
                            <span className="text-xs font-semibold block">E-Wallet</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Balance: ₹{walletBalance.toFixed(2)}</span>
                          </div>
                        </button>
                        <button
                          onClick={() => setPaymentMethod('CARD')}
                          className={`p-3 rounded-xl border-2 text-left flex items-center space-x-3 transition-all cursor-pointer ${
                            paymentMethod === 'CARD'
                              ? 'border-primary bg-primary/5 text-primary'
                              : 'border-slate-200/70 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          <CreditCard className="h-5 w-5 shrink-0" />
                          <div>
                            <span className="text-xs font-semibold block">Credit/Debit Card</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">Mock payment gateway.</span>
                          </div>
                        </button>
                      </div>
                    </div>

                    {paymentMethod === 'WALLET' && (
                      <div className="space-y-2">
                        {walletBalance < billingSummary.total ? (
                          <div className="p-3 bg-danger/10 border border-danger/20 text-danger rounded-lg flex items-center space-x-2 text-xs">
                            <Info className="h-4 w-4" />
                            <span>Wallet balance insufficient. Please top up or select card payment.</span>
                          </div>
                        ) : (
                          <div className="p-3 bg-slate-50 rounded-lg flex items-center space-x-2 text-xs text-slate-500">
                            <Info className="h-4 w-4 text-primary" />
                            <span>Payment will be deducted directly from your e-wallet.</span>
                          </div>
                        )}
                      </div>
                    )}

                    {paymentMethod === 'CARD' && !showOtpInput && (
                      <form onSubmit={handlePaymentSubmit} className="space-y-3">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase block">Cardholder Name</label>
                          <input
                            type="text"
                            placeholder="Enter cardholder name"
                            value={cardHolder}
                            onChange={(e) => setCardHolder(e.target.value)}
                            required
                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-transparent text-xs text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 uppercase block">Card Number</label>
                          <input
                            type="text"
                            placeholder="4111 2222 3333 4444"
                            maxLength={16}
                            value={cardNumber}
                            onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                            required
                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-transparent text-xs text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase block">Expiry Date</label>
                            <input
                              type="text"
                              placeholder="MM/YY"
                              maxLength={5}
                              value={cardExpiry}
                              onChange={(e) => setCardExpiry(e.target.value)}
                              required
                              className="w-full p-2.5 rounded-lg border border-slate-200 bg-transparent text-xs text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400 uppercase block">CVC</label>
                            <input
                              type="password"
                              placeholder="***"
                              maxLength={3}
                              value={cardCVC}
                              onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, ''))}
                              required
                              className="w-full p-2.5 rounded-lg border border-slate-200 bg-transparent text-xs text-slate-700 outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                            />
                          </div>
                        </div>
                      </form>
                    )}

                    {paymentMethod === 'CARD' && showOtpInput && (
                      <div className="space-y-3 p-4 border border-slate-200 rounded-xl bg-slate-50 text-center">
                        <Lock className="h-6 w-6 text-primary mx-auto" />
                        <h4 className="text-sm font-semibold">Enter OTP</h4>
                        <p className="text-xs text-slate-400">For testing, enter code <strong className="text-slate-700">1234</strong></p>
                        
                        <form onSubmit={handleVerifyOtp} className="space-y-3 max-w-xs mx-auto">
                          <input
                            type="text"
                            placeholder="Enter 4-digit code"
                            maxLength={4}
                            value={otpValue}
                            onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                            required
                            className="w-full p-2.5 rounded-lg border border-slate-200 bg-white text-center text-sm font-bold tracking-widest outline-none focus:border-primary focus:ring-1 focus:ring-primary/20 transition-all"
                          />
                          <Button type="submit" className="w-full font-semibold">
                            Confirm Payment
                          </Button>
                        </form>
                      </div>
                    )}
                  </div>
                )}

                {/* STEP 4: Success confirmation */}
                {bookingStep === 4 && paymentSuccess && (
                  <div className="text-center py-6 space-y-4">
                    <CheckCircle className="h-12 w-12 text-success mx-auto" />
                    <h4 className="text-lg font-bold">Appointment Booked!</h4>
                    <p className="text-xs text-slate-450">
                      Your consultation with <strong>{selectedDoctor.name}</strong> on <strong>{selectedDate}</strong> at <strong>{selectedSlot}</strong> has been confirmed.
                    </p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/50 text-xs text-left space-y-1.5 max-w-xs mx-auto">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Format:</span>
                        <span className="font-semibold">{consultationType === 'VIRTUAL' ? 'Virtual (Video Call)' : 'In-Person (Clinic)'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Patient:</span>
                        <span className="font-semibold">{patientName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total:</span>
                        <span className="font-bold text-primary">₹{billingSummary.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-light-border bg-slate-50/50 flex justify-between items-center">
                {bookingStep === 4 ? (
                  <div className="flex gap-3 w-full">
                    {consultationType === 'VIRTUAL' ? (
                      <Link to="/dashboard" className="w-full">
                        <Button className="w-full font-semibold">Go to Dashboard</Button>
                      </Link>
                    ) : (
                      <Button className="w-full font-semibold" onClick={handleCloseBooking}>Done</Button>
                    )}
                  </div>
                ) : (
                  <>
                    <div className="text-left">
                      {bookingStep > 1 && (
                        <button 
                          onClick={() => setBookingStep((prev) => (prev - 1) as any)}
                          className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 text-xs font-semibold cursor-pointer"
                        >
                          <ArrowLeft className="h-4.5 w-4.5" />
                          <span>Back</span>
                        </button>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={handleCloseBooking}>Cancel</Button>
                      {bookingStep < 3 ? (
                        <Button 
                          size="sm" 
                          onClick={() => setBookingStep((prev) => (prev + 1) as any)}
                          className="flex items-center space-x-1"
                        >
                          <span>Next</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        paymentMethod === 'WALLET' && (
                          <Button 
                            size="sm" 
                            onClick={handlePaymentSubmit}
                            disabled={isProcessingPayment || walletBalance < billingSummary.total}
                          >
                            <span>Pay ₹{billingSummary.total.toFixed(2)}</span>
                          </Button>
                        )
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
