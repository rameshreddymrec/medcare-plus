import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLabTestsStore } from '../store/useLabTestsStore';
import type { LabBooking, LabReport } from '../store/useLabTestsStore';
import { useAuthStore } from '../store/useAuthStore';
import { Card, CardContent } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { 
  FlaskConical, Calendar, Clock, MapPin, Download, Eye, X, 
  RefreshCw, ShieldCheck, User, Plus 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const PatientLabReports: React.FC = () => {
  const { user } = useAuthStore();
  const bookings = useLabTestsStore((state) => state.bookings);
  const cancelBooking = useLabTestsStore((state) => state.cancelBooking);
  const updateBookingStatus = useLabTestsStore((state) => state.updateBookingStatus);

  const [selectedReport, setSelectedReport] = useState<LabReport | null>(null);

  // Status badge selector
  const getStatusBadge = (status: LabBooking['status']) => {
    switch (status) {
      case 'PENDING_COLLECTION':
        return <Badge variant="neutral">Collector Scheduled</Badge>;
      case 'SAMPLE_COLLECTED':
        return <Badge variant="primary">Sample in Lab</Badge>;
      case 'RESULT_GENERATED':
        return <Badge variant="success">Report Available</Badge>;
      case 'CANCELLED':
        return <Badge variant="danger">Cancelled</Badge>;
      default:
        return null;
    }
  };

  // Simulated status progression for testing
  const triggerStatusProgression = (bookingId: string, currentStatus: LabBooking['status']) => {
    if (currentStatus === 'PENDING_COLLECTION') {
      updateBookingStatus(bookingId, 'SAMPLE_COLLECTED');
    } else if (currentStatus === 'SAMPLE_COLLECTED') {
      updateBookingStatus(bookingId, 'RESULT_GENERATED');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-light-border gap-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Diagnostic Reports Vault</h2>
          <p className="text-sm text-slate-400">Track pathology collections, monitor laboratory analysis timelines, and download certified reports.</p>
        </div>
        <Link to="/lab-tests">
          <Button variant="outline" size="sm" className="flex items-center gap-1">
            <Plus className="h-4 w-4" />
            <span>Book Pathology Test</span>
          </Button>
        </Link>
      </div>

      {/* Bookings Tracker list */}
      <div className="grid grid-cols-1 gap-6">
        {bookings.length === 0 ? (
          <div className="text-center py-16 bg-white border border-light-border rounded-2xl space-y-3">
            <FlaskConical className="h-10 w-10 text-slate-300 mx-auto" />
            <h4 className="text-sm font-semibold text-slate-500">No diagnostic orders found</h4>
            <p className="text-xs text-slate-400 max-w-xs mx-auto">Book laboratory checkups or home collection visits in Pathology tab.</p>
          </div>
        ) : (
          bookings.map((booking) => (
            <Card key={booking.id} className="relative overflow-hidden">
              {/* Top border colored by status */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                booking.status === 'RESULT_GENERATED' ? 'bg-success' :
                booking.status === 'SAMPLE_COLLECTED' ? 'bg-primary' :
                booking.status === 'CANCELLED' ? 'bg-danger' : 'bg-slate-300'
              }`} />

              <CardContent className="p-6">
                <div className="flex flex-col lg:flex-row justify-between gap-6">
                  
                  {/* Left Side: Basic details */}
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h3 className="text-base font-bold text-slate-800">
                        Diagnostic Order #{booking.id.toUpperCase()}
                      </h3>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-500">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 shrink-0 text-slate-400" />
                        <span>Schedule: <strong>{booking.date}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 shrink-0 text-slate-400" />
                        <span>Window: <strong>{booking.timeSlot}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 shrink-0 text-slate-400" />
                        <span>Patient Name: <strong>{booking.patientName}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 shrink-0 text-slate-400" />
                        <span className="truncate">Collector Address: <strong>{booking.address.street}, {booking.address.city}</strong></span>
                      </div>
                    </div>

                    <div className="space-y-1.5 pt-1 border-t border-slate-50">
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">Tests Booked:</span>
                      <div className="flex gap-1.5 flex-wrap">
                        {booking.items.map((it) => (
                          <Badge key={it.id} variant="neutral" className="text-[9px] font-semibold">
                            {it.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Side: Step-by-step Timeline Status Tracker & Actions */}
                  <div className="lg:w-80 shrink-0 flex flex-col justify-between border-t lg:border-t-0 lg:border-l border-slate-100 pt-4 lg:pt-0 lg:pl-6 gap-4">
                    
                    {/* Status timeline */}
                    <div className="space-y-3 text-xs">
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Pathology Timeline:</span>
                      
                      <div className="relative pl-5 space-y-4">
                        {/* Vertical line connector */}
                        <div className="absolute left-1.5 top-1 bottom-1 w-0.5 bg-slate-200" />
                        
                        {/* Step 1: collection */}
                        <div className="flex items-start gap-2.5 relative">
                          <div className={`h-3 w-3 rounded-full absolute -left-4.5 border-2 border-white ${
                            booking.status !== 'CANCELLED' ? 'bg-primary' : 'bg-slate-400'
                          }`} />
                          <div>
                            <p className="font-bold text-slate-700 leading-none">Home Sample Collection</p>
                            <span className="text-[9px] text-slate-400 block mt-0.5">
                              {booking.status === 'PENDING_COLLECTION' ? 'Certified pro arriving' : 'Sample collected'}
                            </span>
                          </div>
                        </div>

                        {/* Step 2: lab processing */}
                        <div className="flex items-start gap-2.5 relative">
                          <div className={`h-3 w-3 rounded-full absolute -left-4.5 border-2 border-white ${
                            booking.status === 'SAMPLE_COLLECTED' || booking.status === 'RESULT_GENERATED' ? 'bg-primary' : 'bg-slate-200'
                          }`} />
                          <div>
                            <p className="font-bold text-slate-700 leading-none">Laboratory Diagnostic Analysis</p>
                            <span className="text-[9px] text-slate-400 block mt-0.5">
                              {booking.status === 'SAMPLE_COLLECTED' ? 'Processing results' : booking.status === 'RESULT_GENERATED' ? 'Analysis concluded' : 'Waiting for sample'}
                            </span>
                          </div>
                        </div>

                        {/* Step 3: reports generated */}
                        <div className="flex items-start gap-2.5 relative">
                          <div className={`h-3 w-3 rounded-full absolute -left-4.5 border-2 border-white ${
                            booking.status === 'RESULT_GENERATED' ? 'bg-success' : 'bg-slate-200'
                          }`} />
                          <div>
                            <p className="font-bold text-slate-700 leading-none">Report Emitted</p>
                            <span className="text-[9px] text-slate-400 block mt-0.5">
                              {booking.status === 'RESULT_GENERATED' ? 'Certified by pathologist' : 'Pending review'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 items-center justify-end pt-2">
                      {/* Developer Tool: Fast Status simulator */}
                      {booking.status !== 'RESULT_GENERATED' && booking.status !== 'CANCELLED' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => triggerStatusProgression(booking.id, booking.status)}
                          className="text-[9px] px-2 py-1 h-7 border-dashed flex items-center gap-1 text-primary hover:bg-primary/5"
                        >
                          <RefreshCw className="h-3 w-3 animate-spin" />
                          <span>Simulate Next</span>
                        </Button>
                      )}

                      {booking.status === 'RESULT_GENERATED' && booking.report && (
                        <>
                          <Button 
                            size="sm" 
                            variant="primary"
                            className="flex items-center gap-1 h-8 text-[11px]"
                            onClick={() => setSelectedReport(booking.report || null)}
                          >
                            <Eye className="h-3.5 w-3.5" />
                            <span>View Scores</span>
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex items-center justify-center p-0 h-8 w-8 text-slate-500 hover:bg-slate-100 shrink-0"
                            onClick={() => alert(`Simulating report download for ${booking.id.toUpperCase()}`)}
                          >
                            <Download className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}

                      {booking.status === 'PENDING_COLLECTION' && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-danger hover:bg-danger/5 border-danger/25 text-[11px] h-8"
                          onClick={() => cancelBooking(booking.id)}
                        >
                          Cancel Collection
                        </Button>
                      )}
                    </div>
                  </div>

                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* PDF Scorecard modal viewer overlay */}
      <AnimatePresence>
        {selectedReport && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedReport(null)}
              className="fixed inset-0 z-50 bg-black"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-2xl shadow-2xl z-55 border border-light-border overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <FlaskConical className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-black text-slate-800">Certified Pathology Report</h3>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">Report ID: #{selectedReport.id.toUpperCase()} • Issued {selectedReport.date}</p>
                </div>
                <button 
                  onClick={() => setSelectedReport(null)} 
                  className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 cursor-pointer"
                >
                  <X className="h-5.5 w-5.5" />
                </button>
              </div>

              {/* Lab Metadata Info Card */}
              <div className="px-6 py-4 bg-primary/5 border-b border-light-border grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Patient Profile</span>
                  <p className="font-bold text-slate-800">{selectedReport.patientName}</p>
                  <p className="text-slate-450 mt-0.5">Primary Member • Account ID: {user?.id?.substring(0, 8).toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-400 block">Laboratory Sign-off</span>
                  <p className="font-bold text-slate-800">{selectedReport.technicianName}</p>
                  <p className="text-slate-450 mt-0.5">MedCare+ Labs Ltd • Certified Pathology Specialist</p>
                </div>
              </div>

              {/* Results scorecard list */}
              <div className="p-6 max-h-[50vh] overflow-y-auto space-y-4">
                <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider mb-2">Tested Parameters Results:</span>
                
                <div className="border border-light-border rounded-xl overflow-hidden divide-y divide-slate-100">
                  
                  {/* Table Header */}
                  <div className="bg-slate-50 px-4 py-2.5 grid grid-cols-3 sm:grid-cols-4 text-[10px] uppercase font-bold text-slate-400 text-left">
                    <span className="col-span-1 sm:col-span-2">Clinical Parameter</span>
                    <span className="text-center sm:text-left">Outcome Value</span>
                    <span>Reference Range</span>
                  </div>

                  {/* Table Rows */}
                  {selectedReport.results.map((res, index) => (
                    <div key={index} className="px-4 py-3.5 grid grid-cols-3 sm:grid-cols-4 text-xs font-semibold items-center text-slate-700 hover:bg-slate-50 transition-colors">
                      <div className="col-span-1 sm:col-span-2 flex flex-col pr-2">
                        <span className="font-bold">{res.name}</span>
                        <span className="text-[9px] text-slate-400">Biological sample check</span>
                      </div>
                      
                      <div className="flex items-center justify-center sm:justify-start gap-2">
                        <span className="font-extrabold text-slate-800">
                          {res.value} <span className="text-[10px] font-normal text-slate-400">{res.unit}</span>
                        </span>
                        <Badge 
                          variant={
                            res.status === 'OPTIMAL' ? 'success' : 
                            res.status === 'WARNING' ? 'neutral' : 'danger'
                          } 
                          className="text-[8px] px-1 py-0"
                        >
                          {res.status}
                        </Badge>
                      </div>

                      <div className="text-slate-450 italic">
                        {res.referenceRange} <span className="text-[10px] font-normal not-italic">{res.unit}</span>
                      </div>
                    </div>
                  ))}

                </div>

                {/* Health Package Verification seal */}
                <div className="p-4 bg-slate-50 rounded-xl flex items-start space-x-3 text-xs leading-relaxed text-slate-500">
                  <ShieldCheck className="h-5.5 w-5.5 text-success shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-slate-700 leading-none">Diagnostic Certificate Seal</p>
                    <p>This report has been digitally signed and certified under strict pathology criteria by MedCare+ lab networks. Outcomes are intended for clinical checkup verification. Consult your physician for medical advice.</p>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center">
                <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
                  Close Report
                </Button>
                <Button 
                  size="sm" 
                  className="flex items-center gap-1.5 font-bold"
                  onClick={() => alert('Simulating PDF download...')}
                >
                  <Download className="h-4 w-4" />
                  <span>Download PDF Document</span>
                </Button>
              </div>

            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
};
