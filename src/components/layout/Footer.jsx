
import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  return (
    <motion.footer 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-gray-100/50 backdrop-blur-sm py-6 text-center text-gray-600 border-t border-gray-200"
    >
      <div className="container mx-auto px-4">
        <p className="text-sm">
          &copy; {currentYear} Valentina Gargiulo Beauty. Tutti i diritti riservati.
        </p>
        <p className="text-xs mt-1">
          Design by Hostinger Horizons
        </p>
      </div>
    </motion.footer>
  );
};

export default Footer;
  