
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarPlus, Edit, Trash2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { treatments as treatmentsList } from '@/config/treatments';


const UserDashboardPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [appointments, setAppointments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAppointments = async () => {
    if (!user) return;
    setIsLoading(true);
    const supabase = getSupabase();

    if (supabase) {
      console.warn("Supabase client exists, but actual fetch from 'bookings' is commented out for UserDashboard. Using localStorage.");
      const localBookings = JSON.parse(localStorage.getItem('bookings')) || [];
      setAppointments(localBookings.filter(b => b.user_id === user.id).sort((a,b) => new Date(b.date) - new Date(a.date)));
      toast({ title: "Appuntamenti Caricati (Locale)", description: "Visualizzazione appuntamenti da localStorage."});

    } else {
      const localBookings = JSON.parse(localStorage.getItem('bookings')) || [];
      setAppointments(localBookings.filter(b => b.user_id === user.id).sort((a,b) => new Date(b.date) - new Date(a.date)));
      toast({ title: "Appuntamenti Caricati (Locale)", description: "Visualizzazione appuntamenti da localStorage."});
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchAppointments();
  }, [user, toast]);

  const handleCancelBooking = async (bookingId) => {
    const supabase = getSupabase();
    if (supabase) {
        console.warn("Supabase client exists, but actual delete from 'bookings' is commented out. Updating localStorage.");
        let localBookings = JSON.parse(localStorage.getItem('bookings')) || [];
        localBookings = localBookings.filter(b => b.id !== bookingId);
        localStorage.setItem('bookings', JSON.stringify(localBookings));
        toast({ title: "Appuntamento Cancellato (Locale)", description: "L'appuntamento è stato rimosso localmente." });
        fetchAppointments();
    } else {
        let localBookings = JSON.parse(localStorage.getItem('bookings')) || [];
        localBookings = localBookings.filter(b => b.id !== bookingId);
        localStorage.setItem('bookings', JSON.stringify(localBookings));
        toast({ title: "Appuntamento Cancellato (Locale)", description: "L'appuntamento è stato rimosso localmente." });
        fetchAppointments();
    }
  };
  
  const handleEditBooking = (bookingId) => {
    toast({ title: "Modifica Appuntamento", description: `La modifica dell'appuntamento ${bookingId.substring(0,6)} non è ancora implementata.`, variant: "info" });
  };


  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-8"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-4xl font-bold text-primary">Il Mio Account</h1>
        <div className="flex gap-2">
          <Button onClick={fetchAppointments} variant="outline" className="border-pink-400 text-pink-600 hover:bg-pink-50">
            <RefreshCw className={`mr-2 h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} /> Aggiorna
          </Button>
          <Button onClick={() => navigate('/book')} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white">
            <CalendarPlus className="mr-2 h-5 w-5" /> Prenota Nuovo Trattamento
          </Button>
        </div>
      </div>

      <Card className="mb-8 bg-white/80 backdrop-blur-md shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl text-pink-700">I Miei Appuntamenti</CardTitle>
          <CardDescription>Visualizza, modifica o cancella le tue prenotazioni.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-slate-600 text-center py-4">Caricamento appuntamenti...</p>
          ) : appointments.length === 0 ? (
            <p className="text-slate-600 text-center py-4">Non hai appuntamenti programmati.</p>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <motion.div
                  key={apt.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Card className="border-pink-200 hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                      <div>
                        <h3 className="font-semibold text-lg text-pink-600">{treatmentsList.find(t => t.id === apt.treatment)?.name || apt.treatment}</h3>
                        <p className="text-sm text-slate-500">Data: {new Date(apt.date).toLocaleDateString('it-IT')} alle {apt.time}</p>
                        <p className="text-sm font-medium">Stato: <span className={apt.status === 'Confermato' ? 'text-green-600' : (apt.status === 'Cancellato' ? 'text-red-600' : 'text-orange-500')}>{apt.status}</span></p>
                      </div>
                      {apt.status !== 'Cancellato' && apt.status !== 'Completato' && (
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEditBooking(apt.id)} className="text-blue-600 border-blue-600 hover:bg-blue-50">
                            <Edit className="mr-1 h-4 w-4" /> Modifica
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleCancelBooking(apt.id)} className="text-red-600 border-red-600 hover:bg-red-50">
                            <Trash2 className="mr-1 h-4 w-4" /> Cancella
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default UserDashboardPage;
  