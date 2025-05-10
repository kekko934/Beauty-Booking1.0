
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Home, User, LogIn, LogOut, CalendarPlus, Sparkles, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';

const Navbar = () => {
  const navigate = useNavigate();
  const { user, isAdminAuth, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <motion.nav 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 120, damping: 10 }}
      className="bg-white/80 backdrop-blur-md shadow-md sticky top-0 z-50"
    >
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-primary hover:text-primary/80 transition-colors flex items-center">
          <Sparkles className="mr-2 h-7 w-7 text-rose-400" />
          Valentina Beauty
        </Link>
        <div className="space-x-2 flex items-center">
          <Button variant="ghost" onClick={() => navigate('/')} className="text-slate-700 hover:bg-pink-100 hover:text-pink-700">
            <Home className="mr-2 h-4 w-4" /> Home
          </Button>
          
          {isAdminAuth ? (
            <>
              <Button variant="ghost" onClick={() => navigate('/admin/dashboard')} className="text-slate-700 hover:bg-pink-100 hover:text-pink-700">
                <User className="mr-2 h-4 w-4" /> Dashboard Admin
              </Button>
              <Button variant="ghost" onClick={() => navigate('/admin/availability')} className="text-slate-700 hover:bg-pink-100 hover:text-pink-700">
                <Settings className="mr-2 h-4 w-4" /> Disponibilità
              </Button>
              <Button variant="outline" onClick={handleLogout} className="border-primary text-primary hover:bg-pink-50">
                <LogOut className="mr-2 h-4 w-4" /> Logout Admin
              </Button>
            </>
          ) : user ? (
            <>
              <Button variant="ghost" onClick={() => navigate('/dashboard')} className="text-slate-700 hover:bg-pink-100 hover:text-pink-700">
                <User className="mr-2 h-4 w-4" /> Il Mio Account
              </Button>
              <Button variant="ghost" onClick={() => navigate('/book')} className="text-slate-700 hover:bg-pink-100 hover:text-pink-700">
                <CalendarPlus className="mr-2 h-4 w-4" /> Prenota
              </Button>
              <Button variant="outline" onClick={handleLogout} className="border-primary text-primary hover:bg-pink-50">
                <LogOut className="mr-2 h-4 w-4" /> Logout
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')} className="text-slate-700 hover:bg-pink-100 hover:text-pink-700">
                <LogIn className="mr-2 h-4 w-4" /> Accedi
              </Button>
              <Button onClick={() => navigate('/register')} className="bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600">
                Registrati
              </Button>
              {/* Removed Admin login button from Navbar */}
            </>
          )}
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
  