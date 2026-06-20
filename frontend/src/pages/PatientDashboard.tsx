import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { useAppointmentsStore } from '../store/useAppointmentsStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input, Select } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { 
  Heart, Activity, Droplets, Thermometer, Calendar, FileText, 
  Users, Wallet, Plus, Upload, Trash2, ArrowUpRight, ArrowDownLeft, Check, AlertCircle 
} from 'lucide-react';

interface MedicalRecord {
  id: string;
  name: string;
  category: 'Prescription' | 'Lab Report' | 'Vaccination';
  date: string;
  doctorName?: string;
  fileSize: string;
}

interface FamilyMember {
  id: string;
  name: string;
  relationship: string;
  age: number;
  bloodGroup: string;
}

export const PatientDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const appointments = useAppointmentsStore((state) => state.appointments);
  const cancelAppointment = useAppointmentsStore((state) => state.cancelAppointment);
  const walletBalance = useAppointmentsStore((state) => state.walletBalance);
  const transactions = useAppointmentsStore((state) => state.walletTransactions);
  const topUpWallet = useAppointmentsStore((state) => state.topUpWallet);

  const activeTab = useMemo(() => {
    if (location.pathname.endsWith('/records')) return 'records';
    if (location.pathname.endsWith('/family')) return 'family';
    if (location.pathname.endsWith('/wallet')) return 'wallet';
    return 'overview';
  }, [location.pathname]);

  const handleTabChange = (tab: 'overview' | 'records' | 'family' | 'wallet') => {
    if (tab === 'overview') navigate('/dashboard');
    else navigate(`/dashboard/${tab}`);
  };
  
  // Dashboard Metrics & State
  const [waterIntake, setWaterIntake] = useState(4); // Out of 8 glasses
  
  // Medical Records State
  const [records, setRecords] = useState<MedicalRecord[]>([
    { id: 'rec-1', name: 'Lipid Profile Report.pdf', category: 'Lab Report', date: '2026-06-10', doctorName: 'Dr. Sarah Specialist', fileSize: '1.2 MB' },
    { id: 'rec-2', name: 'Amoxicillin Prescription.pdf', category: 'Prescription', date: '2026-06-15', doctorName: 'Dr. Sarah Specialist', fileSize: '450 KB' },
    { id: 'rec-3', name: 'Covid-19 Vaccination Booster.pdf', category: 'Vaccination', date: '2026-05-02', fileSize: '780 KB' },
  ]);
  const [uploading, setUploading] = useState(false);
  const [recordName, setRecordName] = useState('');
  const [recordCategory, setRecordCategory] = useState<'Prescription' | 'Lab Report' | 'Vaccination'>('Prescription');

  // Family Members State
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { id: 'fam-1', name: 'Emily Doe', relationship: 'Spouse', age: 32, bloodGroup: 'A+' },
    { id: 'fam-2', name: 'Leo Doe', relationship: 'Child', age: 6, bloodGroup: 'O+' },
  ]);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberRel, setNewMemberRel] = useState('Spouse');
  const [newMemberAge, setNewMemberAge] = useState('');
  const [newMemberBlood, setNewMemberBlood] = useState('O+');
  const [showAddFamily, setShowAddFamily] = useState(false);

  const [topUpAmount, setTopUpAmount] = useState('');

  // Handle Record Upload Simulation
  const handleUploadRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!recordName) return;
    setUploading(true);

    setTimeout(() => {
      const newRecord: MedicalRecord = {
        id: `rec-${Math.random().toString(36).substr(2, 9)}`,
        name: recordName.endsWith('.pdf') ? recordName : `${recordName}.pdf`,
        category: recordCategory,
        date: new Date().toISOString().split('T')[0],
        fileSize: '850 KB',
      };
      setRecords([newRecord, ...records]);
      setRecordName('');
      setUploading(false);
    }, 1000);
  };

  // Handle Family Addition
  const handleAddFamilyMember = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberName || !newMemberAge) return;

    const newMember: FamilyMember = {
      id: `fam-${Math.random().toString(36).substr(2, 9)}`,
      name: newMemberName,
      relationship: newMemberRel,
      age: parseInt(newMemberAge, 10),
      bloodGroup: newMemberBlood,
    };

    setFamilyMembers([...familyMembers, newMember]);
    setNewMemberName('');
    setNewMemberAge('');
    setShowAddFamily(false);
  };

  // Handle Wallet Top-Up
  const handleWalletTopUp = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(topUpAmount);
    if (isNaN(amount) || amount <= 0) return;

    topUpWallet(amount, 'Added funds via Stripe (Simulated)');
    setTopUpAmount('');
  };

  const deleteFamilyMember = (id: string) => {
    setFamilyMembers(familyMembers.filter(m => m.id !== id));
  };

  const deleteRecord = (id: string) => {
    setRecords(records.filter(r => r.id !== id));
  };

  const handleIncrementWater = () => {
    if (waterIntake < 8) setWaterIntake(waterIntake + 1);
  };

  return (
    <div className="space-y-6">
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-light-border gap-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800">
            Welcome back, {user?.name || 'Patient'}
          </h2>
          <p className="text-sm text-slate-400">
            Here's a look at your health profile and ecosystem updates for today.
          </p>
        </div>
        <div className="flex gap-2">
          <Badge variant="success" pill className="px-3 py-1 font-semibold flex items-center gap-1.5">
            <Check className="h-3 w-3" /> Profile Active
          </Badge>
          <Badge variant="accent" pill className="px-3 py-1 font-semibold">
            Patient ID: {user?.id?.substring(0, 8).toUpperCase() || 'MED-092'}
          </Badge>
        </div>
      </div>

      {/* Tab Navigation Menu */}
      <div className="flex border-b border-light-border">
        {['overview', 'records', 'family', 'wallet'].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab as any)}
            className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer capitalize ${
              activeTab === tab
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Workspace Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fadeIn">
              
              {/* Left 2 Cols: Health metrics & appointments */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Health Metrics Row */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Card glass className="border-red-500/10">
                    <CardContent className="p-4.5 flex flex-col items-start">
                      <div className="h-10 w-10 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center mb-3">
                        <Heart className="h-5 w-5" />
                      </div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Blood Press.</span>
                      <span className="text-xl font-bold mt-1">120/80</span>
                      <Badge variant="success" className="text-[10px] mt-2">Optimal</Badge>
                    </CardContent>
                  </Card>

                  <Card glass className="border-primary/10">
                    <CardContent className="p-4.5 flex flex-col items-start">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                        <Activity className="h-5 w-5 animate-pulse" />
                      </div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Heart Rate</span>
                      <span className="text-xl font-bold mt-1">72 bpm</span>
                      <Badge variant="success" className="text-[10px] mt-2">Normal</Badge>
                    </CardContent>
                  </Card>

                  <Card glass className="border-accent/10">
                    <CardContent className="p-4.5 flex flex-col items-start">
                      <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-3">
                        <Thermometer className="h-5 w-5" />
                      </div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Body Temp</span>
                      <span className="text-xl font-bold mt-1">98.6 °F</span>
                      <Badge variant="success" className="text-[10px] mt-2">Normal</Badge>
                    </CardContent>
                  </Card>

                  <Card glass className="border-blue-500/10">
                    <CardContent className="p-4.5 flex flex-col items-start">
                      <div className="h-10 w-10 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center mb-3">
                        <Droplets className="h-5 w-5" />
                      </div>
                      <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Blood Sugar</span>
                      <span className="text-xl font-bold mt-1">95 mg/dL</span>
                      <Badge variant="success" className="text-[10px] mt-2">Fasting</Badge>
                    </CardContent>
                  </Card>
                </div>

                {/* Upcoming Appointments */}
                <Card>
                  <CardHeader className="flex flex-row justify-between items-center pb-2">
                    <div>
                      <CardTitle className="text-lg">Upcoming Appointments</CardTitle>
                      <CardDescription>Verify your scheduled practitioner consultations</CardDescription>
                    </div>
                    <Link to="/doctors">
                      <Button variant="outline" size="sm">Book New</Button>
                    </Link>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {appointments.filter(a => a.status !== 'CANCELLED').length === 0 ? (
                      <div className="text-center py-8 bg-slate-50 rounded-xl text-slate-400 text-xs">
                        No upcoming appointments scheduled.
                      </div>
                    ) : (
                      appointments.filter(a => a.status !== 'CANCELLED').map((apt) => (
                        <div key={apt.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 border border-light-border rounded-xl gap-4">
                          <div className="flex items-center space-x-3.5">
                            <div className="h-11 w-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                              <Calendar className="h-5.5 w-5.5" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold">{apt.doctorName}</h4>
                              <p className="text-xs text-slate-400">
                                {apt.doctorSpecialty} • {apt.type === 'VIRTUAL' ? 'Virtual (Video Call)' : 'In-Person (Clinic)'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4">
                            <div className="text-left sm:text-right">
                              <p className="text-xs font-semibold">{apt.date}, {apt.timeSlot}</p>
                              <Badge 
                                variant={
                                  apt.status === 'CONFIRMED' ? 'success' : 
                                  apt.status === 'PENDING' ? 'neutral' : 
                                  apt.status === 'COMPLETED' ? 'accent' : 'danger'
                                } 
                                className="text-[10px] mt-0.5"
                              >
                                {apt.status}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2">
                              {apt.status === 'CONFIRMED' && apt.type === 'VIRTUAL' ? (
                                <Link to={`/video-consultation/${apt.id}`}>
                                  <Button size="sm" variant="accent">Join Room</Button>
                                </Link>
                              ) : (
                                apt.status === 'PENDING' && (
                                  <Button 
                                    size="sm" 
                                    variant="danger" 
                                    onClick={() => cancelAppointment(apt.id)}
                                  >
                                    Cancel
                                  </Button>
                                )
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </CardContent>
                </Card>

              </div>

              {/* Right Col: Hydration goal & wallet tracker */}
              <div className="space-y-6">
                
                {/* E-Wallet Quick Tracker */}
                <Card className="bg-gradient-to-tr from-slate-900 via-slate-800 to-slate-950 text-white border-none shadow-lg">
                  <CardContent className="p-6 space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">MedCare+ Wallet</span>
                      <Wallet className="h-5 w-5 text-accent" />
                    </div>
                    <div>
                      <p className="text-3xl font-extrabold">₹{walletBalance.toFixed(2)}</p>
                      <p className="text-xs text-slate-400 mt-1">Available balance for E-Pharmacy & Lab Tests</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="accent" className="flex-1" onClick={() => handleTabChange('wallet')}>
                        Add Funds
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1 border-slate-700 hover:bg-slate-800 text-white" onClick={() => handleTabChange('wallet')}>
                        Transactions
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {/* Hydration Tracker */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Water Intake Tracker</CardTitle>
                    <CardDescription>Daily target: 8 glasses (2 Liters)</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Droplets className="h-6 w-6 text-blue-500" />
                        <span className="text-lg font-bold">{waterIntake} / 8 Glasses</span>
                      </div>
                      <Button size="sm" variant="outline" leftIcon={<Plus className="h-4 w-4" />} onClick={handleIncrementWater} disabled={waterIntake === 8}>
                        Log Glass
                      </Button>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <motion.div 
                        className="bg-blue-500 h-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${(waterIntake / 8) * 100}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                    {waterIntake === 8 && (
                      <p className="text-xs text-success font-semibold text-center flex items-center justify-center gap-1.5 mt-2">
                        🎉 Daily hydration target achieved!
                      </p>
                    )}
                  </CardContent>
                </Card>

              </div>

            </div>
          )}

          {/* Tab: Medical Records */}
          {activeTab === 'records' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Record Lists (Left) */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Medical Document Repository</CardTitle>
                    <CardDescription>Browse your active prescriptions, lab summaries, and vaccination certificates.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                      {records.map((rec) => (
                        <div key={rec.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-start space-x-3.5">
                            <div className="h-10 w-10 bg-slate-100 text-slate-500 rounded-lg flex items-center justify-center shrink-0">
                              <FileText className="h-5 w-5 text-primary" />
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-800">{rec.name}</h4>
                              <div className="flex items-center space-x-2 mt-0.5">
                                <Badge variant="neutral" className="text-[9px] px-1 py-0.5">{rec.category}</Badge>
                                <span className="text-[10px] text-slate-400">{rec.date}</span>
                                <span className="text-[10px] text-slate-400">• {rec.fileSize}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <a href="#" className="text-xs text-primary font-semibold hover:underline mr-2">Download</a>
                            <button onClick={() => deleteRecord(rec.id)} className="p-2 text-slate-400 hover:text-danger rounded-lg transition-colors cursor-pointer">
                              <Trash2 className="h-4.5 w-4.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                      
                      {records.length === 0 && (
                        <div className="text-center py-10 space-y-2">
                          <AlertCircle className="h-8 w-8 text-slate-400 mx-auto" />
                          <p className="text-sm font-semibold text-slate-500">No medical records uploaded yet</p>
                          <p className="text-xs text-slate-400">Use the upload tool on the right to store your medical files securely.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Upload record panel (Right) */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Upload Document</CardTitle>
                    <CardDescription>Store your medical files securely in our encrypted vaults</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleUploadRecord} className="space-y-4">
                      <Input
                        label="Document Label"
                        placeholder="e.g. CBC Lab Report"
                        value={recordName}
                        onChange={(e) => setRecordName(e.target.value)}
                        required
                      />
                      
                      <Select
                        label="Document Category"
                        options={[
                          { value: 'Prescription', label: 'Prescription PDF' },
                          { value: 'Lab Report', label: 'Laboratory Diagnostics' },
                          { value: 'Vaccination', label: 'Vaccination Proof' },
                        ]}
                        value={recordCategory}
                        onChange={(e) => setRecordCategory(e.target.value as any)}
                      />

                      <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50/50 transition-all cursor-pointer">
                        <Upload className="h-7 w-7 text-slate-400 mx-auto mb-2" />
                        <span className="text-xs font-semibold text-primary block">Click to select PDF or Image</span>
                        <span className="text-[10px] text-slate-400">Max file size: 10MB</span>
                      </div>

                      <Button type="submit" className="w-full flex items-center justify-center space-x-2" isLoading={uploading}>
                        <Upload className="h-4 w-4" />
                        <span>Save to Vault</span>
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

            </div>
          )}

          {/* Tab: Family Members */}
          {activeTab === 'family' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Family Directory (Left) */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                      <CardTitle>Family Profiles</CardTitle>
                      <CardDescription>Manage and book consultations for your dependents</CardDescription>
                    </div>
                    <Button size="sm" leftIcon={<Plus className="h-4 w-4" />} onClick={() => setShowAddFamily(!showAddFamily)}>
                      Add Dependent
                    </Button>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                      {familyMembers.map((member) => (
                        <div key={member.id} className="p-5 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-center space-x-4">
                            <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                              {member.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-800">{member.name}</h4>
                              <div className="flex items-center space-x-3 mt-0.5 text-xs text-slate-500">
                                <span>{member.relationship}</span>
                                <span>•</span>
                                <span>{member.age} years old</span>
                                <span>•</span>
                                <Badge variant="accent" className="text-[9px] px-1 py-0">{member.bloodGroup}</Badge>
                              </div>
                            </div>
                          </div>
                          
                          <button onClick={() => deleteFamilyMember(member.id)} className="p-2 text-slate-400 hover:text-danger rounded-lg transition-colors cursor-pointer">
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      ))}
                      
                      {familyMembers.length === 0 && (
                        <div className="text-center py-10 space-y-2">
                          <Users className="h-8 w-8 text-slate-400 mx-auto" />
                          <p className="text-sm font-semibold text-slate-500">No dependents listed</p>
                          <p className="text-xs text-slate-400">Add family members to book lab tests and appointments in their name.</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Add Family Member form (Right) */}
              <div>
                <AnimatePresence>
                  {showAddFamily && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                    >
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Add Dependent</CardTitle>
                          <CardDescription>Verify relationship and patient age limits</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={handleAddFamilyMember} className="space-y-4">
                            <Input
                              label="Dependent Name"
                              placeholder="e.g. Jane Doe"
                              value={newMemberName}
                              onChange={(e) => setNewMemberName(e.target.value)}
                              required
                            />
                            
                            <div className="grid grid-cols-2 gap-4">
                              <Select
                                label="Relationship"
                                options={[
                                  { value: 'Spouse', label: 'Spouse' },
                                  { value: 'Child', label: 'Child' },
                                  { value: 'Parent', label: 'Parent' },
                                  { value: 'Sibling', label: 'Sibling' },
                                ]}
                                value={newMemberRel}
                                onChange={(e) => setNewMemberRel(e.target.value)}
                              />
                              
                              <Input
                                type="number"
                                label="Age"
                                placeholder="e.g. 28"
                                value={newMemberAge}
                                onChange={(e) => setNewMemberAge(e.target.value)}
                                required
                              />
                            </div>

                            <Select
                              label="Blood Group"
                              options={[
                                { value: 'A+', label: 'A+' },
                                { value: 'A-', label: 'A-' },
                                { value: 'B+', label: 'B+' },
                                { value: 'B-', label: 'B-' },
                                { value: 'AB+', label: 'AB+' },
                                { value: 'AB-', label: 'AB-' },
                                { value: 'O+', label: 'O+' },
                                { value: 'O-', label: 'O-' },
                              ]}
                              value={newMemberBlood}
                              onChange={(e) => setNewMemberBlood(e.target.value)}
                            />

                            <div className="flex gap-2">
                              <Button type="submit" className="flex-grow">Add Dependent</Button>
                              <Button variant="outline" type="button" onClick={() => setShowAddFamily(false)}>Cancel</Button>
                            </div>
                          </form>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

            </div>
          )}

          {/* Tab: Wallet & Payments */}
          {activeTab === 'wallet' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left 2 Cols: Transaction Log */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Transaction Ledger</CardTitle>
                    <CardDescription>Track payments for bookings, orders, and diagnostic checks.</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                      {transactions.map((tx) => (
                        <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                          <div className="flex items-center space-x-3.5">
                            <div className={`h-10 w-10 rounded-lg flex items-center justify-center shrink-0 ${
                              tx.type === 'CREDIT' 
                                ? 'bg-success/10 text-success' 
                                : 'bg-danger/10 text-danger'
                            }`}>
                              {tx.type === 'CREDIT' ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                            </div>
                            <div>
                              <h4 className="text-sm font-bold text-slate-800">{tx.description}</h4>
                              <p className="text-[10px] text-slate-400 mt-0.5">{tx.date} • ID: {tx.id.toUpperCase()}</p>
                            </div>
                          </div>
                          
                          <span className={`text-base font-extrabold ${
                            tx.type === 'CREDIT' ? 'text-success' : 'text-slate-800'
                          }`}>
                            {tx.type === 'CREDIT' ? '+' : '-'} ₹{tx.amount.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top-up balance (Right) */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Top Up Balance</CardTitle>
                    <CardDescription>Secure payment processing via Stripe or Razorpay</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleWalletTopUp} className="space-y-4">
                      <Input
                        type="number"
                        label="Amount (INR)"
                        placeholder="e.g. 1000"
                        value={topUpAmount}
                        onChange={(e) => setTopUpAmount(e.target.value)}
                        required
                      />
                      
                      <div className="flex gap-2">
                        <Button type="submit" className="w-full flex items-center justify-center space-x-2" variant="accent">
                          <Wallet className="h-4 w-4" />
                          <span>Pay with Card</span>
                        </Button>
                      </div>
                      
                      <p className="text-[10px] text-slate-400 text-center">
                        Secure SSL 256-bit encrypted transactions. Fund top-ups are non-refundable.
                      </p>
                    </form>
                  </CardContent>
                </Card>
              </div>

            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
