
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { getSupabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { TreatmentSelectionStep, DateTimeSelectionStep, ConfirmationDetailsStep } from '@/pages/booking/BookingSteps';
import BookingConfirmation from '@/pages/booking/BookingConfirmation';

const BookingPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [selectedTreatment, setSelectedTreatment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState(user?.phone || user?.user_metadata?.phone || '');
  const [address, setAddress] = useState(user?.user_metadata?.address || '');
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  
  const [adminAvailability, setAdminAvailability] = useState({});
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  useEffect(() => {
    const fetchAdminAvailability = async () => {
      const supabase = getSupabase();
      let fetchedAvailability = {};
      if (supabase) {
        console.warn("Supabase client exists, but actual fetch from 'admin_availability' is commented out for BookingPage. Using localStorage.");
      }
      
      const localData = localStorage.getItem('adminAvailability');
      if (localData) {
        fetchedAvailability = JSON.parse(localData);
      } else {
        ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'].forEach(dayId => {
            fetchedAvailability[dayId] = { enabled: false, slots: [] };
        });
        toast({title: "Nessuna Disponibilità Impostata", description: "L'amministratore non ha ancora configurato gli orari.", variant: "destructive"});
      }
      setAdminAvailability(fetchedAvailability);
    };
    fetchAdminAvailability();
  }, [toast]);

  useEffect(() => {
    if (selectedDate && adminAvailability) {
      const dayOfWeek = selectedDate.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
      const dayConfig = adminAvailability[dayOfWeek];
      if (dayConfig && dayConfig.enabled) {
        setAvailableTimeSlots(dayConfig.slots);
      } else {
        setAvailableTimeSlots([]);
      }
      setSelectedTimeSlot(null);
    }
  }, [selectedDate, adminAvailability]);

  const isDayDisabled = (date) => {
    const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'short' }).toLowerCase();
    const dayConfig = adminAvailability[dayOfWeek];
    const today = new Date();
    today.setHours(0,0,0,0);
    if (date < today) return true;
    return !dayConfig || !dayConfig.enabled || dayConfig.slots.length === 0;
  };

  const handleNextStep = () => setStep(prev => prev + 1);
  const handlePrevStep = () => setStep(prev => prev - 1);

  const handleBookingConfirm = async () => {
    if (!phoneNumber) {
      toast({ title: "Numero di Telefono Richiesto", description: "Per favore, inserisci il tuo numero di telefono.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    const bookingData = {
      user_id: user.id,
      treatment: selectedTreatment.id,
      date: selectedDate.toISOString().split('T')[0],
      time: selectedTimeSlot,
      status: 'In Attesa',
      phone_number: phoneNumber,
      address: address,
      created_at: new Date().toISOString(),
    };

    const supabase = getSupabase();
    if (supabase) {
      console.warn("Supabase client exists, but actual insert to 'bookings' is commented out. Saving to localStorage.");
      const localBookings = JSON.parse(localStorage.getItem('bookings')) || [];
      localBookings.push({id: `local-${Date.now()}`, ...bookingData});
      localStorage.setItem('bookings', JSON.stringify(localBookings));
      toast({ title: "Prenotazione Inviata! (Locale)", description: "La tua richiesta è stata salvata localmente." });
      setStep(4);
    } else {
      const localBookings = JSON.parse(localStorage.getItem('bookings')) || [];
      localBookings.push({id: `local-${Date.now()}`, ...bookingData});
      localStorage.setItem('bookings', JSON.stringify(localBookings));
      toast({ title: "Prenotazione Inviata! (Locale)", description: "La tua richiesta è stata salvata localmente." });
      setStep(4);
    }
    setIsLoading(false);
  };

  const resetBookingProcess = () => {
    setSelectedTreatment(null);
    setSelectedDate(null);
    setSelectedTimeSlot(null);
    setPhoneNumber(user?.phone || user?.user_metadata?.phone || '');
    setAddress(user?.user_metadata?.address || '');
    setStep(1);
    setIsLoading(false);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-8 flex justify-center"
    >
      <Card className="w-full max-w-2xl shadow-2xl bg-white/90 backdrop-blur-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Prenota il Tuo Trattamento</CardTitle>
          <CardDescription>Scegli il servizio, la data e l'ora che preferisci.</CardDescription>
        </CardHeader>

        <CardContent>
          {step === 1 && (
            <TreatmentSelectionStep 
              selectedTreatment={selectedTreatment} 
              setSelectedTreatment={setSelectedTreatment} 
            />
          )}

          {step === 2 && selectedTreatment && (
            <DateTimeSelectionStep
              selectedTreatment={selectedTreatment}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTimeSlot={selectedTimeSlot}
              setSelectedTimeSlot={setSelectedTimeSlot}
              availableTimeSlots={availableTimeSlots}
              isDayDisabled={isDayDisabled}
            />
          )}

          {step === 3 && selectedTreatment && selectedDate && selectedTimeSlot && (
            <ConfirmationDetailsStep
              selectedTreatment={selectedTreatment}
              selectedDate={selectedDate}
              selectedTimeSlot={selectedTimeSlot}
              phoneNumber={phoneNumber}
              setPhoneNumber={setPhoneNumber}
              address={address}
              setAddress={setAddress}
            />
          )}

          {step === 4 && (
            <BookingConfirmation
              selectedTreatment={selectedTreatment}
              selectedDate={selectedDate}
              selectedTimeSlot={selectedTimeSlot}
              onBookAnother={() => { resetBookingProcess(); navigate('/book'); }}
              onGoToDashboard={() => { resetBookingProcess(); navigate('/dashboard');}}
            />
          )}
        </CardContent>

        {step < 4 && (
          <CardFooter className="flex justify-between pt-6 border-t border-gray-200">
            <Button variant="outline" onClick={handlePrevStep} disabled={step === 1 || isLoading} className="border-pink-400 text-pink-600 hover:bg-pink-50">
              Indietro
            </Button>
            {step < 3 ? (
              <Button onClick={handleNextStep} disabled={ (step === 1 && !selectedTreatment) || (step === 2 && (!selectedDate || !selectedTimeSlot)) || isLoading } className="bg-gradient-to-r from-pink-500 to-rose-500 text-white">
                {isLoading ? 'Caricamento...' : 'Avanti'}
              </Button>
            ) : (
              <Button onClick={handleBookingConfirm} disabled={!phoneNumber || isLoading} className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                {isLoading ? 'Invio in corso...' : 'Conferma Prenotazione'}
              </Button>
            )}
          </CardFooter>
        )}
      </Card>
    </motion.div>
  );
};

export default BookingPage;
  