
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, CalendarCheck, UserPlus, LogIn } from 'lucide-react';

const HomePage = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3,
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100
      }
    }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col items-center justify-center text-center py-12"
    >
      <motion.div 
        variants={itemVariants}
        className="mb-8"
      >
        <img  class="h-48 w-auto rounded-full shadow-lg border-4 border-pink-200" alt="Logo Valentina Gargiulo Beauty" src="https://images.unsplash.com/photo-1703783401586-01e027082719" />
      </motion.div>

      <motion.h1 
        variants={itemVariants}
        className="text-5xl font-extrabold tracking-tight sm:text-6xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-pink-500 via-rose-500 to-pink-400 mb-6"
      >
        Valentina Gargiulo Beauty
      </motion.h1>

      <motion.p 
        variants={itemVariants}
        className="text-xl text-slate-700 mb-10 max-w-2xl"
      >
        Trattamenti estetici professionali comodamente a casa tua. Prenota il tuo momento di bellezza, ovunque tu sia!
      </motion.p>

      <motion.div 
        variants={itemVariants}
        className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 mb-16"
      >
        <Button size="lg" onClick={() => navigate('/register')} className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
          <UserPlus className="mr-2 h-5 w-5" /> Registrati
        </Button>
        <Button size="lg" variant="outline" onClick={() => navigate('/login')} className="border-pink-500 text-pink-500 hover:bg-pink-50 hover:text-pink-600 shadow-md transform hover:scale-105 transition-transform duration-300">
          <LogIn className="mr-2 h-5 w-5" /> Accedi
        </Button>
        <Button size="lg" onClick={() => navigate('/book')} className="bg-gradient-to-r from-rose-400 to-pink-400 hover:from-rose-500 hover:to-pink-500 text-white shadow-lg transform hover:scale-105 transition-transform duration-300">
          <CalendarCheck className="mr-2 h-5 w-5" /> Prenota Ora
        </Button>
      </motion.div>

      <motion.div 
        variants={containerVariants} 
        className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl w-full"
      >
        <motion.div variants={itemVariants}>
          <Card className="bg-white/70 backdrop-blur-md shadow-xl hover:shadow-2xl transition-shadow duration-300 border-pink-100 border-2">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-pink-600 flex items-center">
                <Sparkles className="mr-2 h-6 w-6 text-rose-400" /> Qualità Professionale
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600">
                Utilizziamo solo prodotti di alta gamma e tecniche all'avanguardia per risultati impeccabili e duraturi.
              </CardDescription>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="bg-white/70 backdrop-blur-md shadow-xl hover:shadow-2xl transition-shadow duration-300 border-pink-100 border-2">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-pink-600 flex items-center">
                <CalendarCheck className="mr-2 h-6 w-6 text-rose-400" /> Prenotazione Facile
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600">
                Scegli il trattamento, il giorno e l'ora che preferisci in pochi click. Semplice, veloce e intuitivo.
              </CardDescription>
            </CardContent>
          </Card>
        </motion.div>
        <motion.div variants={itemVariants}>
          <Card className="bg-white/70 backdrop-blur-md shadow-xl hover:shadow-2xl transition-shadow duration-300 border-pink-100 border-2">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold text-pink-600 flex items-center">
                <UserPlus className="mr-2 h-6 w-6 text-rose-400" /> Comfort a Casa Tua
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-slate-600">
                Goditi i tuoi trattamenti preferiti nel comfort e nella privacy della tua casa, senza stress.
              </CardDescription>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default HomePage;
  