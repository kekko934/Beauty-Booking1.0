
import React from 'react';
import { motion } from 'framer-motion';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { treatments } from '@/config/treatments';
import { CheckCircle, Phone } from 'lucide-react';
import BookingSummary from '@/pages/booking/BookingSummary';

export const TreatmentSelectionStep = ({ selectedTreatment, setSelectedTreatment }) => {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
      <h3 className="text-xl font-semibold mb-4 text-pink-700">1. Scegli il Trattamento</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {treatments.map(treatment => (
          <motion.div 
            key={treatment.id}
            whileHover={{ scale: 1.03 }}
            onClick={() => setSelectedTreatment(treatment)}
            className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${selectedTreatment?.id === treatment.id ? 'bg-pink-100 border-primary shadow-lg' : 'bg-white hover:shadow-md border-gray-200'}`}
          >
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-lg text-slate-800">{treatment.icon} {treatment.name}</h4>
              {selectedTreatment?.id === treatment.id && <CheckCircle className="text-primary h-5 w-5" />}
            </div>
            <p className="text-sm text-slate-500">{treatment.duration} - {treatment.price}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export const DateTimeSelectionStep = ({
  selectedTreatment,
  selectedDate,
  setSelectedDate,
  selectedTimeSlot,
  setSelectedTimeSlot,
  availableTimeSlots,
  isDayDisabled
}) => {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
      <h3 className="text-xl font-semibold mb-4 text-pink-700">2. Seleziona Data e Ora</h3>
      <p className="mb-4 text-slate-600">Hai selezionato: <span className="font-semibold text-primary">{selectedTreatment.name}</span></p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Label className="text-slate-700 font-medium mb-2 block">Scegli una data:</Label>
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={setSelectedDate}
            className="rounded-md border bg-white shadow"
            disabled={isDayDisabled}
          />
           <p className="text-xs text-slate-500 mt-2">I giorni non selezionabili non hanno disponibilità.</p>
        </div>
        {selectedDate && (
          <div>
            <Label className="text-slate-700 font-medium mb-2 block">Scegli un orario:</Label>
            {availableTimeSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {availableTimeSlots.map(slot => (
                  <Button
                    key={slot}
                    variant={selectedTimeSlot === slot ? "default" : "outline"}
                    onClick={() => setSelectedTimeSlot(slot)}
                    className={`w-full ${selectedTimeSlot === slot ? 'bg-primary text-primary-foreground' : 'border-pink-300 text-pink-600 hover:bg-pink-50'}`}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500">Nessun orario disponibile per questa data. Prova un altro giorno.</p>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export const ConfirmationDetailsStep = ({
  selectedTreatment,
  selectedDate,
  selectedTimeSlot,
  phoneNumber,
  setPhoneNumber,
  address,
  setAddress
}) => {
  return (
    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
      <h3 className="text-xl font-semibold mb-4 text-pink-700">3. Dettagli e Conferma</h3>
      <BookingSummary 
        treatmentName={selectedTreatment.name}
        date={selectedDate.toLocaleDateString('it-IT')}
        time={selectedTimeSlot}
      />
      <div className="mt-6 space-y-2">
        <Label htmlFor="phoneNumber" className="text-slate-700 font-medium flex items-center">
          <Phone className="mr-2 h-4 w-4 text-pink-500" /> Numero di Telefono:
        </Label>
        <Input 
          id="phoneNumber" 
          type="tel"
          value={phoneNumber} 
          onChange={(e) => setPhoneNumber(e.target.value)} 
          placeholder="Es. +39 333 1234567" 
          required
          className="border-pink-300 focus:border-primary focus:ring-primary"
        />
      </div>
      <div className="mt-4 space-y-2">
        <Label htmlFor="address" className="text-slate-700 font-medium">Indirizzo per il trattamento (opzionale):</Label>
        <Input 
          id="address" 
          value={address} 
          onChange={(e) => setAddress(e.target.value)} 
          placeholder="Es. Via Roma 1, Milano" 
          className="border-pink-300 focus:border-primary focus:ring-primary"
        />
      </div>
    </motion.div>
  );
};
  