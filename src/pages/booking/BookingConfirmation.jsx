
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Sparkle } from 'lucide-react';

const BookingConfirmation = ({ selectedTreatment, selectedDate, selectedTimeSlot, onBookAnother, onGoToDashboard }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.8 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="text-center py-10"
    >
      <Sparkle className="h-20 w-20 text-green-500 mx-auto mb-4 animate-pulse" />
      <h3 className="text-2xl font-semibold mb-2 text-green-600">Prenotazione Inviata!</h3>
      <p className="text-slate-700">Grazie per aver richiesto <strong className="text-primary">{selectedTreatment?.name}</strong>.</p>
      <p className="text-slate-600">Verrai contattata a breve per la conferma definitiva.</p>
      <p className="text-slate-600">Appuntamento richiesto per il <strong className="text-primary">{selectedDate?.toLocaleDateString('it-IT')}</strong> alle <strong className="text-primary">{selectedTimeSlot}</strong>.</p>
      <div className="mt-6 flex flex-col sm:flex-row justify-center gap-4">
        <Button onClick={onBookAnother} className="bg-gradient-to-r from-pink-400 to-rose-400 text-white">
          Prenota un Altro Trattamento
        </Button>
        <Button onClick={onGoToDashboard} variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-50">
          Torna alla Dashboard
        </Button>
      </div>
    </motion.div>
  );
};

export default BookingConfirmation;
  