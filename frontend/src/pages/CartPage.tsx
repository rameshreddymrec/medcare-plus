import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_BASE } from '../utils/api';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input, Select } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { 
  Trash2, Plus, Minus, FileText, Upload, ShoppingBag, 
  Check, AlertCircle, ShoppingCart, ArrowLeft, CreditCard, Lock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, token } = useAuthStore();
  const { 
    items, coupon, updateQuantity, removeFromCart, applyCoupon, 
    removeCoupon, clearCart, getTotals 
  } = useCartStore();

  // Address entries
  const [addressLabel, setAddressLabel] = useState('Home');
  const [street, setStreet] = useState('100 Health Avenue');
  const [city, setCity] = useState('New York');
  const [zip, setZip] = useState('10001');

  // Prescription uploading simulation
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  // Coupon inputs
  const [couponText, setCouponText] = useState('');
  const [couponError, setCouponError] = useState('');

  // Checkout overlay triggers
  const [checkoutComplete, setCheckoutComplete] = useState(false);
  const [processing, setProcessing] = useState(false);

  // Stripe form entries
  const [showStripeModal, setShowStripeModal] = useState(false);
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [paymentError, setPaymentError] = useState('');
  const [offlineMode, setOfflineMode] = useState(false);

  // Calculation summaries
  const { subtotal, discount, tax, shipping, total } = getTotals();

  // Checks if any cart items require a clinical prescription
  const prescriptionNeeded = items.some((item) => {
    // Standard cardiological/antibiotic items require prescriptions
    return item.category === 'Cardiology' || item.category === 'Antibiotics';
  });

  const handleUploadPrescription = () => {
    setUploading(true);
    setTimeout(() => {
      setUploadedFile('Verified_Prescription_Cardiology.pdf');
      setUploading(false);
    }, 1200);
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponText.trim().toUpperCase();

    if (code === 'HEALTH50') {
      applyCoupon({ code, discountPercent: 50 });
      setCouponText('');
    } else if (code === 'WELCOME10') {
      applyCoupon({ code, discountPercent: 10 });
      setCouponText('');
    } else {
      setCouponError('Invalid promo coupon code');
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (prescriptionNeeded && !uploadedFile) return;

    if (!user) {
      navigate('/login?redirect=/pharmacy/cart');
      return;
    }

    setPaymentError('');
    setShowStripeModal(true);
  };

  // Card formatting helpers
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    const formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    setCardNumber(formatted.substring(0, 19)); // 16 digits + 3 spaces
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    let formatted = val;
    if (val.length > 2) {
      formatted = `${val.substring(0, 2)}/${val.substring(2, 4)}`;
    }
    setCardExpiry(formatted.substring(0, 5));
  };

  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '');
    setCardCvc(val.substring(0, 4));
  };

  const handleStripePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cardNumber.replace(/\s/g, '').length < 16) {
      setPaymentError('Stripe transaction declined: Invalid credit card length');
      return;
    }
    if (!cardName.trim()) {
      setPaymentError('Cardholder name is required');
      return;
    }
    if (!cardExpiry.includes('/') || cardExpiry.length < 5) {
      setPaymentError('Expiry date is invalid');
      return;
    }
    if (cardCvc.length < 3) {
      setPaymentError('CVC is invalid');
      return;
    }

    setProcessing(true);
    setPaymentError('');

    const payload = {
      shippingAddress: `${street}, ${city}, ${zip} (${addressLabel})`,
      couponCode: coupon?.code || null,
      discount: discount,
      tax: tax,
      shippingFee: shipping,
      total: total,
      items: items.map(item => ({
        medicineId: item.id,
        quantity: item.quantity,
        price: item.price
      })),
      cardNumber: cardNumber,
      cardName: cardName
    };

    try {
      const response = await axios.post(`${API_BASE}/payment/checkout`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data?.success) {
        setProcessing(false);
        setShowStripeModal(false);
        setCheckoutComplete(true);
        setOfflineMode(false);
        clearCart();
      } else {
        setPaymentError(response.data?.message || 'Transaction failed');
        setProcessing(false);
      }
    } catch (err: any) {
      console.warn('[MedCare+ Checkout] Failed to connect to server. Simulating fallback offline transaction...');
      if (!err.response) {
        // Backend offline fallback mode
        setTimeout(() => {
          setProcessing(false);
          setShowStripeModal(false);
          setCheckoutComplete(true);
          setOfflineMode(true);
          clearCart();
        }, 1500);
      } else {
        setPaymentError(err.response?.data?.message || 'Stripe card authorization failed.');
        setProcessing(false);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-6">
      
      {/* Checkout Success Screen overlay */}
      <AnimatePresence>
        {checkoutComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-white flex items-center justify-center p-6 text-center"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="max-w-md space-y-6"
            >
              <div className="h-16 w-16 bg-success/15 text-success rounded-full flex items-center justify-center mx-auto shadow-md">
                <Check className="h-8 w-8 stroke-[3]" />
              </div>
              <h2 className="text-3xl font-black">Order Placed Successfully!</h2>
              
              {offlineMode && (
                <div className="p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold rounded-xl flex items-center justify-center gap-2">
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-amber-600 animate-pulse" />
                  <span>Offline Sandbox Mode: Transaction simulated locally.</span>
                </div>
              )}

              <p className="text-slate-500 text-sm">
                Your payment was processed, and prescription validated. The medicines will be dispatched to your shipping address within 24 hours.
              </p>
              <div className="bg-slate-50 border border-light-border rounded-2xl p-4.5 text-xs text-left space-y-2">
                <p><strong>Shipping To:</strong> {user?.name || 'Patient'}</p>
                <p><strong>Address:</strong> {street}, {city}, {zip} ({addressLabel})</p>
                <p><strong>Estimated Delivery:</strong> Tomorrow afternoon</p>
              </div>
              <Button size="lg" className="w-full" onClick={() => navigate('/pharmacy')}>
                Return to Pharmacy
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stripe Checkout Sheet Overlay */}
      <AnimatePresence>
        {showStripeModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 flex flex-col"
            >
              {/* Stripe Header */}
              <div className="bg-slate-50 px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-[#635BFF] text-white rounded-lg flex items-center justify-center font-black text-lg tracking-tighter">
                    S
                  </div>
                  <div className="text-left">
                    <h3 className="text-sm font-bold text-slate-800">Secure Payment</h3>
                    <p className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Lock className="h-3 w-3 text-success" /> Powered by Stripe Gateway
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowStripeModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 overflow-y-auto max-h-[75vh] space-y-4">
                <div className="flex justify-between items-center text-sm font-bold border-b border-dashed border-slate-100 pb-3">
                  <span className="text-slate-500 font-semibold">Total Amount Payable:</span>
                  <span className="text-slate-800 text-lg">₹{total.toFixed(2)}</span>
                </div>

                {/* Interactive Card Graphic */}
                <div className="w-full h-44 rounded-2xl bg-gradient-to-br from-indigo-600 via-purple-600 to-indigo-700 p-5 text-white shadow-lg relative overflow-hidden flex flex-col justify-between">
                  <div className="absolute -top-10 -right-10 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
                  <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-purple-500/20 rounded-full blur-2xl pointer-events-none" />

                  <div className="flex justify-between items-start">
                    <div className="w-11 h-8 rounded-lg bg-yellow-400/20 border border-yellow-400/30 flex items-center justify-center overflow-hidden">
                      <div className="w-7 h-5 border border-yellow-400/50 rounded flex flex-wrap opacity-85" />
                    </div>
                    <span className="font-bold tracking-widest text-xs text-white/95 uppercase italic flex items-center gap-1">
                      <CreditCard className="h-4 w-4" />
                      {cardNumber.startsWith('4') ? 'VISA' : cardNumber.startsWith('5') ? 'MASTERCARD' : 'SECURE'}
                    </span>
                  </div>

                  <div className="text-lg font-mono tracking-widest text-center my-2 text-white">
                    {cardNumber || '•••• •••• •••• ••••'}
                  </div>

                  <div className="flex justify-between items-end">
                    <div className="text-left">
                      <span className="text-[8px] uppercase tracking-wider text-slate-300 block">Card Holder</span>
                      <span className="font-semibold text-xs tracking-wide block truncate max-w-[170px]">
                        {cardName.toUpperCase() || 'YOUR NAME'}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[8px] uppercase tracking-wider text-slate-300 block">Expires</span>
                      <span className="font-semibold text-xs tracking-wide block">
                        {cardExpiry || 'MM/YY'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Form Input elements */}
                <form onSubmit={handleStripePayment} className="space-y-4">
                  {paymentError && (
                    <div className="p-3 bg-danger/10 text-danger text-xs font-semibold rounded-xl flex items-center gap-2 border border-danger/25">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span className="text-left">{paymentError}</span>
                    </div>
                  )}

                  <Input
                    label="Cardholder Name"
                    placeholder="e.g. John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    required
                  />

                  <Input
                    label="Card Number"
                    placeholder="4000 1234 5678 9010"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    required
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      label="Expiry Date"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      required
                    />
                    <Input
                      label="CVC / CVV"
                      placeholder="e.g. 123"
                      type="password"
                      value={cardCvc}
                      onChange={handleCvcChange}
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <Button
                      type="submit"
                      className="w-full flex items-center justify-center gap-2 bg-[#635BFF] hover:bg-[#5249f0] border-none text-white text-sm"
                      isLoading={processing}
                    >
                      <CreditCard className="h-4 w-4" />
                      <span>Pay ₹{total.toFixed(2)} securely</span>
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex items-center space-x-2">
        <Link to="/pharmacy" className="text-xs font-semibold text-slate-400 hover:text-primary flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" /> Back to Pharmacy Catalog
        </Link>
      </div>

      <h2 className="text-3xl font-black text-slate-800">Review Shopping Cart</h2>

      {items.length === 0 ? (
        <Card className="text-center py-20">
          <CardContent className="space-y-4">
            <ShoppingCart className="h-12 w-12 text-slate-300 mx-auto" />
            <h3 className="text-lg font-bold">Your Cart is Empty</h3>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              Browse our medicine e-shop catalog to add items, upload prescriptions, and proceed with checkouts.
            </p>
            <Link to="/pharmacy">
              <Button>Browse Medicines</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Cart items details & prescription upload */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Cart Items list */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">E-Pharmacy Items</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-slate-100">
                  {items.map((item) => (
                    <div key={item.id} className="p-4.5 flex items-center justify-between hover:bg-slate-50/50">
                      <div className="flex items-center space-x-3.5">
                        <div className="h-10 w-10 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                          <ShoppingBag className="h-5.5 w-5.5" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-slate-800">{item.name}</h4>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{item.category} • ₹{item.price.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-6">
                        {/* Qty edit buttons */}
                        <div className="flex items-center border border-slate-200 rounded-lg p-0.5 bg-white">
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="px-2 text-xs font-bold">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="p-1 text-slate-500 hover:bg-slate-100 rounded"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <span className="text-sm font-bold w-20 text-right">
                          ₹{(item.price * item.quantity).toFixed(2)}
                        </span>

                        <button 
                          onClick={() => removeFromCart(item.id)}
                          className="p-2 text-slate-400 hover:text-danger rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-4.5 w-4.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Prescription Upload Module */}
            {prescriptionNeeded && (
              <Card className="border-danger/30">
                <CardHeader>
                  <CardTitle className="text-base text-danger flex items-center gap-1.5">
                    <AlertCircle className="h-5 w-5 animate-pulse" />
                    Prescription Verification Required
                  </CardTitle>
                  <CardDescription>
                    Some items in your cart require a valid prescription. Please upload a doctor prescription PDF or image.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {uploadedFile ? (
                    <div className="flex justify-between items-center p-4.5 bg-success/5 border border-success/30 rounded-xl">
                      <div className="flex items-center space-x-3 text-success">
                        <FileText className="h-5.5 w-5.5" />
                        <div>
                          <p className="text-sm font-semibold">{uploadedFile}</p>
                          <p className="text-[10px] text-success/80">Clinical audit complete</p>
                        </div>
                      </div>
                      <Badge variant="success">READY</Badge>
                    </div>
                  ) : (
                    <div 
                      onClick={handleUploadPrescription}
                      className="border-2 border-dashed border-slate-200 rounded-xl p-8 text-center hover:bg-slate-50/50 transition-all cursor-pointer"
                    >
                      <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                      <span className="text-xs font-semibold text-primary block">
                        {uploading ? 'Processing prescription details...' : 'Click to Upload E-Prescription File'}
                      </span>
                      <span className="text-[10px] text-slate-400">Supports PDF, JPG, PNG (Max 10MB)</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

          </div>

          {/* Right Column: Checkout details, Address, summary */}
          <div className="space-y-6">
            
            {/* Address Selection Form */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Shipping Destination</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Select
                  label="Address Label"
                  options={[
                    { value: 'Home', label: 'Home Address' },
                    { value: 'Office', label: 'Office Suite' },
                  ]}
                  value={addressLabel}
                  onChange={(e) => setAddressLabel(e.target.value)}
                />
                
                <Input
                  label="Street Details"
                  placeholder="e.g. 100 Health Avenue"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  required
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    required
                  />
                  <Input
                    label="ZIP Code"
                    value={zip}
                    onChange={(e) => setZip(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Coupons Card */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Apply Promo Code</CardTitle>
                <CardDescription>Try codes: HEALTH50 (50% off) or WELCOME10 (10% off)</CardDescription>
              </CardHeader>
              <CardContent>
                {coupon ? (
                  <div className="flex justify-between items-center p-3 bg-success/15 border border-success/35 text-success rounded-xl">
                    <span className="text-xs font-bold">Applied: {coupon.code} (-{coupon.discountPercent}%)</span>
                    <button onClick={removeCoupon} className="p-1 hover:bg-success/20 rounded cursor-pointer">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2 items-end">
                    <Input
                      placeholder="e.g. HEALTH50"
                      value={couponText}
                      onChange={(e) => setCouponText(e.target.value)}
                    />
                    <Button type="submit" variant="outline" className="h-[43px]">Apply</Button>
                  </form>
                )}
                {couponError && <p className="text-xs text-danger font-medium mt-2">{couponError}</p>}
              </CardContent>
            </Card>

            {/* Billing Summary & Payment Trigger */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Payment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cart Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-success">
                      <span>Promo Discount</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-400">Tax GST (5%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Shipping Charges</span>
                    <span>{shipping === 0 ? 'FREE' : `₹${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex justify-between font-black text-slate-800 text-base">
                    <span>Total Amount</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                <form onSubmit={handleCheckoutSubmit} className="pt-2">
                  <Button 
                    type="submit" 
                    className="w-full flex items-center justify-center space-x-2"
                    isLoading={processing}
                    disabled={prescriptionNeeded && !uploadedFile}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Pay ₹{total.toFixed(2)} & Order</span>
                  </Button>
                  {prescriptionNeeded && !uploadedFile && (
                    <p className="text-[10px] text-danger font-medium text-center mt-2 flex items-center justify-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      Must upload clinical prescription before pay checkout.
                    </p>
                  )}
                </form>

              </CardContent>
            </Card>

          </div>

        </div>
      )}

    </div>
  );
};
