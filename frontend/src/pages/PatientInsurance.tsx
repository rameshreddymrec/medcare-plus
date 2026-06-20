import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { 
  ShieldCheck, ShieldAlert, Award, FileText, PlusCircle, 
  AlertCircle, Loader2, CheckCircle, Calendar, RefreshCw, ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

interface Claim {
  id: string;
  amountClaimed: number;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  createdAt: string;
}

interface InsurancePolicy {
  id: string;
  policyNumber: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  plan: {
    name: string;
    providerName: string;
    description: string;
    coverageLimit: number;
    coPayPercent: number;
  };
  claims: Claim[];
}

export const PatientInsurance: React.FC = () => {
  const { token } = useAuthStore();
  const [activePolicy, setActivePolicy] = useState<InsurancePolicy | null>(null);
  const [loading, setLoading] = useState(true);
  const [offlineMode, setOfflineMode] = useState(false);

  // Claim Form States
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimAmount, setClaimAmount] = useState('');
  const [claimDescription, setClaimDescription] = useState('');
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [claimError, setClaimError] = useState('');
  const [claimSuccess, setClaimSuccess] = useState(false);

  const fetchPolicy = async () => {
    setLoading(true);
    try {
      const response = await axios.get('http://localhost:5000/api/v1/payment/active-insurance', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data?.success && response.data?.data) {
        setActivePolicy(response.data.data);
        setOfflineMode(false);
      } else {
        // No policy in DB, check localStorage for simulated policy
        loadSimulatedPolicy();
      }
    } catch (err: any) {
      console.warn('[MedCare+ Insurance] Failed to fetch active policy from backend. Checking localStorage fallback...');
      loadSimulatedPolicy();
    } finally {
      setLoading(false);
    }
  };

  const loadSimulatedPolicy = () => {
    const saved = localStorage.getItem('medcare-simulated-policy');
    if (saved) {
      try {
        const policyObj = JSON.parse(saved);
        setActivePolicy(policyObj);
        setOfflineMode(true);
      } catch (e) {
        console.error('Failed to parse simulated policy', e);
        setActivePolicy(null);
      }
    } else {
      setActivePolicy(null);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPolicy();
    }
  }, [token]);

  const handleOpenClaimModal = () => {
    setClaimAmount('');
    setClaimDescription('');
    setClaimError('');
    setClaimSuccess(false);
    setShowClaimModal(true);
  };

  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimAmount || isNaN(Number(claimAmount)) || Number(claimAmount) <= 0) {
      setClaimError('Please enter a valid claim amount greater than zero.');
      return;
    }
    if (!claimDescription.trim()) {
      setClaimError('Please enter a description for the claim.');
      return;
    }

    setSubmittingClaim(true);
    setClaimError('');

    if (offlineMode) {
      // Simulate claim submission offline
      setTimeout(() => {
        const newClaim: Claim = {
          id: `clm_${Math.random().toString(36).substring(2, 9)}`,
          amountClaimed: Number(claimAmount),
          description: claimDescription,
          status: 'PENDING',
          createdAt: new Date().toISOString(),
        };

        if (activePolicy) {
          const updatedPolicy = {
            ...activePolicy,
            claims: [newClaim, ...(activePolicy.claims || [])],
          };
          setActivePolicy(updatedPolicy);
          localStorage.setItem('medcare-simulated-policy', JSON.stringify(updatedPolicy));
        }

        setSubmittingClaim(false);
        setClaimSuccess(true);
        setTimeout(() => {
          setShowClaimModal(false);
        }, 1500);
      }, 1000);
    } else {
      // Online claim submission
      try {
        const response = await axios.post('http://localhost:5000/api/v1/payment/claim-insurance', {
          amountClaimed: Number(claimAmount),
          description: claimDescription
        }, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (response.data?.success) {
          setSubmittingClaim(false);
          setClaimSuccess(true);
          // Refetch active policy to update claims list from DB
          await fetchPolicy();
          setTimeout(() => {
            setShowClaimModal(false);
          }, 1500);
        } else {
          setClaimError(response.data?.message || 'Failed to submit claim.');
          setSubmittingClaim(false);
        }
      } catch (err: any) {
        console.error('Error submitting claim to backend:', err);
        setClaimError(err.response?.data?.message || 'Error communicating with server.');
        setSubmittingClaim(false);
      }
    }
  };

  const getStatusBadge = (status: Claim['status']) => {
    switch (status) {
      case 'PENDING':
        return <Badge variant="neutral" className="bg-amber-50 text-amber-700 border-amber-250">Pending Review</Badge>;
      case 'APPROVED':
        return <Badge variant="success" className="bg-emerald-50 text-emerald-700 border-emerald-250">Approved</Badge>;
      case 'REJECTED':
        return <Badge variant="danger" className="bg-rose-50 text-rose-700 border-rose-250">Rejected</Badge>;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <p className="text-slate-450 text-sm">Loading active insurance details...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Page Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-light-border gap-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Health Insurance Manager</h2>
          <p className="text-sm text-slate-400">
            Monitor your cashless limit, check policy coverage details, and submit claims online.
          </p>
        </div>
        <div className="flex gap-2">
          {activePolicy ? (
            <Button size="sm" onClick={handleOpenClaimModal} className="flex items-center gap-1.5">
              <PlusCircle className="h-4.5 w-4.5" />
              <span>Submit A Claim</span>
            </Button>
          ) : (
            <Link to="/insurance">
              <Button size="sm">
                Browse Insurance Plans
              </Button>
            </Link>
          )}
          <Button size="sm" variant="outline" className="h-9 w-9 p-0 text-slate-500 hover:bg-slate-100 shrink-0" onClick={fetchPolicy}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {!activePolicy ? (
        /* Empty State: No Active Policy */
        <Card className="text-center py-16 max-w-3xl mx-auto border-dashed border-2 border-slate-200 bg-white">
          <CardContent className="space-y-5">
            <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto shadow-md">
              <ShieldAlert className="h-8 w-8" />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800">No Active Policy Found</h3>
              <p className="text-slate-500 text-sm max-w-md mx-auto">
                You do not currently hold an active health insurance policy. Compare our custom packages and pay securely to activate premium coverage.
              </p>
            </div>
            <div className="pt-2">
              <Link to="/insurance">
                <Button className="font-bold flex items-center gap-1.5 mx-auto">
                  Get Covered Now <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Dashboard Panels */
        <>
          {/* Status Indicators Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Status Card */}
            <Card className="border-l-4 border-l-blue-600 shadow-sm">
              <CardContent className="p-5 flex items-center space-x-4">
                <div className="h-12 w-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Active Policy</span>
                  <h4 className="text-base font-extrabold text-slate-800 mt-0.5">{activePolicy.plan.name}</h4>
                  <span className="text-xs font-mono text-slate-400 mt-1 block">{activePolicy.policyNumber}</span>
                </div>
              </CardContent>
            </Card>

            {/* Coverage Limit Card */}
            <Card className="border-l-4 border-l-emerald-600 shadow-sm">
              <CardContent className="p-5 flex items-center space-x-4">
                <div className="h-12 w-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Award className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Coverage limit</span>
                  <h4 className="text-base font-extrabold text-slate-800 mt-0.5">₹{activePolicy.plan.coverageLimit.toLocaleString()}</h4>
                  <span className="text-xs text-slate-450 mt-1 block">Co-Pay: <strong>{activePolicy.plan.coPayPercent}%</strong></span>
                </div>
              </CardContent>
            </Card>

            {/* Effective Dates Card */}
            <Card className="border-l-4 border-l-slate-700 shadow-sm">
              <CardContent className="p-5 flex items-center space-x-4">
                <div className="h-12 w-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold block">Effective date</span>
                  <h4 className="text-base font-extrabold text-slate-800 mt-0.5">
                    {new Date(activePolicy.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </h4>
                  <span className="text-xs text-slate-450 mt-1 block">
                    Started: {new Date(activePolicy.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            
            {/* Claims History (2/3 width) */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-base">Claims History Ledger</CardTitle>
                      <CardDescription>View status of claims submitted under this active plan</CardDescription>
                    </div>
                    {offlineMode && (
                      <Badge variant="neutral" className="bg-amber-50 text-amber-700 border-amber-250 animate-pulse text-[10px]">
                        Sandbox Mode
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {!activePolicy.claims || activePolicy.claims.length === 0 ? (
                    <div className="text-center py-14 space-y-3 bg-slate-50/50">
                      <FileText className="h-10 w-10 text-slate-350 mx-auto" />
                      <p className="text-xs font-semibold text-slate-500">No insurance claims submitted yet</p>
                      <p className="text-[10px] text-slate-400 max-w-xs mx-auto">
                        If you incurred any medical expenses, file a reimbursement claim using the submit claim tool.
                      </p>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 text-[10px] uppercase font-bold text-slate-400">
                            <th className="px-6 py-3.5">Claim ID</th>
                            <th className="px-6 py-3.5">Date</th>
                            <th className="px-6 py-3.5">Description</th>
                            <th className="px-6 py-3.5">Amount</th>
                            <th className="px-6 py-3.5 text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs">
                          {activePolicy.claims.map((claim) => (
                            <tr key={claim.id} className="hover:bg-slate-50/60 font-medium text-slate-700">
                              <td className="px-6 py-4 font-mono font-bold text-slate-800">
                                #{claim.id.substring(claim.id.indexOf('_') + 1).toUpperCase()}
                              </td>
                              <td className="px-6 py-4 text-slate-550">
                                {new Date(claim.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                              </td>
                              <td className="px-6 py-4 max-w-xs truncate" title={claim.description}>
                                {claim.description}
                              </td>
                              <td className="px-6 py-4 font-bold text-slate-900">
                                ₹{claim.amountClaimed.toLocaleString()}
                              </td>
                              <td className="px-6 py-4 text-right">
                                {getStatusBadge(claim.status)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Quick Policy summary specs (1/3 width) */}
            <div className="space-y-6">
              <Card className="shadow-sm">
                <CardHeader className="pb-3 border-b border-slate-100">
                  <CardTitle className="text-base">Plan Specifications</CardTitle>
                  <CardDescription>Key terms and coverage items of your health cover</CardDescription>
                </CardHeader>
                <CardContent className="p-5 space-y-4 text-xs font-semibold text-slate-700">
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-400">Provider:</span>
                    <span className="text-slate-800">{activePolicy.plan.providerName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-400">Policy Name:</span>
                    <span className="text-slate-800">{activePolicy.plan.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-400">Cashless Limit:</span>
                    <span className="text-slate-850">₹{activePolicy.plan.coverageLimit.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-400">Co-Pay Ratio:</span>
                    <span className="text-emerald-600">{activePolicy.plan.coPayPercent}% Patient / {100 - activePolicy.plan.coPayPercent}% Insurer</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-50">
                    <span className="text-slate-400">Hospital Network:</span>
                    <span className="text-blue-600">5,000+ Cashless Hospitals</span>
                  </div>
                  
                  <div className="p-3.5 bg-blue-50/50 rounded-xl flex items-start space-x-2 text-[10px] font-medium leading-relaxed text-slate-500 border border-blue-100">
                    <ShieldCheck className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                    <span>
                      Show your e-health insurance card or quote policy No. <strong>{activePolicy.policyNumber}</strong> during admission at any network hospital for 100% cashless check-in.
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
            
          </div>
        </>
      )}

      {/* Claim Submission modal viewer overlay */}
      <AnimatePresence>
        {showClaimModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowClaimModal(false)}
              className="fixed inset-0 z-50 bg-black"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-white rounded-2xl shadow-2xl z-55 border border-light-border overflow-hidden"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                <div>
                  <h3 className="text-base font-black text-slate-800">Submit Reimbursement Claim</h3>
                  <p className="text-xs text-slate-450 mt-0.5">Policy Number: {activePolicy?.policyNumber}</p>
                </div>
                <button 
                  onClick={() => setShowClaimModal(false)} 
                  className="text-slate-450 hover:text-slate-650 p-1 rounded-lg hover:bg-slate-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Form Body */}
              <form onSubmit={handleClaimSubmit} className="p-6 space-y-4">
                {claimSuccess ? (
                  <div className="text-center py-6 space-y-3">
                    <div className="h-12 w-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle className="h-7 w-7" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">Claim Submitted Successfully</h4>
                    <p className="text-xs text-slate-450">
                      Your claim is registered under status PENDING. MedCare+ auditors will verify hospital billing invoices.
                    </p>
                  </div>
                ) : (
                  <>
                    {claimError && (
                      <div className="p-3 bg-red-50 text-red-650 text-xs font-semibold rounded-xl flex items-center gap-2 border border-red-200">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{claimError}</span>
                      </div>
                    )}

                    <Input
                      label="Claim Amount (INR)"
                      placeholder="e.g. 15000"
                      type="number"
                      value={claimAmount}
                      onChange={(e) => setClaimAmount(e.target.value)}
                      required
                    />

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                        Expense Details & Reason
                      </label>
                      <textarea
                        placeholder="e.g. Cashless checkup and prescription medicines for acute fever at City Health Clinic."
                        value={claimDescription}
                        onChange={(e) => setClaimDescription(e.target.value)}
                        required
                        className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:outline-none focus:border-primary min-h-[90px] font-semibold text-slate-700"
                      />
                    </div>

                    <div className="pt-2 flex gap-2">
                      <Button
                        type="submit"
                        className="flex-1 flex justify-center"
                        isLoading={submittingClaim}
                      >
                        Submit for Audit
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setShowClaimModal(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                )}
              </form>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
