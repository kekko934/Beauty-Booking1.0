
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const RegisterPage = () => {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [phone, setPhone] = useState('');
  // const [address, setAddress] = useState(''); // Address field removed
  const [isLoading, setIsLoading] = useState(false);
  const { register, user: authUser } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(email)) {
      toast({ title: "Errore Email", description: "Per favore, inserisci un indirizzo email valido.", variant: "destructive" });
      return;
    }

    if (password.length < 6) {
      toast({ title: "Errore Password", description: "La password deve contenere almeno 6 caratteri.", variant: "destructive" });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: "Errore Password", description: "Le password non coincidono.", variant: "destructive" });
      return;
    }
    if (!username.match(/^[a-zA-Z0-9_]{3,20}$/)) {
      toast({ title: "Errore Nome Utente", description: "Il nome utente deve avere 3-20 caratteri e può contenere lettere, numeri e underscore (_).", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    const { user, error } = await register(fullName, username, email, password, phone);
    setIsLoading(false);

    if (!error && user) {
      navigate('/login');
    } else if (!error && !user) {
      navigate('/login');
    }
  };

  React.useEffect(() => {
    if (authUser) {
      navigate('/dashboard');
    }
  }, [authUser, navigate]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center min-h-[calc(100vh-200px)] py-8"
    >
      <Card className="w-full max-w-lg shadow-2xl bg-white/90 backdrop-blur-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold text-primary">Crea il Tuo Account</CardTitle>
          <CardDescription>Registrati per iniziare a prenotare i tuoi trattamenti di bellezza.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input id="fullName" placeholder="Valentina Rossi" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="username">Nome Utente</Label>
                <Input id="username" placeholder="valentina_rossi" value={username} onChange={(e) => setUsername(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="lamiaemail@esempio.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label htmlFor="password">Password (min. 6 caratteri)</Label>
                <Input id="password" type="password" placeholder="Scegli una password sicura" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-1">
                <Label htmlFor="confirm-password">Conferma Password</Label>
                <Input id="confirm-password" type="password" placeholder="Reinserisci la password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              </div>
            </div>
            <div className="space-y-1">
              <Label htmlFor="phone">Numero di Telefono</Label>
              <Input id="phone" type="tel" placeholder="+39 333 1234567" value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>
            {/* Address field and related text removed */}
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pt-4">
            <Button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white" disabled={isLoading}>
              {isLoading ? 'Registrazione in corso...' : 'Registrati'}
            </Button>
            <p className="text-sm text-center text-gray-600">
              Hai già un account?{' '}
              <Link to="/login" className="font-medium text-primary hover:underline">
                Accedi qui
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default RegisterPage;
  