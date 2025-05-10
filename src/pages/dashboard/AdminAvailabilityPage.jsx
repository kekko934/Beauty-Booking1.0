
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { Save, CalendarDays, Clock, Trash2 } from 'lucide-react';
import { Calendar as ShadCalendar } from '@/components/ui/calendar';
import { getSupabase } from '@/lib/supabaseClient';
import moment from 'moment';
import 'moment/locale/it'; 
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

moment.locale('it');

// Available time slots for selection
const ALL_POSSIBLE_SLOTS = [
  "09:00", "10:00", "11:00", "12:00",
  "14:00", "15:00", "16:00", "17:00", "18:00"
];

const AdminAvailabilityPage = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  // Stores availability as { 'YYYY-MM-DD': ['09:00', '10:00', ...] }
  const [dailyAvailableSlots, setDailyAvailableSlots] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const supabase = getSupabase();

  const formattedSelectedDate = moment(selectedDate).format('YYYY-MM-DD');

  const fetchAvailability = useCallback(async () => {
    if (!supabase) {
      toast({ title: "Errore Supabase", description: "Client non inizializzato.", variant: "destructive"});
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_availability')
        .select('date, available_slots');
      
      if (error) throw error;

      const fetchedSlots = {};
      data.forEach(item => {
        fetchedSlots[moment(item.date).format('YYYY-MM-DD')] = item.available_slots || [];
      });
      setDailyAvailableSlots(fetchedSlots);
    } catch (error) {
      toast({ title: "Errore Caricamento Disponibilità", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [supabase, toast]);

  useEffect(() => {
    fetchAvailability();
  }, [fetchAvailability]);

  const handleDateChange = (date) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleSlotToggle = (slot) => {
    setDailyAvailableSlots(prev => {
      const currentSlotsForDate = prev[formattedSelectedDate] || [];
      const newSlotsForDate = currentSlotsForDate.includes(slot)
        ? currentSlotsForDate.filter(s => s !== slot)
        : [...currentSlotsForDate, slot];
      return {
        ...prev,
        [formattedSelectedDate]: newSlotsForDate.sort() // Keep sorted for consistency
      };
    });
  };
  
  const handleSaveAvailability = async () => {
    if (!supabase) {
        toast({ title: "Errore Supabase", description: "Client non inizializzato.", variant: "destructive"});
        return;
    }
    setIsLoading(true);
    
    const slotsToSave = dailyAvailableSlots[formattedSelectedDate] || [];

    try {
      // Upsert logic: update if exists, insert if not
      const { error } = await supabase
        .from('admin_availability')
        .upsert(
          { date: formattedSelectedDate, available_slots: slotsToSave },
          { onConflict: 'date' } 
        );

      if (error) throw error;
      
      toast({ title: "Disponibilità Salvata", description: `Orari per ${moment(formattedSelectedDate).format('LL')} aggiornati.` });
      fetchAvailability(); // Refresh data
    } catch (error) {
      toast({ title: "Errore Salvataggio Disponibilità", description: error.message, variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearDaySlots = () => {
     setDailyAvailableSlots(prev => ({
      ...prev,
      [formattedSelectedDate]: []
    }));
    // Optionally, immediately save this clearing action to DB
    // handleSaveAvailability(); // Or let user explicitly save
    toast({ title: "Orari Cancellati", description: `Tutti gli orari per ${moment(formattedSelectedDate).format('LL')} sono stati deselezionati. Salva per confermare.`});
  };

  const isDayDisabled = (date) => {
    return moment(date).isBefore(moment(), 'day'); 
  };
  
  const currentDaySelectedSlots = dailyAvailableSlots[formattedSelectedDate] || [];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="py-8"
    >
      <Card className="max-w-3xl mx-auto shadow-xl bg-white/90 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-primary flex items-center">
            <CalendarDays className="mr-3 h-8 w-8" /> Gestione Dettagliata Disponibilità
          </CardTitle>
          <CardDescription>
            Seleziona un giorno e specifica gli orari in cui sei disponibile per le prenotazioni.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="mx-auto md:mx-0">
              <ShadCalendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateChange}
                disabled={isDayDisabled}
                className="rounded-md border bg-white p-0"
                locale={moment.locale('it')}
              />
            </div>
            <div className="flex-grow w-full space-y-4">
              <h4 className="text-lg font-semibold text-pink-700 mb-2">
                Imposta orari per: <span className="text-primary">{moment(selectedDate).format('dddd LL')}</span>
              </h4>
              {isDayDisabled(selectedDate) ? (
                <p className="text-sm text-slate-500 p-4 bg-slate-100 rounded-md">Non è possibile modificare la disponibilità per date passate.</p>
              ) : (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {ALL_POSSIBLE_SLOTS.map(slot => (
                      <div key={slot} className="flex items-center space-x-2 p-2 border rounded-md hover:bg-pink-50 transition-colors">
                        <Checkbox
                          id={`slot-${slot.replace(":", "")}`}
                          checked={currentDaySelectedSlots.includes(slot)}
                          onCheckedChange={() => handleSlotToggle(slot)}
                        />
                        <Label htmlFor={`slot-${slot.replace(":", "")}`} className="text-sm font-medium text-slate-700">
                          <Clock className="inline mr-1 h-3 w-3" />{slot}
                        </Label>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-start mt-4">
                     <Button variant="outline" onClick={handleClearDaySlots} className="text-red-600 border-red-500 hover:bg-red-50">
                        <Trash2 className="mr-2 h-4 w-4" /> Cancella Orari del Giorno
                     </Button>
                  </div>
                </>
              )}
            </div>
          </div>

          {!isDayDisabled(selectedDate) && (
            <Button onClick={handleSaveAvailability} disabled={isLoading} className="w-full mt-8 bg-gradient-to-r from-pink-500 to-rose-500 text-white text-lg py-3">
              <Save className="mr-2 h-5 w-5" />
              {isLoading ? 'Salvataggio in corso...' : `Salva Orari per ${moment(formattedSelectedDate).format('LL')}`}
            </Button>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default AdminAvailabilityPage;
  