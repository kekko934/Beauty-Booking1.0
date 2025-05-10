
import React from 'react';

const BookingSummary = ({ treatmentName, date, time }) => {
  return (
    <div className="space-y-2 p-4 bg-pink-50 rounded-lg shadow">
      <p><strong className="text-slate-700">Trattamento:</strong> <span className="text-primary">{treatmentName}</span></p>
      <p><strong className="text-slate-700">Data:</strong> <span className="text-primary">{date}</span></p>
      <p><strong className="text-slate-700">Ora:</strong> <span className="text-primary">{time}</span></p>
    </div>
  );
};

export default BookingSummary;
  