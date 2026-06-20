import React, { useState } from 'react';
import { useAppointmentsStore } from '../store/useAppointmentsStore';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { Link } from 'react-router-dom';
import { Calendar, Video, MapPin, User, Check, XCircle, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const DoctorAppointments: React.FC = () => {
  const appointments = useAppointmentsStore((state) => state.appointments);
  const updateStatus = useAppointmentsStore((state) => state.updateAppointmentStatus);
  const [filter, setFilter] = useState<'ALL' | 'CONFIRMED' | 'PENDING' | 'COMPLETED' | 'CANCELLED'>('ALL');

  // Filter for doctor doc-1 (Dr. Sarah Specialist)
  const doctorApts = appointments.filter((apt) => apt.doctorId === 'doc-1');

  const filteredApts = doctorApts.filter((apt) => {
    if (filter === 'ALL') return true;
    return apt.status === filter;
  });

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl border border-light-border gap-4 shadow-sm">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Scheduled Consultations</h2>
          <p className="text-sm text-slate-400">Manage patient checkups, accept booking requests, and launch active telehealth sessions.</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-light-border gap-2 overflow-x-auto pb-1">
        {(['ALL', 'CONFIRMED', 'PENDING', 'COMPLETED', 'CANCELLED'] as const).map((status) => (
          <button
            key={status}
            onClick={() => setFilter(status)}
            className={`py-2 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              filter === status
                ? 'border-primary text-primary font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {status === 'ALL' ? 'All Requests' : status}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        <AnimatePresence mode="wait">
          {filteredApts.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-16 bg-white border border-light-border rounded-2xl"
            >
              <Clock className="h-10 w-10 text-slate-300 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-slate-500">No appointments found</h4>
              <p className="text-xs text-slate-400 mt-1">Patient appointment slots will display here when requested.</p>
            </motion.div>
          ) : (
            filteredApts.map((apt) => (
              <motion.div
                key={apt.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-light-border rounded-xl p-5 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all"
              >
                <div className="flex items-start space-x-4">
                  <div className="h-11 w-11 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                    {apt.type === 'VIRTUAL' ? <Video className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-slate-800">{apt.patientName}</h4>
                      <Badge variant="neutral" className="text-[9px] font-semibold">{apt.type === 'VIRTUAL' ? 'Telehealth Call' : 'In-Person Examination'}</Badge>
                      <Badge 
                        variant={
                          apt.status === 'CONFIRMED' ? 'success' : 
                          apt.status === 'PENDING' ? 'neutral' : 
                          apt.status === 'COMPLETED' ? 'accent' : 'danger'
                        } 
                        className="text-[9px]"
                      >
                        {apt.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-slate-400 flex flex-wrap gap-x-3 gap-y-1">
                      <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5 text-slate-400" /> Date: {apt.date} • {apt.timeSlot}</span>
                      <span className="flex items-center gap-1"><User className="h-3.5 w-3.5 text-slate-400" /> Consultation Fee: ₹{apt.fee}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 italic">Symptom Statement: "{apt.reason}"</p>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full md:w-auto justify-end border-t md:border-t-0 pt-3 md:pt-0">
                  {apt.status === 'PENDING' && (
                    <>
                      <Button 
                        size="sm" 
                        variant="primary" 
                        onClick={() => updateStatus(apt.id, 'CONFIRMED')}
                        className="font-bold flex items-center gap-1"
                      >
                        <Check className="h-4 w-4" />
                        <span>Accept</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => updateStatus(apt.id, 'CANCELLED')}
                        className="font-bold text-danger border-danger/25 flex items-center gap-1"
                      >
                        <XCircle className="h-4 w-4" />
                        <span>Decline</span>
                      </Button>
                    </>
                  )}
                  {apt.status === 'CONFIRMED' && apt.type === 'VIRTUAL' && (
                    <Link to={`/video-consultation/${apt.id}`}>
                      <Button size="sm" variant="accent" className="font-bold flex items-center gap-1.5 animate-pulse">
                        <Video className="h-4.5 w-4.5" />
                        <span>Start Video Call</span>
                      </Button>
                    </Link>
                  )}
                  {apt.status === 'CONFIRMED' && apt.type === 'PHYSICAL' && (
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => updateStatus(apt.id, 'COMPLETED')}
                      className="font-bold flex items-center gap-1.5"
                    >
                      <Check className="h-4 w-4" />
                      <span>Mark Completed</span>
                    </Button>
                  )}
                  {apt.status === 'COMPLETED' && (
                    <div className="flex items-center gap-2">
                      <Badge variant="success" className="px-3 py-1 font-bold text-[10px]">COMPLETED</Badge>
                      <Link to="/dashboard/doctor/prescription">
                        <Button size="sm" variant="outline">Write Rx</Button>
                      </Link>
                    </div>
                  )}
                  {apt.status === 'CANCELLED' && (
                    <Badge variant="danger" className="px-3 py-1 font-bold text-[10px]">DECLINED</Badge>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};
