
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { UserCircle } from 'lucide-react';

const LoginPage = () => {
  const [identifier, setIdentifier] = useState(''); 
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login, adminLogin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const isAdminAttempt = adminLogin(identifier, password);

    if (isAdminAttempt) {
      setIsLoading(false);
      navigate('/admin/dashboard');
      return;
    }
    
    const { error, user } = await login(identifier, password);
    setIsLoading(false);

    if (!error && user) {
      navigate('/dashboard');
    } else if (error) {
      if (error.message === "Invalid login credentials") {
        toast({
          title: "Credenziali Errrate",
          description: "Email/username o password non corretti. Riprova.",
          variant: "destructive",
        });
      } else {
         toast({
          title: "Errore di Accesso",
          description: error.message || "Si è verificato un errore durante il login.",
          variant: "destructive",
        });
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-center min-h-[calc(100vh-200px)]"
    >
      <Card className="w-full max-w-md shadow-2xl bg-white/90 backdrop-blur-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
             <UserCircle className="h-16 w-16 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-primary">Bentornata/o!</CardTitle>
          <CardDescription>Accedi al tuo account.</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="identifier">Email o Nome Utente</Label>
              <Input 
                id="identifier" 
                type="text" 
                placeholder="lamiaemail@esempio.com o iltuousername" 
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input 
                id="password" 
                type="password" 
                placeholder="La tua password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white" disabled={isLoading}>
              {isLoading ? 'Accesso in corso...' : 'Accedi'}
            </Button>
            <p className="text-sm text-center text-gray-600">
              Non hai un account?{' '}
              <Link to="/register" className="font-medium text-primary hover:underline">
                Registrati qui
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </motion.div>
  );
};

export default LoginPage;
  