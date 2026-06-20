import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_BASE } from '../utils/api';
import { useLabTestsStore } from '../store/useLabTestsStore';
import type { LabTest, LabPackage, LabCartItem } from '../store/useLabTestsStore';
import { useAppointmentsStore } from '../store/useAppointmentsStore';
import { useAuthStore } from '../store/useAuthStore';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input, Select } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { 
  Search, FlaskConical, Clock, AlertCircle, ShoppingCart, 
  Trash2, MapPin, User, CheckCircle, 
  ArrowLeft, CreditCard, Wallet, Lock, Info, Check, ShieldCheck
} from 'lucide-react';

export const LabTests: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const defaultTests = useLabTestsStore((state) => state.tests);
  const defaultPackages = useLabTestsStore((state) => state.packages);
  const cart = useLabTestsStore((state) => state.cart);
  
  const addToCart = useLabTestsStore((state) => state.addToCart);
  const removeFromCart = useLabTestsStore((state) => state.removeFromCart);
  const clearCart = useLabTestsStore((state) => state.clearCart);
  const bookLabTests = useLabTestsStore((state) => state.bookLabTests);
  const walletBalance = useAppointmentsStore((state) => state.walletBalance);

  const [labTestsList, setLabTestsList] = useState<LabTest[]>([]);
  const [labPackagesList, setLabPackagesList] = useState<LabPackage[]>([]);

  useEffect(() => {
    const fetchLabTests = async () => {
      try {
        const response = await axios.get(`${API_BASE}/catalog/lab-tests`);
        if (response.data && response.data.success && Array.isArray(response.data.data)) {
          const fetchedTests: LabTest[] = [];
          const fetchedPackages: LabPackage[] = [];

          response.data.data.forEach((item: any) => {
            const isPkg = item.price > 900 || item.name.toLowerCase().includes('check') || item.name.toLowerCase().includes('panel');
            if (isPkg) {
              fetchedPackages.push({
                id: item.id,
                name: item.name,
                price: item.price,
                description: item.description,
                testsCount: item.name.includes('Full Body') ? 6 : 2,
                testsList: item.name.includes('Full Body') 
                  ? ['Complete Blood Count (CBC)', 'Liver Function Test (LFT)', 'Kidney Function Test (KFT)', 'Lipid Profile', 'Glucose Screen', 'Urine Analysis']
                  : ['Vitamin D3 Level Test', 'Vitamin B12 Level Test'],
                fastingRequired: true,
                badge: item.name.includes('Full Body') ? 'BEST VALUE' : 'DEFICIENCY SCREEN',
              });
            } else {
              fetchedTests.push({
                id: item.id,
                name: item.name,
                price: item.price,
                description: item.description,
                fastingRequired: item.name.includes('Lipid') || item.name.includes('Liver') || item.name.includes('Thyroid'),
                reportingTime: '12 Hours',
                parameters: item.name.includes('Lipid') 
                  ? ['Cholesterol', 'Triglycerides', 'HDL', 'LDL']
                  : item.name.includes('Liver')
                  ? ['Bilirubin', 'SGOT', 'SGPT', 'Albumin']
                  : ['Parameters'],
              });
            }
          });

          setLabTestsList(fetchedTests.length > 0 ? fetchedTests : defaultTests);
          setLabPackagesList(fetchedPackages.length > 0 ? fetchedPackages : defaultPackages);
        } else {
          setLabTestsList(defaultTests);
          setLabPackagesList(defaultPackages);
        }
      } catch (err) {
        console.warn('[MedCare+ Lab Tests] Catalog API offline, using local fallback.');
        setLabTestsList(defaultTests);
        setLabPackagesList(defaultPackages);
      }
    };
    fetchLabTests();
  }, [defaultTests, defaultPackages]);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCatalogTab, setActiveCatalogTab] = useState<'ALL' | 'INDIVIDUAL' | 'PACKAGES'>('ALL');

  // Checkout Modal State
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<1 | 2 | 3>(1); // 1: Schedule Details, 2: Payment Selector, 3: simulated Gateway / Confirmation

  // Booking fields
  const [patientName, setPatientName] = useState(user?.name || 'John Patient');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('08:00 AM - 10:00 AM');
  const [street, setStreet] = useState('100 Health Avenue');
  const [city, setCity] = useState('Mumbai');
  const [pincode, setPincode] = useState('400001');
  const [paymentMethod, setPaymentMethod] = useState<'WALLET' | 'CARD'>('WALLET');

  // Card Payment simulated inputs
  const [cardHolder, setCardHolder] = useState(user?.name || '');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCVC, setCardCVC] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [showOtpInput, setShowOtpInput] = useState(false);
  
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [checkoutError, setCheckoutError] = useState('');

  // Cart pricing sum
  const cartTotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price, 0);
  }, [cart]);



  // Filters logic
  const filteredCatalog = useMemo(() => {
    const query = searchQuery.toLowerCase();
    
    const matchedTests = activeCatalogTab !== 'PACKAGES' 
      ? labTestsList.filter(t => t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query))
      : [];

    const matchedPackages = activeCatalogTab !== 'INDIVIDUAL'
      ? labPackagesList.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query))
      : [];

    return { tests: matchedTests, packages: matchedPackages };
  }, [searchQuery, activeCatalogTab, labTestsList, labPackagesList]);

  // Next 5 dates
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 1; i <= 5; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);
      const formatted = nextDate.toISOString().split('T')[0];
      const display = nextDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      dates.push({ formatted, display });
    }
    return dates;
  }, []);

  const timeSlots = ['07:00 AM - 09:00 AM', '09:00 AM - 11:00 AM', '11:00 AM - 01:00 PM', '02:00 PM - 04:00 PM'];

  const handleOpenCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=lab-tests');
      return;
    }
    if (cart.length === 0) return;
    
    setShowCheckoutModal(true);
    setCheckoutStep(1);
    setSelectedDate(availableDates[0].formatted);
    setSelectedSlot(timeSlots[0]);
    setCheckoutError('');
    setPaymentSuccess(false);
    setShowOtpInput(false);
    setOtpValue('');
  };

  const handleAddToCart = (item: LabTest | LabPackage, isPackage: boolean) => {
    const cartItem: LabCartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      isPackage,
    };
    addToCart(cartItem);
  };

  // Submit Order Checkout
  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');

    if (paymentMethod === 'WALLET') {
      setIsProcessingPayment(true);
      setTimeout(() => {
        const result = bookLabTests({
          patientName,
          date: selectedDate,
          timeSlot: selectedSlot,
          address: { street, city, pincode },
          items: cart,
          totalPrice: cartTotal,
          paymentMethod: 'WALLET',
        });

        setIsProcessingPayment(false);
        if (result.success) {
          setPaymentSuccess(true);
          setCheckoutStep(3);
        } else {
          setCheckoutError(result.error || 'Checkout failed. Please top up wallet.');
        }
      }, 1500);
    } else {
      if (!cardHolder || !cardNumber || !cardExpiry || !cardCVC) {
        setCheckoutError('All card fields are mandatory.');
        return;
      }
      setShowOtpInput(true);
    }
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue !== '1234') {
      setCheckoutError('Invalid OTP. Use 1234 for simulation.');
      return;
    }

    setCheckoutError('');
    setIsProcessingPayment(true);

    setTimeout(() => {
      const result = bookLabTests({
        patientName,
        date: selectedDate,
        timeSlot: selectedSlot,
        address: { street, city, pincode },
        items: cart,
        totalPrice: cartTotal,
        paymentMethod: 'CARD',
      });

      setIsProcessingPayment(false);
      if (result.success) {
        setPaymentSuccess(true);
        setShowOtpInput(false);
        setCheckoutStep(3);
      } else {
        setCheckoutError(result.error || 'Payment authorisation failed.');
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        
        {/* Hero Header */}
        <div style={{
          background: '#fff', border: '1px solid #E2E8F0', borderRadius: '1.25rem',
          padding: '2rem 2.5rem', display: 'flex', justifyContent: 'space-between',
          alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem',
          boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.5rem' }}>
              <FlaskConical style={{ height: '0.875rem', width: '0.875rem', color: '#2563EB' }} />
              <span style={{ fontSize: '0.7rem', fontWeight: 700, color: '#2563EB', textTransform: 'uppercase', letterSpacing: '0.12em' }}>MedCare+ Pathology Labs</span>
            </div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: 800, color: '#0F172A', letterSpacing: '-0.025em', margin: '0 0 0.35rem' }}>Diagnostic Panels & Lab Tests</h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>Order certified medical health screens with safe, automated home sample collection and speedy report downloads.</p>
          </div>
          
          <div style={{ position: 'relative', width: '18rem' }}>
            <Search style={{ position: 'absolute', left: '0.875rem', top: '50%', transform: 'translateY(-50%)', height: '0.875rem', width: '0.875rem', color: '#94a3b8' }} />
            <input
              placeholder="Search tests, wellness packages..."
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

        {/* Main layout: Sidebar categories, test catalog, and diagnostics basket */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Left Sidebar: Categories selection */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base font-bold">Diagnostics Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { value: 'ALL', label: 'All Diagnostics' },
                  { value: 'INDIVIDUAL', label: 'Individual Tests' },
                  { value: 'PACKAGES', label: 'Wellness Packages' }
                ].map((tab) => (
                  <button
                    key={tab.value}
                    onClick={() => setActiveCatalogTab(tab.value as any)}
                    className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                      activeCatalogTab === tab.value
                        ? 'bg-primary text-white shadow-md shadow-primary/10'
                        : 'text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </CardContent>
            </Card>

            <Card className="border-blue-100 bg-blue-50/20">
              <CardContent className="p-5 text-xs text-slate-550 leading-relaxed space-y-2">
                <div className="flex items-center space-x-1.5 text-blue-600 font-bold mb-1">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>Lab Testing Policy</span>
                </div>
                All test collections are handled by certified technicians under strict temperature-controlled logistics, with automated reporting within 12–24 hours.
              </CardContent>
            </Card>
          </div>

          {/* Middle Section: Catalog list grid */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Test catalog lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Packages */}
              {filteredCatalog.packages.map((pkg) => (
                <Card key={pkg.id} hoverEffect className="flex flex-col h-full justify-between border-slate-200 overflow-hidden">
                  <CardHeader className="pb-2 pt-4">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <Badge variant="accent" className="text-[8px] font-black tracking-wider uppercase bg-blue-600 text-white border-none shadow-sm">{pkg.badge || 'COMBINE PACK'}</Badge>
                      {pkg.fastingRequired && (
                        <Badge variant="danger" className="text-[8px] font-black bg-amber-500 text-white border-none shadow-sm">10-12H FASTING REQUIRED</Badge>
                      )}
                    </div>
                    <CardTitle className="text-base font-bold text-slate-850 leading-snug">{pkg.name}</CardTitle>
                    <CardDescription className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{pkg.testsCount} parameters checked</CardDescription>
                  </CardHeader>

                  <CardContent className="pt-2 flex-grow flex flex-col justify-between space-y-4">
                    <p className="text-xs text-slate-450 leading-relaxed">{pkg.description}</p>
                    
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-1.5">
                      <span className="text-[9px] uppercase font-black text-slate-400 block tracking-wider">Includes Profile Tests:</span>
                      <div className="grid grid-cols-1 gap-1 text-[10px] text-slate-600">
                        {pkg.testsList.map((test, index) => (
                          <div key={index} className="flex items-center gap-1.5">
                            <Check className="h-3 w-3 text-blue-500 shrink-0" />
                            <span className="truncate">{test}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">MRP Price</span>
                        <span className="text-lg font-extrabold text-slate-900">₹{pkg.price}</span>
                      </div>
                      <Button 
                        variant="primary" 
                        size="sm"
                        onClick={() => handleAddToCart(pkg, true)}
                        disabled={cart.some(c => c.id === pkg.id)}
                        className="font-bold rounded-lg cursor-pointer"
                      >
                        {cart.some(c => c.id === pkg.id) ? 'Added' : 'Book Package'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Individual tests */}
              {filteredCatalog.tests.map((test) => (
                <Card key={test.id} hoverEffect className="flex flex-col h-full justify-between border-slate-200 overflow-hidden">
                  <CardHeader className="pb-1 pt-4">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      <Badge variant="neutral" className="text-[8px] font-black bg-slate-100 text-slate-700 border-none shadow-sm">INDIVIDUAL SCREEN</Badge>
                      {test.fastingRequired && (
                        <Badge variant="danger" className="text-[8px] font-black bg-amber-500 text-white border-none shadow-sm">FASTING REQ.</Badge>
                      )}
                    </div>
                    <CardTitle className="text-sm font-bold text-slate-850 truncate leading-snug">{test.name}</CardTitle>
                  </CardHeader>

                  <CardContent className="pt-2 flex-grow flex flex-col justify-between space-y-4">
                    <p className="text-xs text-slate-455 leading-relaxed line-clamp-3">{test.description}</p>

                    <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-50 p-2 rounded-lg border border-slate-100">
                      <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span>Report within <strong className="text-slate-600">{test.reportingTime}</strong></span>
                    </div>

                    <div className="flex justify-between items-center pt-2 border-t border-slate-100 mt-2">
                      <div className="flex flex-col">
                        <span className="text-[9px] text-slate-400 font-bold uppercase">MRP Price</span>
                        <span className="text-base font-extrabold text-slate-900">₹{test.price}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAddToCart(test, false)}
                        disabled={cart.some(c => c.id === test.id)}
                        className="font-bold rounded-lg cursor-pointer"
                      >
                        {cart.some(c => c.id === test.id) ? 'Added' : 'Book Test'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

            </div>
          </div>

          {/* Right Side: Diagnostics Shopping Cart Panel */}
          <div className="space-y-6">
            <Card className="sticky top-6 border-slate-200 shadow-sm">
              <CardHeader className="flex flex-row justify-between items-center border-b border-slate-100 pb-3 bg-slate-50/50">
                <div>
                  <CardTitle className="text-base font-extrabold flex items-center gap-2 text-slate-850">
                    <ShoppingCart className="h-4.5 w-4.5 text-blue-600" />
                    <span>Diagnostics Basket</span>
                  </CardTitle>
                  <CardDescription className="text-[11px] text-slate-400 font-medium">Manage selected lab screenings</CardDescription>
                </div>
                <Badge variant="primary" pill className="text-[10px] px-2.5 py-0.5 bg-blue-600 text-white border-none shadow-sm">{cart.length} items</Badge>
              </CardHeader>

              <CardContent className="pt-4 space-y-4">
                
                {/* Basket list */}
                <div className="divide-y divide-slate-100 max-h-[30vh] overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="py-3 flex items-center justify-between hover:bg-slate-50/70 transition-colors">
                      <div className="space-y-0.5 truncate pr-2">
                        <h4 className="text-xs font-bold text-slate-800 truncate">{item.name}</h4>
                        <span className="text-[9px] font-semibold text-slate-400">{item.isPackage ? 'Wellness Combo' : 'Pathology Test'}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs font-black text-slate-800">₹{item.price}</span>
                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="p-1 rounded hover:bg-slate-100 text-slate-400 hover:text-red-500 cursor-pointer transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {cart.length === 0 && (
                    <div className="text-center py-10 space-y-3">
                      <FlaskConical className="h-8 w-8 text-slate-300 mx-auto animate-pulse" />
                      <div>
                        <p className="text-xs font-bold text-slate-700">Basket is empty</p>
                        <p className="text-[10px] text-slate-400 max-w-xs mx-auto mt-0.5">Select medical tests or combo wellness screenings to proceed.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Summary pricing */}
                {cart.length > 0 && (
                  <div className="space-y-4 border-t border-slate-100 pt-4">
                    
                    {/* Trust row benefits */}
                    <div className="space-y-2 py-1">
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
                        <ShieldCheck className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        <span>ISO-Certified Lab Diagnostics</span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold">
                        <CheckCircle className="h-3.5 w-3.5 text-green-600 shrink-0" />
                        <span>Free Home Sample Collection</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm font-extrabold border-t border-slate-100 pt-3">
                      <span>Total Booking Price</span>
                      <span className="text-blue-650 text-base font-black">₹{cartTotal}</span>
                    </div>

                    <button 
                      className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm cursor-pointer shadow-md shadow-blue-500/10 flex items-center justify-center gap-1.5"
                      onClick={handleOpenCheckout}
                    >
                      <span>Proceed to Booking</span>
                    </button>
                  </div>
                )}

              </CardContent>
            </Card>
          </div>

        </div>

        {/* Checkout Home Collection Scheduling Modal */}
        <AnimatePresence>
          {showCheckoutModal && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowCheckoutModal(false)}
                className="fixed inset-0 z-50 bg-black"
              />
              
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 15 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 15 }}
                className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg bg-white rounded-2xl shadow-2xl z-55 border border-slate-200 overflow-hidden"
              >
                {/* Header */}
                <div className="p-6 border-b border-slate-100 bg-slate-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] uppercase font-black text-blue-600 tracking-widest block mb-0.5">
                        Step {checkoutStep} of 3 • Home Sample Collection
                      </span>
                      <h3 className="text-lg font-bold text-slate-800">
                        Diagnostics Collection Request
                      </h3>
                      <p className="text-xs text-slate-400">Schedule certified technician home blood checkup</p>
                    </div>
                    <button 
                      onClick={() => setShowCheckoutModal(false)} 
                      className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 cursor-pointer"
                    >
                      &times;
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-1">
                  <motion.div 
                    className="bg-blue-600 h-full"
                    animate={{ width: `${(checkoutStep / 3) * 100}%` }}
                  />
                </div>

                {/* Body */}
                <div className="p-6 max-h-[55vh] overflow-y-auto space-y-6">
                  
                  {checkoutError && (
                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl flex items-center space-x-2 text-xs">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>{checkoutError}</span>
                    </div>
                  )}

                  {/* STEP 1: Date & Collection Details */}
                  {checkoutStep === 1 && (
                    <div className="space-y-4">
                      <Input
                        label="Patient Name"
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="e.g. John Doe"
                        leftIcon={<User className="h-4 w-4" />}
                        required
                      />

                      <div className="space-y-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Collection Date</span>
                        <div className="grid grid-cols-5 gap-2">
                          {availableDates.map((date) => (
                            <button
                              key={date.formatted}
                              onClick={() => setSelectedDate(date.formatted)}
                              className={`p-2 rounded-xl border text-center transition-all cursor-pointer ${
                                selectedDate === date.formatted
                                  ? 'bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-500/10'
                                  : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                              }`}
                            >
                              <span className="text-[10px] font-bold block leading-none">{date.display.split(',')[0]}</span>
                              <span className="text-xs font-black block mt-1.5 leading-none">{date.display.split(' ')[2] || date.display.split(' ')[1]}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <Select
                        label="Preferred Hourly Window"
                        options={timeSlots.map(s => ({ value: s, label: s }))}
                        value={selectedSlot}
                        onChange={(e) => setSelectedSlot(e.target.value)}
                      />

                      <div className="space-y-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Collection Address</span>
                        <Input
                          label="Street Address"
                          value={street}
                          onChange={(e) => setStreet(e.target.value)}
                          placeholder="House No, Apartment, Street"
                          leftIcon={<MapPin className="h-4 w-4" />}
                          required
                        />
                        <div className="grid grid-cols-2 gap-4">
                          <Input
                            label="City"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="City"
                            required
                          />
                          <Input
                            label="Pincode"
                            maxLength={6}
                            value={pincode}
                            onChange={(e) => setPincode(e.target.value)}
                            placeholder="Pincode"
                            required
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* STEP 2: Payment choosing */}
                  {checkoutStep === 2 && (
                    <div className="space-y-6">
                      {/* Invoice */}
                      <div className="border border-slate-200 p-4.5 rounded-xl bg-slate-50 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span>Pathology Test Panel Summary:</span>
                          <span className="font-bold text-slate-800">{cart.length} items</span>
                        </div>
                        <div className="flex justify-between border-t border-slate-200 pt-2 text-sm font-extrabold">
                          <span>Total Checkout Fee</span>
                          <span className="text-blue-600">₹{cartTotal}</span>
                        </div>
                      </div>

                      {/* Method toggle */}
                      <div className="space-y-3">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Select payment method</span>
                        <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => setPaymentMethod('WALLET')}
                            className={`p-4 rounded-xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
                              paymentMethod === 'WALLET'
                                ? 'border-blue-600 bg-blue-50/50 text-blue-600'
                                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            <Wallet className="h-5 w-5 shrink-0" />
                            <div className="truncate">
                              <span className="text-xs font-bold block text-slate-800">Pay via E-Wallet</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Bal: ₹{walletBalance.toFixed(2)}</span>
                            </div>
                          </button>
                          <button
                            onClick={() => setPaymentMethod('CARD')}
                            className={`p-4 rounded-xl border text-left flex items-center space-x-3 transition-all cursor-pointer ${
                              paymentMethod === 'CARD'
                                ? 'border-blue-600 bg-blue-50/50 text-blue-600'
                                : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                            }`}
                          >
                            <CreditCard className="h-5 w-5 shrink-0" />
                            <div>
                              <span className="text-xs font-bold block text-slate-800">Stripe / Razorpay</span>
                              <span className="text-[10px] text-slate-400 block mt-0.5">Credit card payment mock.</span>
                            </div>
                          </button>
                        </div>
                      </div>

                      {/* Wallet feedback */}
                      {paymentMethod === 'WALLET' && (
                        <div className="space-y-2">
                          {walletBalance < cartTotal ? (
                            <div className="p-3 bg-red-50 border border-red-200 text-red-650 rounded-xl flex items-center space-x-2 text-xs">
                              <Info className="h-4 w-4 shrink-0" />
                              <span>Wallet balance insufficient. Please top up in your Patient Dashboard or pay with card.</span>
                            </div>
                          ) : (
                            <div className="p-3 bg-slate-50 rounded-xl flex items-center space-x-2 text-xs text-slate-500 leading-relaxed">
                              <Info className="h-4 w-4 shrink-0 text-blue-600" />
                              <span>Fees will be automatically deducted from your MedCare+ wallet ledger.</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Credit card fields */}
                      {paymentMethod === 'CARD' && !showOtpInput && (
                        <form onSubmit={handleCheckoutSubmit} className="space-y-3">
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Cardholder Name</label>
                            <input
                              type="text"
                              placeholder="e.g. John Doe"
                              value={cardHolder}
                              onChange={(e) => setCardHolder(e.target.value)}
                              required
                              className="w-full p-2.5 rounded-lg border border-slate-200 bg-transparent text-xs text-slate-700 outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Card Number</label>
                            <input
                              type="text"
                              placeholder="4111 2222 3333 4444"
                              maxLength={16}
                              value={cardNumber}
                              onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, ''))}
                              required
                              className="w-full p-2.5 rounded-lg border border-slate-200 bg-transparent text-xs text-slate-700 outline-none focus:border-blue-500"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Expiry (MM/YY)</label>
                              <input
                                type="text"
                                placeholder="12/28"
                                maxLength={5}
                                value={cardExpiry}
                                onChange={(e) => setCardExpiry(e.target.value)}
                                required
                                className="w-full p-2.5 rounded-lg border border-slate-200 bg-transparent text-xs text-slate-700 outline-none focus:border-blue-500"
                              />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">CVC</label>
                              <input
                                type="password"
                                placeholder="***"
                                maxLength={3}
                                value={cardCVC}
                                onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, ''))}
                                required
                                className="w-full p-2.5 rounded-lg border border-slate-200 bg-transparent text-xs text-slate-700 outline-none focus:border-blue-500"
                              />
                            </div>
                          </div>
                        </form>
                      )}

                      {/* Card payment OTP */}
                      {paymentMethod === 'CARD' && showOtpInput && (
                        <div className="space-y-4 border border-slate-200 p-5 rounded-2xl bg-slate-50">
                          <div className="text-center space-y-1.5">
                            <Lock className="h-6 w-6 text-blue-600 mx-auto" />
                            <h4 className="text-sm font-bold">Secure Card OTP Verification</h4>
                            <p className="text-xs text-slate-400">Enter simulated secure authorization code. Standard test value: <strong className="text-slate-700">1234</strong></p>
                          </div>
                          
                          <form onSubmit={handleVerifyOtp} className="space-y-4 max-w-xs mx-auto">
                            <input
                              type="text"
                              placeholder="Enter 4-digit code"
                              maxLength={4}
                              value={otpValue}
                              onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                              required
                              className="w-full p-3 rounded-lg border border-slate-200 bg-white text-center text-base tracking-widest font-black outline-none focus:border-blue-500"
                            />
                            <Button type="submit" className="w-full font-bold cursor-pointer">
                              Verify & Pay ₹{cartTotal}
                            </Button>
                          </form>
                        </div>
                      )}
                    </div>
                  )}

                  {/* STEP 3: Booking Success */}
                  {checkoutStep === 3 && paymentSuccess && (
                    <div className="text-center py-6 space-y-4 animate-scaleUp">
                      <div className="h-16 w-16 bg-green-50 rounded-full flex items-center justify-center mx-auto text-green-600 border border-green-200">
                        <CheckCircle className="h-10 w-10 text-green-600" />
                      </div>
                      
                      <div className="space-y-2">
                        <h4 className="text-xl font-black text-slate-800">Collection Scheduled!</h4>
                        <p className="text-xs text-slate-450 max-w-xs mx-auto">
                          Your laboratory appointment was successfully logged. A certified pathology collection specialist will visit your address on <strong>{selectedDate}</strong> at <strong>{selectedSlot}</strong>.
                        </p>
                      </div>

                      <div className="bg-slate-50 p-4 rounded-xl max-w-sm mx-auto border border-slate-200 text-xs text-slate-500 space-y-1.5 text-left">
                        <div className="flex justify-between">
                          <span>Scheduled Date:</span>
                          <span className="font-bold text-slate-700">{selectedDate}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Patient name:</span>
                          <span className="font-bold text-slate-700">{patientName}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Address street:</span>
                          <span className="font-bold text-slate-700">{street}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Transaction Total:</span>
                          <span className="font-bold text-slate-700">₹{cartTotal}</span>
                        </div>
                      </div>
                    </div>
                  )}

                </div>

                {/* Footer */}
                <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                  {checkoutStep === 3 ? (
                    <Link to="/dashboard/lab-reports" className="w-full">
                      <Button className="w-full cursor-pointer" variant="accent" onClick={clearCart}>
                        Go to Lab Reports
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <div>
                        {checkoutStep > 1 && (
                          <button 
                            onClick={() => setCheckoutStep((prev) => (prev - 1) as any)}
                            className="flex items-center space-x-1 text-slate-500 hover:text-slate-800 text-xs font-bold cursor-pointer"
                          >
                            <ArrowLeft className="h-4 w-4" />
                            <span>Back</span>
                          </button>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" onClick={() => setShowCheckoutModal(false)} className="cursor-pointer">
                          Cancel
                        </Button>
                        {checkoutStep < 2 ? (
                          <Button 
                            size="sm" 
                            onClick={() => setCheckoutStep(2)}
                            className="flex items-center space-x-1 cursor-pointer"
                          >
                            <span>Next</span>
                          </Button>
                        ) : (
                          paymentMethod === 'WALLET' && (
                            <Button 
                              size="sm" 
                              onClick={handleCheckoutSubmit}
                              disabled={isProcessingPayment || walletBalance < cartTotal}
                              className="font-bold cursor-pointer"
                            >
                              <span>Pay ₹{cartTotal}</span>
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
    </div>
  );
};
