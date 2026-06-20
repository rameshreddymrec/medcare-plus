import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAppointmentsStore } from '../store/useAppointmentsStore';
import { useAuthStore } from '../store/useAuthStore';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Badge } from '../components/common/Badge';
import { 
  Video, VideoOff, Mic, MicOff, Monitor, PhoneOff, MessageSquare, 
  Send, ShieldAlert, Award, CheckCircle, RefreshCw 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatMessage {
  id: string;
  sender: 'PATIENT' | 'DOCTOR' | 'SYSTEM';
  text: string;
  timestamp: string;
}

export const VideoConsultation: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthStore();
  const appointments = useAppointmentsStore((state) => state.appointments);
  const updateStatus = useAppointmentsStore((state) => state.updateAppointmentStatus);

  // Lookup appointment
  const appointment = appointments.find((apt) => apt.id === id);

  // Video and Mic states
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isSharingScreen, setIsSharingScreen] = useState(false);
  const [showChat, setShowChat] = useState(true);
  const [callDuration, setCallDuration] = useState(0);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  
  // Real camera stream hooks
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [streamError, setStreamError] = useState(false);

  // Call status
  const [callState, setCallState] = useState<'CONNECTING' | 'ACTIVE' | 'DISCONNECTED'>('CONNECTING');

  // Trigger web cam capture
  useEffect(() => {
    if (callState === 'DISCONNECTED') return;

    let localStream: MediaStream | null = null;
    const enableCamera = async () => {
      try {
        setStreamError(false);
        localStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        setStream(localStream);
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream;
        }
      } catch (err) {
        console.warn('Camera stream permission denied or not available:', err);
        setStreamError(true);
      }
    };

    if (isCameraOn) {
      enableCamera();
    } else {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
    }

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isCameraOn, callState]);

  // Handle stream tracks status (mute/unmute)
  useEffect(() => {
    if (stream) {
      stream.getAudioTracks().forEach((track) => {
        track.enabled = isMicOn;
      });
    }
  }, [isMicOn, stream]);

  // Connect sequence simulator
  useEffect(() => {
    if (!appointment) return;

    // Simulate connecting
    const timer = setTimeout(() => {
      setCallState('ACTIVE');
      setChatMessages([
        { id: 'msg-1', sender: 'SYSTEM', text: 'Secure Peer-to-Peer HIPAA Compliant Link Established.', timestamp: getFormattedTime() },
        { id: 'msg-2', sender: 'DOCTOR', text: `Hello, thank you for checking in. I have reviewed your intake details regarding: "${appointment.reason}". Let me know if you can hear me properly.`, timestamp: getFormattedTime() },
      ]);
    }, 2000);

    return () => clearTimeout(timer);
  }, [appointment]);

  // Call timer simulator
  useEffect(() => {
    if (callState !== 'ACTIVE') return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [callState]);

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getFormattedTime = () => {
    return new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  // Rule-based chat assistant trigger
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !appointment) return;

    const patientMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'PATIENT',
      text: newMessage,
      timestamp: getFormattedTime(),
    };

    setChatMessages((prev) => [...prev, patientMsg]);
    const typedText = newMessage.toLowerCase();
    setNewMessage('');

    // Trigger Doctor reply
    setTimeout(() => {
      let replyText = "I see. Let's document this so I can print the instructions for your dosage.";
      if (typedText.includes('cough') || typedText.includes('cold') || typedText.includes('fever')) {
        replyText = "Fever and sore throat are common viral symptoms. I am generating a prescription with paracetamol and vitamin syrups to relieve these body aches.";
      } else if (typedText.includes('prescription') || typedText.includes('medicine') || typedText.includes('meds')) {
        replyText = "I will upload the prescription to your MedCare+ Vault immediately. You can order it directly via our E-Pharmacy tab!";
      } else if (typedText.includes('hello') || typedText.includes('hi')) {
        replyText = "Hello! Please describe your symptoms in detail and let me know of any pre-existing health conditions.";
      } else if (typedText.includes('hurt') || typedText.includes('pain') || typedText.includes('chest')) {
        replyText = "Understood. Please monitor your heart rates closely. I will record this checkup and suggest visiting our cardiology diagnostic wing if the discomfort persists.";
      }

      const doctorReply: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'DOCTOR',
        text: replyText,
        timestamp: getFormattedTime(),
      };
      setChatMessages((prev) => [...prev, doctorReply]);
    }, 1500);
  };

  const handleEndCall = () => {
    if (!appointment) return;
    
    // Stop tracks
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }

    setCallState('DISCONNECTED');
    updateStatus(appointment.id, 'COMPLETED');
  };

  // If appointment not found or cancelled
  if (!appointment) {
    return (
      <div className="max-w-xl mx-auto py-20 px-6 text-center space-y-6">
        <ShieldAlert className="h-14 w-14 text-danger mx-auto" />
        <h3 className="text-2xl font-black">Consultation Room Unavailable</h3>
        <p className="text-sm text-slate-400">
          The requested video room cannot be located, or has already expired. Verify your dashboard bookings to confirm schedules.
        </p>
        <Link to="/dashboard">
          <Button variant="primary">Return to Dashboard</Button>
        </Link>
      </div>
    );
  }

  // End Call/Summary view
  if (callState === 'DISCONNECTED') {
    return (
      <div className="max-w-2xl mx-auto py-16 px-4 sm:px-6">
        <Card className="border-success/20 bg-white shadow-xl overflow-hidden">
          <div className="p-8 text-center space-y-5">
            <div className="h-16 w-16 bg-success/15 rounded-full flex items-center justify-center mx-auto text-success">
              <CheckCircle className="h-9 w-9" />
            </div>
            
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-slate-800">Consultation Concluded</h3>
              <p className="text-sm text-slate-400">
                Your video consultation session with <strong>{appointment.doctorName}</strong> was completed successfully.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 max-w-md mx-auto pt-4 text-xs leading-relaxed text-left text-slate-500">
              <div className="bg-slate-50 p-4.5 rounded-xl border border-light-border">
                <span className="font-semibold text-slate-400 block mb-1">Session Timing</span>
                <p className="font-bold text-slate-700">Duration: {formatTime(callDuration)}</p>
                <p>{appointment.date} • {appointment.timeSlot}</p>
              </div>

              <div className="bg-slate-50 p-4.5 rounded-xl border border-light-border">
                <span className="font-semibold text-slate-400 block mb-1">Prescription Status</span>
                <p className="font-bold text-slate-700">Rx Emitted (Digital Vault)</p>
                <p className="text-[10px] text-slate-400 mt-1">Order medications directly from the MedCare+ E-Pharmacy catalog.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 pt-6 max-w-sm mx-auto">
              <Link to="/pharmacy" className="w-full">
                <Button className="w-full flex justify-center items-center gap-1.5" variant="accent">
                  <span>Visit Pharmacy</span>
                </Button>
              </Link>
              <Link to="/dashboard" className="w-full">
                <Button className="w-full flex justify-center items-center" variant="outline">
                  Back to Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 text-white flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* LEFT: Video stream workspace */}
      <div className="flex-1 flex flex-col relative h-[65vh] md:h-full justify-between p-4 bg-slate-900">
        
        {/* Top bar indicators */}
        <div className="flex justify-between items-center z-10">
          <div className="flex items-center space-x-3.5 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-white/5">
            <Award className="h-5.5 w-5.5 text-accent shrink-0" />
            <div>
              <h4 className="text-xs font-bold leading-none">{appointment.doctorName}</h4>
              <span className="text-[9px] text-accent block mt-0.5">{appointment.doctorSpecialty} Specialist</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-success animate-pulse" />
            <span className="text-[10px] font-black tracking-wider uppercase bg-slate-950/60 px-3 py-1.5 rounded-full border border-white/5">
              {callState === 'CONNECTING' ? 'Connecting...' : `LIVE • ${formatTime(callDuration)}`}
            </span>
          </div>
        </div>

        {/* Video Feeds Screen */}
        <div className="absolute inset-0 flex items-center justify-center bg-slate-950">
          {callState === 'CONNECTING' ? (
            <div className="text-center space-y-4">
              <RefreshCw className="h-10 w-10 text-primary animate-spin mx-auto" />
              <h4 className="text-sm font-semibold text-slate-300">Initializing WebRTC session...</h4>
              <p className="text-xs text-slate-500">Securing video channels with peer signal...</p>
            </div>
          ) : (
            <div className="relative w-full h-full">
              {/* Doctor Main screen */}
              <div className="w-full h-full bg-slate-900 flex items-center justify-center overflow-hidden">
                {/* Simulated Doctor Feed - custom premium aesthetic */}
                <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-900/60 to-primary/10 flex flex-col items-center justify-center">
                  <div className="h-24 w-24 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-primary text-3xl font-black shadow-lg shadow-primary/20 animate-pulse">
                    SD
                  </div>
                  <h4 className="text-sm font-bold text-slate-300 mt-4">{appointment.doctorName}</h4>
                  <p className="text-xs text-slate-500">Audio/Video active • Consultation room</p>
                </div>
              </div>

              {/* Patient PIP video (bottom right) */}
              <div className="absolute bottom-6 right-6 w-32 sm:w-44 aspect-video bg-slate-950 border border-white/10 rounded-xl overflow-hidden shadow-2xl z-20">
                {isCameraOn && !streamError ? (
                  <video 
                    ref={localVideoRef} 
                    autoPlay 
                    playsInline 
                    muted 
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center bg-slate-800 text-slate-500 text-xs">
                    {isCameraOn ? <VideoOff className="h-5 w-5" /> : <VideoOff className="h-5 w-5 text-danger" />}
                    <span className="text-[8px] mt-1 font-semibold">Camera Off</span>
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-slate-950/60 backdrop-blur-sm px-2 py-0.5 rounded text-[8px] font-bold">
                  You ({user?.name?.split(' ')[0] || 'Patient'})
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Toolbar Controls (Bottom) */}
        <div className="flex justify-center items-center space-x-3.5 z-10">
          <Button
            onClick={() => setIsMicOn(!isMicOn)}
            variant="outline"
            className={`h-11 w-11 rounded-full p-0 flex items-center justify-center shrink-0 border border-white/10 ${
              isMicOn 
                ? 'bg-slate-900 text-white hover:bg-slate-800' 
                : 'bg-danger text-white hover:bg-danger/80 border-danger'
            }`}
          >
            {isMicOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>

          <Button
            onClick={() => setIsCameraOn(!isCameraOn)}
            variant="outline"
            className={`h-11 w-11 rounded-full p-0 flex items-center justify-center shrink-0 border border-white/10 ${
              isCameraOn 
                ? 'bg-slate-900 text-white hover:bg-slate-800' 
                : 'bg-danger text-white hover:bg-danger/80 border-danger'
            }`}
          >
            {isCameraOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          <Button
            onClick={() => setIsSharingScreen(!isSharingScreen)}
            variant="outline"
            className={`h-11 w-11 rounded-full p-0 flex items-center justify-center shrink-0 border border-white/10 ${
              isSharingScreen 
                ? 'bg-primary text-white hover:bg-primary/95 border-primary' 
                : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            <Monitor className="h-5 w-5" />
          </Button>

          <Button
            onClick={() => setShowChat(!showChat)}
            variant="outline"
            className={`h-11 w-11 rounded-full p-0 flex items-center justify-center shrink-0 border border-white/10 md:hidden ${
              showChat ? 'bg-primary text-white border-primary' : 'bg-slate-900 text-white'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          <Button
            onClick={handleEndCall}
            className="bg-danger hover:bg-danger/90 text-white border-danger h-11 px-5 rounded-full flex items-center space-x-1.5 font-bold shadow-lg shadow-danger/25"
          >
            <PhoneOff className="h-4.5 w-4.5" />
            <span className="hidden sm:inline">End Consultation</span>
          </Button>
        </div>

      </div>

      {/* RIGHT: Chat and Consultation details panel */}
      <AnimatePresence>
        {showChat && (
          <motion.div 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 'auto', opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="w-full md:w-96 border-t md:border-t-0 md:border-l border-white/10 bg-slate-900 flex flex-col h-[35vh] md:h-full shrink-0 z-10"
          >
            {/* Header tabs */}
            <div className="p-4 border-b border-white/5 bg-slate-950 flex justify-between items-center">
              <div className="flex items-center space-x-2">
                <MessageSquare className="h-4.5 w-4.5 text-primary" />
                <h3 className="text-xs font-bold tracking-wider uppercase text-slate-300">Consultation Chat</h3>
              </div>
              <Badge variant="primary" className="text-[8px] px-1.5 py-0.5">HIPAA SECURE</Badge>
            </div>

            {/* Chat message logger */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/60">
              {chatMessages.map((msg) => {
                if (msg.sender === 'SYSTEM') {
                  return (
                    <div key={msg.id} className="text-center py-1">
                      <span className="inline-block bg-slate-950 text-[9px] text-slate-400 font-bold px-3 py-1 rounded-full border border-white/5">
                        {msg.text}
                      </span>
                    </div>
                  );
                }

                const isPatient = msg.sender === 'PATIENT';
                return (
                  <div key={msg.id} className={`flex flex-col ${isPatient ? 'items-end' : 'items-start'}`}>
                    <div className="flex items-center space-x-1.5 mb-1">
                      <span className="text-[9px] font-black text-slate-400">{isPatient ? 'You' : appointment.doctorName}</span>
                      <span className="text-[8px] text-slate-600">{msg.timestamp}</span>
                    </div>
                    <div className={`p-3 rounded-2xl max-w-[80%] text-xs leading-relaxed font-semibold shadow-md ${
                      isPatient 
                        ? 'bg-primary text-white rounded-tr-none' 
                        : 'bg-slate-800 text-slate-200 rounded-tl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Chat entry form */}
            <form onSubmit={handleSendMessage} className="p-4 bg-slate-950 border-t border-white/5 flex gap-2">
              <input
                type="text"
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="flex-grow bg-slate-900 text-xs px-3.5 py-2.5 rounded-xl border border-white/5 focus:border-primary outline-none text-white placeholder-slate-500 font-semibold"
              />
              <Button type="submit" size="sm" className="h-10 w-10 p-0 flex items-center justify-center rounded-xl bg-primary text-white">
                <Send className="h-4.5 w-4.5" />
              </Button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
