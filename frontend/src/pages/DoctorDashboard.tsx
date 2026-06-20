import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAppointmentsStore } from '../store/useAppointmentsStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input, Select } from '../components/common/Input';
import { Badge } from '../components/common/Badge';
import { 
  Users, Calendar, Star, DollarSign, Clock, Plus, Trash2, 
  FileText, Check, Sparkles, Send
} from 'lucide-react';

interface PatientRecord {
  id: string;
  name: string;
  age: number;
  bloodGroup: string;
  reason: string;
  lastVisit: string;
  uploadedRecords: { name: string; date: string; type: string }[];
}

interface GeneratedPrescription {
  id: string;
  patientName: string;
  diagnosis: string;
  medicines: { name: string; dosage: string; frequency: string; duration: string }[];
  date: string;
}

export const DoctorDashboard: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = useMemo(() => {
    if (location.pathname.endsWith('/slots')) return 'slots';
    if (location.pathname.endsWith('/prescription')) return 'prescription';
    if (location.pathname.endsWith('/patients')) return 'patients';
    return 'overview';
  }, [location.pathname]);

  const handleTabChange = (tab: 'overview' | 'slots' | 'prescription' | 'patients') => {
    if (tab === 'overview') navigate('/dashboard/doctor');
    else navigate(`/dashboard/doctor/${tab}`);
  };

  const doctor = useAppointmentsStore((state) => state.doctors.find(d => d.id === 'doc-1'))!;
  const toggleVacationMode = useAppointmentsStore((state) => state.toggleVacationMode);
  const addDoctorSlot = useAppointmentsStore((state) => state.addDoctorSlot);
  const deleteDoctorSlot = useAppointmentsStore((state) => state.deleteDoctorSlot);

  // Map slots to layout structure
  const slots = doctor.slots.map((s) => {
    const firstSpaceIdx = s.indexOf(' ');
    const day = firstSpaceIdx !== -1 ? s.substring(0, firstSpaceIdx) : s;
    const time = firstSpaceIdx !== -1 ? s.substring(firstSpaceIdx + 1) : '';
    return { id: s, day, time };
  });

  const [newSlotDay, setNewSlotDay] = useState('Monday');
  const [newSlotTime, setNewSlotTime] = useState('09:00 AM - 12:00 PM');

  // Patients & Records State
  const [patients] = useState<PatientRecord[]>([
    {
      id: 'pat-1',
      name: 'John Patient',
      age: 28,
      bloodGroup: 'O+',
      reason: 'Regular cardiac follow-up and lipid check',
      lastVisit: '2026-06-10',
      uploadedRecords: [
        { name: 'Lipid Profile Report.pdf', date: '2026-06-10', type: 'Lab Report' },
        { name: 'ECG Graph.png', date: '2026-06-10', type: 'Lab Report' },
      ],
    },
    {
      id: 'pat-2',
      name: 'Emily Doe',
      age: 32,
      bloodGroup: 'A+',
      reason: 'Chronic migraine and throat soreness',
      lastVisit: '2026-06-15',
      uploadedRecords: [
        { name: 'Amoxicillin Prescription.pdf', date: '2026-06-15', type: 'Prescription' },
      ],
    },
  ]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  // Prescription Generator State
  const [prescriptionPatient, setPrescriptionPatient] = useState('John Patient');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescribedMeds, setPrescribedMeds] = useState<{ name: string; dosage: string; frequency: string; duration: string }[]>([]);
  
  // Current editing medicine
  const [medName, setMedName] = useState('');
  const [medDosage, setMedDosage] = useState('1 tablet');
  const [medFreq, setMedFreq] = useState('Twice daily');
  const [medDur, setMedDur] = useState('5 days');

  const [generatedPrescriptions, setGeneratedPrescriptions] = useState<GeneratedPrescription[]>([
    {
      id: 'pr-102',
      patientName: 'John Patient',
      diagnosis: 'Mild Hypertension',
      medicines: [{ name: 'Atenolol 50mg', dosage: '1 tablet', frequency: 'Once daily', duration: '30 days' }],
      date: '2026-06-19',
    },
  ]);

  const handleAddSlot = (e: React.FormEvent) => {
    e.preventDefault();
    addDoctorSlot('doc-1', `${newSlotDay} ${newSlotTime}`);
  };

  const handleDeleteSlot = (id: string) => {
    deleteDoctorSlot('doc-1', id);
  };

  const handleAddMedicine = () => {
    if (!medName) return;
    setPrescribedMeds([
      ...prescribedMeds,
      { name: medName, dosage: medDosage, frequency: medFreq, duration: medDur },
    ]);
    setMedName('');
  };

  const handleRemoveMedicine = (idx: number) => {
    setPrescribedMeds(prescribedMeds.filter((_, i) => i !== idx));
  };

  const handleSavePrescription = (e: React.FormEvent) => {
    e.preventDefault();
    if (prescribedMeds.length === 0 || !diagnosis) return;

    const newPrescription: GeneratedPrescription = {
      id: `pr-${Math.floor(100 + Math.random() * 900)}`,
      patientName: prescriptionPatient,
      diagnosis,
      medicines: prescribedMeds,
      date: new Date().toISOString().split('T')[0],
    };

    setGeneratedPrescriptions([newPrescription, ...generatedPrescriptions]);
    setDiagnosis('');
    setPrescribedMeds([]);
    handleTabChange('overview'); // Redirect to overview to see the prescription log
  };

  return (
    <div className="space-y-6">
      {/* Doctor Dashboard Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-light-border gap-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            Dr. Sarah Specialist <Sparkles className="h-5 w-5 text-accent" />
          </h2>
          <p className="text-sm text-slate-400">
            Internal Medicine • License Number: LIC-772910 • hospital: MedCare+ General
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-slate-400">Vacation Mode:</span>
          <button
            onClick={() => toggleVacationMode('doc-1', !doctor.vacationMode)}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors cursor-pointer ${
              doctor.vacationMode ? 'bg-danger' : 'bg-slate-300'
            }`}
          >
            <motion.div
              layout
              className="bg-white w-4 h-4 rounded-full shadow-md"
              animate={{ x: doctor.vacationMode ? 24 : 0 }}
            />
          </button>
          {doctor.vacationMode ? (
            <Badge variant="danger" pill>Offline</Badge>
          ) : (
            <Badge variant="success" pill>Receiving Bookings</Badge>
          )}
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="flex border-b border-light-border">
        {['overview', 'slots', 'prescription', 'patients'].map((tab) => (
          <button
            key={tab}
            onClick={() => handleTabChange(tab as any)}
            className={`py-3 px-6 text-sm font-semibold border-b-2 transition-all cursor-pointer capitalize ${
              activeTab === tab
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Tab Workspaces */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Metrics Row */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <Card glass>
                  <CardContent className="p-4.5 flex flex-col items-start">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
                      <Users className="h-5 w-5" />
                    </div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Patients</span>
                    <span className="text-2xl font-black mt-1">124</span>
                  </CardContent>
                </Card>

                <Card glass>
                  <CardContent className="p-4.5 flex flex-col items-start">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center mb-3">
                      <Calendar className="h-5 w-5" />
                    </div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Appointments</span>
                    <span className="text-2xl font-black mt-1">8 Today</span>
                  </CardContent>
                </Card>

                <Card glass>
                  <CardContent className="p-4.5 flex flex-col items-start">
                    <div className="h-10 w-10 rounded-lg bg-warning/10 text-warning flex items-center justify-center mb-3">
                      <Star className="h-5 w-5 fill-warning text-warning" />
                    </div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Clinic Rating</span>
                    <span className="text-2xl font-black mt-1">4.9 / 5.0</span>
                  </CardContent>
                </Card>

                <Card glass>
                  <CardContent className="p-4.5 flex flex-col items-start">
                    <div className="h-10 w-10 rounded-lg bg-success/10 text-success flex items-center justify-center mb-3">
                      <DollarSign className="h-5 w-5" />
                    </div>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Earnings</span>
                    <span className="text-2xl font-black mt-1">₹42,500</span>
                  </CardContent>
                </Card>
              </div>

              {/* Consultation logs / Prescriptions emitted */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Left 2 Cols: Prescription logs */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Prescription History</CardTitle>
                      <CardDescription>Track medical prescriptions written by you</CardDescription>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="divide-y divide-slate-100">
                        {generatedPrescriptions.map((pr) => (
                          <div key={pr.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div className="flex items-start space-x-3">
                              <div className="h-9 w-9 bg-primary/10 text-primary rounded-lg flex items-center justify-center shrink-0">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-800">{pr.patientName}</h4>
                                <div className="flex items-center space-x-2 mt-0.5 text-xs text-slate-400">
                                  <span>Diagnosis: {pr.diagnosis}</span>
                                  <span>•</span>
                                  <span>{pr.date}</span>
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <Badge variant="primary" className="text-[9px]">ID: {pr.id.toUpperCase()}</Badge>
                              <a href="#" className="text-xs text-primary block mt-1 hover:underline font-semibold">Print</a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Right Col: Consultation stats */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Consultation Status</CardTitle>
                    <CardDescription>Active appointments stats</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                      <span className="text-xs font-semibold text-slate-400">Completed Video Calls</span>
                      <span className="text-sm font-bold text-success">5 / 8 Completed</span>
                    </div>
                    <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl">
                      <span className="text-xs font-semibold text-slate-400">Pending Reviews</span>
                      <span className="text-sm font-bold text-warning">3 Reviews</span>
                    </div>
                  </CardContent>
                </Card>

              </div>

            </div>
          )}

          {/* Tab: Availability Slots */}
          {activeTab === 'slots' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Active Slots list (Left) */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Time Slots</CardTitle>
                    <CardDescription>Configure your weekly checkup availability timings</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                      {slots.map((slot) => (
                        <div key={slot.id} className="p-4 flex items-center justify-between hover:bg-slate-50">
                          <div className="flex items-center space-x-3.5">
                            <Clock className="h-5 w-5 text-accent" />
                            <div>
                              <h4 className="text-sm font-bold">{slot.day}</h4>
                              <p className="text-xs text-slate-400">{slot.time}</p>
                            </div>
                          </div>
                          <button onClick={() => handleDeleteSlot(slot.id)} className="p-2 text-slate-400 hover:text-danger rounded-lg transition-colors cursor-pointer">
                            <Trash2 className="h-4.5 w-4.5" />
                          </button>
                        </div>
                      ))}
                      
                      {slots.length === 0 && (
                        <div className="text-center py-10 space-y-2">
                          <Clock className="h-8 w-8 text-slate-400 mx-auto" />
                          <p className="text-sm font-semibold text-slate-500">No time slots configured</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Add Availability Slot (Right) */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Add Availability</CardTitle>
                    <CardDescription>Register a new clinical schedule slot</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleAddSlot} className="space-y-4">
                      <Select
                        label="Weekday"
                        options={[
                          { value: 'Monday', label: 'Monday' },
                          { value: 'Tuesday', label: 'Tuesday' },
                          { value: 'Wednesday', label: 'Wednesday' },
                          { value: 'Thursday', label: 'Thursday' },
                          { value: 'Friday', label: 'Friday' },
                          { value: 'Saturday', label: 'Saturday' },
                        ]}
                        value={newSlotDay}
                        onChange={(e) => setNewSlotDay(e.target.value)}
                      />

                      <Select
                        label="Available Hours"
                        options={[
                          { value: '09:00 AM - 12:00 PM', label: 'Morning (09:00 AM - 12:00 PM)' },
                          { value: '12:00 PM - 03:00 PM', label: 'Noon (12:00 PM - 03:00 PM)' },
                          { value: '03:00 PM - 06:00 PM', label: 'Evening (03:00 PM - 06:00 PM)' },
                          { value: '06:00 PM - 09:00 PM', label: 'Night (06:00 PM - 09:00 PM)' },
                        ]}
                        value={newSlotTime}
                        onChange={(e) => setNewSlotTime(e.target.value)}
                      />

                      <Button type="submit" className="w-full flex items-center justify-center space-x-2">
                        <Plus className="h-4 w-4" />
                        <span>Add Slot</span>
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </div>

            </div>
          )}

          {/* Tab: Prescription Generator */}
          {activeTab === 'prescription' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form entries (Left) */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Write Medical Prescription</CardTitle>
                    <CardDescription>Issue prescription charts directly to patients digital vault</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSavePrescription} className="space-y-6">
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Select
                          label="Select Patient"
                          options={[
                            { value: 'John Patient', label: 'John Patient' },
                            { value: 'Emily Doe', label: 'Emily Doe' },
                          ]}
                          value={prescriptionPatient}
                          onChange={(e) => setPrescriptionPatient(e.target.value)}
                        />
                        
                        <Input
                          label="Diagnosis Findings"
                          placeholder="e.g. Chronic seasonal allergic rhinitis"
                          value={diagnosis}
                          onChange={(e) => setDiagnosis(e.target.value)}
                          required
                        />
                      </div>

                      {/* Add Medicines panel */}
                      <div className="border border-slate-100 p-4 rounded-xl space-y-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Configure Medicines</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Input
                            label="Medicine Name"
                            placeholder="e.g. Cetirizine 10mg"
                            value={medName}
                            onChange={(e) => setMedName(e.target.value)}
                          />
                          
                          <Select
                            label="Dosage"
                            options={[
                              { value: '1 tablet', label: '1 Tablet' },
                              { value: '2 tablets', label: '2 Tablets' },
                              { value: '5 ml syrup', label: '5 ml Syrup' },
                              { value: '1 capsule', label: '1 Capsule' },
                            ]}
                            value={medDosage}
                            onChange={(e) => setMedDosage(e.target.value)}
                          />
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <Select
                            label="Frequency"
                            options={[
                              { value: 'Once daily', label: 'Once daily' },
                              { value: 'Twice daily', label: 'Twice daily' },
                              { value: 'Thrice daily', label: 'Thrice daily' },
                              { value: 'As needed (SOS)', label: 'As needed (SOS)' },
                            ]}
                            value={medFreq}
                            onChange={(e) => setMedFreq(e.target.value)}
                          />
                          
                          <Select
                            label="Duration"
                            options={[
                              { value: '3 days', label: '3 days' },
                              { value: '5 days', label: '5 days' },
                              { value: '7 days', label: '7 days' },
                              { value: '30 days', label: '30 days' },
                            ]}
                            value={medDur}
                            onChange={(e) => setMedDur(e.target.value)}
                          />
                        </div>

                        <Button 
                          type="button" 
                          variant="accent" 
                          size="sm" 
                          className="w-full flex items-center justify-center space-x-1.5"
                          onClick={handleAddMedicine}
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add to Prescription Chart</span>
                        </Button>
                      </div>

                      {/* Display added medicines */}
                      {prescribedMeds.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-slate-400">Prescribed Medicine Chart:</span>
                          <div className="divide-y divide-slate-100 border border-light-border rounded-xl p-3 bg-slate-50/50">
                            {prescribedMeds.map((med, index) => (
                              <div key={index} className="flex justify-between items-center py-2">
                                <div>
                                  <p className="text-sm font-bold">{med.name}</p>
                                  <p className="text-xs text-slate-400">
                                    {med.dosage} • {med.frequency} • {med.duration}
                                  </p>
                                </div>
                                <button type="button" onClick={() => handleRemoveMedicine(index)} className="p-1.5 text-slate-400 hover:text-danger rounded-lg transition-colors cursor-pointer">
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button type="submit" className="w-full flex items-center justify-center space-x-2" disabled={prescribedMeds.length === 0 || !diagnosis}>
                        <Send className="h-4 w-4" />
                        <span>Issue E-Prescription</span>
                      </Button>

                    </form>
                  </CardContent>
                </Card>
              </div>

              {/* Right Col: Info Tips */}
              <div>
                <Card className="border-accent/20">
                  <CardHeader>
                    <CardTitle className="text-accent text-base flex items-center gap-1.5">
                      <Sparkles className="h-5 w-5" /> Autopilot E-Prescribe
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-xs text-slate-500 leading-relaxed space-y-3">
                    <p>When you issue an e-prescription, it is immediately synchronized with the patient's vault.</p>
                    <p>The system automatically registers medicine suggestions, matches inventory in the online pharmacy catalog, and generates a shopping link for the patient's checkout ease.</p>
                  </CardContent>
                </Card>
              </div>

            </div>
          )}

          {/* Tab: Patients directory & records viewer */}
          {activeTab === 'patients' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Patients List (Left) */}
              <div className="lg:col-span-2 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>My Patients Registry</CardTitle>
                    <CardDescription>Select a patient profile to review diagnosis reason and check uploaded vault reports</CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                      {patients.map((pat) => (
                        <div 
                          key={pat.id} 
                          onClick={() => setSelectedPatientId(selectedPatientId === pat.id ? null : pat.id)}
                          className={`p-5 flex flex-col hover:bg-slate-50 transition-colors cursor-pointer ${
                            selectedPatientId === pat.id ? 'bg-primary/5 hover:bg-primary/5' : ''
                          }`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <div className="flex items-center space-x-3.5">
                              <div className="h-10 w-10 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold">
                                {pat.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-800">{pat.name}</h4>
                                <div className="flex items-center space-x-2.5 mt-0.5 text-xs text-slate-400">
                                  <span>{pat.age} years old</span>
                                  <span>•</span>
                                  <span>Blood: {pat.bloodGroup}</span>
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-slate-400">Last consult: {pat.lastVisit}</span>
                          </div>
                          
                          {/* Expanded Details */}
                          <AnimatePresence>
                            {selectedPatientId === pat.id && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500 space-y-3 overflow-hidden"
                              >
                                <div>
                                  <span className="font-bold text-slate-600 block mb-1">Consultation Reason:</span>
                                  <p className="leading-relaxed">{pat.reason}</p>
                                </div>
                                <div className="space-y-2">
                                  <span className="font-bold text-slate-600 block">Uploaded Vault Files ({pat.uploadedRecords.length}):</span>
                                  <div className="flex flex-col gap-1.5">
                                    {pat.uploadedRecords.map((rec, i) => (
                                      <div key={i} className="flex justify-between items-center p-2 bg-white border border-light-border rounded-lg">
                                        <div className="flex items-center space-x-2 text-slate-700">
                                          <FileText className="h-4 w-4 text-primary" />
                                          <span>{rec.name}</span>
                                        </div>
                                        <a href="#" className="text-primary font-semibold hover:underline">Preview</a>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>

                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Clinic Notes Tips */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Clinical Guidelines</CardTitle>
                    <CardDescription>Strict HIPAA & EHR regulations compliance</CardDescription>
                  </CardHeader>
                  <CardContent className="text-xs text-slate-500 space-y-4 leading-relaxed">
                    <div className="flex items-start space-x-2.5">
                      <Check className="h-4 w-4 text-success shrink-0" />
                      <span>EHR patient profiles are only readable during verified booking window schedules.</span>
                    </div>
                    <div className="flex items-start space-x-2.5">
                      <Check className="h-4 w-4 text-success shrink-0" />
                      <span>Always request patient approvals before exporting medical documents out of the vault network.</span>
                    </div>
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
