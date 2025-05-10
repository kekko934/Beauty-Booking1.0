
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarDays, Users, ListOrdered, Filter, Edit, Trash2, Settings, CheckCircle, XCircle, Mail, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { getSupabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { treatments as treatmentsList } from '@/config/treatments';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';

// Helper to format date consistently
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString('it-IT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};


const AdminDashboardPage = () => {
  const [bookings, setBookings] = useState([]);
  const [users, setUsers] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [filterDate, setFilterDate] = useState('');
  const [filterTreatment, setFilterTreatment] = useState('all');
  const [isLoadingBookings, setIsLoadingBookings] = useState(true);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [treatmentStats, setTreatmentStats] = useState([]);
  const { toast } = useToast();
  const navigate = useNavigate();
  const supabase = getSupabase();

  const [editingBooking, setEditingBooking] = useState(null);
  const [newBookingTime, setNewBookingTime] = useState('');
  const [isModifyModalOpen, setIsModifyModalOpen] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!supabase) {
      toast({ title: "Errore Supabase", description: "Client Supabase non inizializzato.", variant: "destructive"});
      setIsLoadingBookings(false);
      return;
    }
    setIsLoadingBookings(true);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          id,
          user_id,
          treatment_name,
          booking_date,
          booking_time,
          status,
          created_at,
          user:users (
            full_name,
            email
          )
        `)
        .order('booking_date', { ascending: false })
        .order('booking_time', { ascending: false });

      if (error) {
        console.error("Supabase fetchBookings error:", error);
        throw error;
      }
      
      const formattedBookings = data.map(b => ({
        ...b,
        id: b.id.toString(),
        user_name: b.user?.full_name || `Utente ID: ${b.user_id ? b.user_id.substring(0,5) : 'Sconosciuto'}`,
        user_email: b.user?.email || 'N/A',
        treatment: b.treatment_name,
        date: b.booking_date,
        time: b.booking_time,
      }));
      setBookings(formattedBookings);
      setFilteredBookings(formattedBookings);
    } catch (error) {
      toast({ title: "Errore Caricamento Prenotazioni", description: `Dettagli: ${error.message}`, variant: "destructive" });
    } finally {
      setIsLoadingBookings(false);
    }
  }, [supabase, toast]);

  const fetchUsers = useCallback(async () => {
    if (!supabase) {
        toast({ title: "Errore Supabase", description: "Client Supabase non inizializzato.", variant: "destructive"});
        setIsLoadingUsers(false);
        return;
    }
    setIsLoadingUsers(true);
    try {
        const { data, error } = await supabase
            .from('users') // This refers to your public.users table
            .select('id, auth_user_id, username, full_name, email, phone, created_at')
            .order('created_at', { ascending: false });
        if (error) {
          console.error("Supabase fetchUsers error:", error);
          throw error;
        }
        setUsers(data || []);
    } catch (error) {
        toast({ title: "Errore Caricamento Utenti", description: `Dettagli: ${error.message}`, variant: "destructive" });
        setUsers([]); // Set to empty array on error
    } finally {
        setIsLoadingUsers(false);
    }
  }, [supabase, toast]);

  useEffect(() => {
    fetchBookings();
    fetchUsers();
  }, [fetchBookings, fetchUsers]);

  useEffect(() => {
    let tempBookings = bookings;
    if (filterDate) {
      tempBookings = tempBookings.filter(b => b.date === filterDate);
    }
    if (filterTreatment && filterTreatment !== 'all') {
      tempBookings = tempBookings.filter(b => b.treatment === filterTreatment);
    }
    setFilteredBookings(tempBookings);

    const stats = treatmentsList.map(treatmentType => {
      const count = bookings.filter(b => b.treatment === treatmentType.id && b.status === 'confirmed').length;
      return { name: treatmentType.name, count };
    });
    setTreatmentStats(stats);

  }, [filterDate, filterTreatment, bookings]);

  const handleUpdateBookingStatus = async (bookingId, status, userEmail, userName, treatmentName, bookingDate, bookingTime) => {
    if (!supabase) return;
    try {
      const { error } = await supabase.from('bookings').update({ status }).eq('id', bookingId);
      if (error) throw error;
      
      fetchBookings(); 
      toast({ title: "Stato Aggiornato", description: `Prenotazione ${status}.` });

      let edgeFunctionName = '';
      let emailSubject = '';
      let emailBody = '';

      if (status === 'confirmed') {
        edgeFunctionName = 'send-booking-confirmation-email';
        emailSubject = 'Prenotazione Confermata!';
        emailBody = `Ciao ${userName},\n\nLa tua prenotazione per ${treatmentName} il ${formatDate(bookingDate)} alle ${bookingTime} è stata confermata.\n\nGrazie,\nValentina Gargiulo Beauty`;
      } else if (status === 'cancelled') {
        edgeFunctionName = 'send-booking-cancellation-email';
        emailSubject = 'Prenotazione Annullata';
        emailBody = `Ciao ${userName},\n\nSiamo spiacenti di informarti che la tua prenotazione per ${treatmentName} il ${formatDate(bookingDate)} alle ${bookingTime} è stata annullata.\nContattaci per maggiori informazioni o per riprenotare.\n\nGrazie,\nValentina Gargiulo Beauty`;
      }

      if (edgeFunctionName && userEmail && userEmail !== 'N/A') {
        const { data: funcData, error: funcError } = await supabase.functions.invoke(edgeFunctionName, {
          body: JSON.stringify({ email: userEmail, subject: emailSubject, body: emailBody, name: userName })
        });
        if (funcError) {
          console.error(`Error invoking ${edgeFunctionName}:`, funcError);
          toast({title: "Errore Notifica Email", description: `Impossibile inviare email (simulata): ${funcError.message}`, variant: "destructive"})
        } else {
          console.log('Email function invoked:', funcData);
          toast({title: "Notifica Email", description: `Email di ${status} inviata (simulata).`})
        }
      } else if (!userEmail || userEmail === 'N/A') {
        toast({title: "Notifica Email Saltata", description: "Indirizzo email utente non disponibile.", variant: "default"})
      }

    } catch (error) {
      toast({ title: "Errore Aggiornamento", description: error.message, variant: "destructive" });
    }
  };
  
  const openModifyModal = (booking) => {
    setEditingBooking(booking);
    setNewBookingTime(booking.time);
    setIsModifyModalOpen(true);
  };

  const handleModifyBookingTime = async () => {
    if (!supabase || !editingBooking || !newBookingTime) return;
    try {
      const { error } = await supabase.from('bookings').update({ booking_time: newBookingTime }).eq('id', editingBooking.id);
      if (error) throw error;

      fetchBookings();
      setIsModifyModalOpen(false);
      setEditingBooking(null);
      toast({ title: "Orario Modificato", description: "L'orario della prenotazione è stato aggiornato." });
      
      const userEmail = editingBooking.user_email;
      if (userEmail && userEmail !== 'N/A') {
        const { data: funcData, error: funcError } = await supabase.functions.invoke('send-booking-update-email', {
           body: JSON.stringify({ 
              email: userEmail, 
              subject: "Modifica Orario Prenotazione",
              body: `Ciao ${editingBooking.user_name},\n\nL'orario della tua prenotazione per ${treatmentsList.find(t => t.id === editingBooking.treatment)?.name || editingBooking.treatment} del ${formatDate(editingBooking.date)} è stato modificato a ${newBookingTime}.\n\nGrazie,\nValentina Gargiulo Beauty`,
              name: editingBooking.user_name
            })
        });
        if (funcError) {
          console.error('Error invoking send-booking-update-email:', funcError);
          toast({title: "Errore Notifica Email", description: `Impossibile inviare email di modifica (simulata): ${funcError.message}`, variant: "destructive"})
        } else {
          console.log('Update Email function invoked:', funcData);
          toast({title: "Notifica Email", description: `Email di modifica orario inviata (simulata).`})
        }
      } else {
         toast({title: "Notifica Email Saltata", description: "Indirizzo email utente non disponibile per modifica.", variant: "default"})
      }

    } catch (error) {
      toast({ title: "Errore Modifica Orario", description: error.message, variant: "destructive" });
    }
  };


  const bookingsTableColumns = [
    { header: "Cliente", accessor: "user_name" },
    { header: "Email", accessor: "user_email"},
    { header: "Trattamento", accessor: "treatment" },
    { header: "Data", accessor: "date" },
    { header: "Ora", accessor: "time" },
    { header: "Stato", accessor: "status" },
    { header: "Azioni", accessor: "actions" },
  ];

  const usersTableColumns = [
    { header: "Nome Utente", accessor: "username" },
    { header: "Nome Completo", accessor: "full_name" },
    { header: "Email", accessor: "email" },
    { header: "Telefono", accessor: "phone" },
    { header: "Registrato il", accessor: "created_at"},
  ];


  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="py-8"
    >
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-primary">Pannello Amministrazione</h1>
        <Button onClick={() => navigate('/admin/availability')} className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white">
            <Settings className="mr-2 h-5 w-5" /> Gestisci Disponibilità
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {[
          { title: "Prenotazioni Totali", value: bookings.length, icon: <CalendarDays className="h-8 w-8 text-pink-500" />, color: "bg-pink-100" },
          { title: "Clienti Registrati", value: users.length, icon: <Users className="h-8 w-8 text-rose-500" />, color: "bg-rose-100" },
          { title: "Tratt. più Richiesto (Conf.)", value: treatmentStats.length > 0 ? (treatmentStats.sort((a,b) => b.count - a.count)[0]?.name || 'N/D') : 'N/D', icon: <ListOrdered className="h-8 w-8 text-purple-500" />, color: "bg-purple-100" },
        ].map(stat => (
          <motion.div key={stat.title} whileHover={{ scale: 1.05 }} transition={{ type: "spring", stiffness: 300 }}>
            <Card className={`${stat.color} shadow-lg border-0`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-700">{stat.title}</CardTitle>
                {stat.icon}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
      
      <Tabs defaultValue="allBookings" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 mb-4 bg-pink-100 p-1 rounded-lg">
          <TabsTrigger value="allBookings" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Tutte le Prenotazioni</TabsTrigger>
          <TabsTrigger value="treatmentStats" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Statistiche Trattamenti</TabsTrigger>
          <TabsTrigger value="userManagement" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Gestione Utenti</TabsTrigger>
        </TabsList>

        <TabsContent value="allBookings">
          <Card className="bg-white/80 backdrop-blur-md shadow-lg">
            <CardHeader>
              <CardTitle className="text-pink-700">Elenco Prenotazioni</CardTitle>
              <CardDescription>Filtra e gestisci tutte le prenotazioni.</CardDescription>
              <div className="flex flex-col sm:flex-row gap-4 mt-4 pt-4 border-t">
                <Input 
                  type="date" 
                  value={filterDate} 
                  onChange={(e) => setFilterDate(e.target.value)}
                  className="border-pink-300 focus:border-primary"
                />
                <Select value={filterTreatment} onValueChange={setFilterTreatment}>
                  <SelectTrigger className="w-full sm:w-[200px] border-pink-300 focus:border-primary">
                    <SelectValue placeholder="Filtra per trattamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tutti i trattamenti</SelectItem>
                    {treatmentsList.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button onClick={() => {setFilterDate(''); setFilterTreatment('all');}} variant="outline" className="border-pink-400 text-pink-600 hover:bg-pink-50">
                  <Filter className="mr-2 h-4 w-4" /> Resetta Filtri
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {isLoadingBookings ? <p className="text-center py-4 text-slate-600">Caricamento prenotazioni...</p> : (
                filteredBookings.length === 0 && !isLoadingBookings ? (
                  <div className="text-center py-10">
                    <AlertTriangle className="mx-auto h-12 w-12 text-yellow-500" />
                    <p className="mt-4 text-lg text-slate-700">Nessuna prenotazione trovata.</p>
                    <p className="text-sm text-slate-500">Prova a modificare i filtri o attendi nuove prenotazioni.</p>
                  </div>
                ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-pink-200 rounded-lg shadow">
                    <thead>
                      <tr className="bg-pink-50">
                        {bookingsTableColumns.map(col => <th key={col.accessor} className="py-2 px-4 border-b text-left text-sm font-medium text-pink-600">{col.header}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-pink-50/50 transition-colors">
                          <td className="py-2 px-4 border-b text-sm text-slate-700">{booking.user_name}</td>
                          <td className="py-2 px-4 border-b text-sm text-slate-700">{booking.user_email}</td>
                          <td className="py-2 px-4 border-b text-sm text-slate-700">{treatmentsList.find(t => t.id === booking.treatment)?.name || booking.treatment}</td>
                          <td className="py-2 px-4 border-b text-sm text-slate-700">{formatDate(booking.date)}</td>
                          <td className="py-2 px-4 border-b text-sm text-slate-700">{booking.time}</td>
                          <td className="py-2 px-4 border-b text-sm text-slate-700">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                              booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                              booking.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>{booking.status}</span>
                          </td>
                          <td className="py-2 px-4 border-b text-sm text-slate-700 flex items-center gap-1">
                            {booking.status === 'pending' && (
                              <Button variant="ghost" size="sm" onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed', booking.user_email, booking.user_name, treatmentsList.find(t => t.id === booking.treatment)?.name || booking.treatment, booking.date, booking.time)} className="text-green-600 hover:text-green-800">
                                <CheckCircle className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm" onClick={() => openModifyModal(booking)} className="text-blue-600 hover:text-blue-800">
                              <Edit className="h-4 w-4" />
                            </Button>
                            {booking.status !== 'cancelled' && (
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800">
                                    <XCircle className="h-4 w-4" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Questa azione annullerà la prenotazione. Verrà inviata una notifica all'utente.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Indietro</AlertDialogCancel>
                                    <AlertDialogAction onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled', booking.user_email, booking.user_name, treatmentsList.find(t => t.id === booking.treatment)?.name || booking.treatment, booking.date, booking.time)} className="bg-red-600 hover:bg-red-700">
                                      Conferma Annullamento
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="treatmentStats">
           <Card className="bg-white/80 backdrop-blur-md shadow-lg">
            <CardHeader>
              <CardTitle className="text-pink-700">Statistiche sui Trattamenti (Confermati)</CardTitle>
              <CardDescription>Analisi dei trattamenti confermati più richiesti.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="overflow-x-auto">
                <table className="min-w-full bg-white border border-pink-200 rounded-lg shadow">
                  <thead>
                    <tr className="bg-pink-50">
                      <th className="py-2 px-4 border-b text-left text-sm font-medium text-pink-600">Trattamento</th>
                      <th className="py-2 px-4 border-b text-left text-sm font-medium text-pink-600">N° Prenotazioni Confermate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {treatmentStats.length === 0 && !isLoadingBookings ? (
                       <tr><td colSpan="2" className="text-center py-4 text-slate-600">Nessuna statistica disponibile.</td></tr>
                    ) : treatmentStats.map((stat, index) => (
                      <tr key={index} className="hover:bg-pink-50/50">
                        <td className="py-2 px-4 border-b text-sm text-slate-700">{stat.name}</td>
                        <td className="py-2 px-4 border-b text-sm text-slate-700">{stat.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

         <TabsContent value="userManagement">
           <Card className="bg-white/80 backdrop-blur-md shadow-lg">
            <CardHeader>
              <CardTitle className="text-pink-700">Gestione Utenti</CardTitle>
              <CardDescription>Elenco degli utenti registrati nel sistema.</CardDescription>
            </CardHeader>
            <CardContent>
               {isLoadingUsers ? <p className="text-center py-4 text-slate-600">Caricamento utenti...</p> : (
                users.length === 0 && !isLoadingUsers ? (
                  <div className="text-center py-10">
                    <Users className="mx-auto h-12 w-12 text-yellow-500" />
                    <p className="mt-4 text-lg text-slate-700">Nessun utente trovato.</p>
                    <p className="text-sm text-slate-500">Non ci sono utenti registrati al momento.</p>
                  </div>
                ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white border border-pink-200 rounded-lg shadow">
                    <thead>
                      <tr className="bg-pink-50">
                        {usersTableColumns.map(col => <th key={col.accessor} className="py-2 px-4 border-b text-left text-sm font-medium text-pink-600">{col.header}</th>)}
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="hover:bg-pink-50/50 transition-colors">
                          <td className="py-2 px-4 border-b text-sm text-slate-700">{user.username || 'N/D'}</td>
                          <td className="py-2 px-4 border-b text-sm text-slate-700">{user.full_name || 'N/D'}</td>
                          <td className="py-2 px-4 border-b text-sm text-slate-700">{user.email}</td>
                          <td className="py-2 px-4 border-b text-sm text-slate-700">{user.phone || 'N/D'}</td>
                          <td className="py-2 px-4 border-b text-sm text-slate-700">{formatDate(user.created_at)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                )
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {editingBooking && (
        <Dialog open={isModifyModalOpen} onOpenChange={setIsModifyModalOpen}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Modifica Orario Prenotazione</DialogTitle>
                    <DialogDescription>
                        Modifica l'orario per la prenotazione di {editingBooking.user_name} per il trattamento {treatmentsList.find(t => t.id === editingBooking.treatment)?.name || editingBooking.treatment} del {formatDate(editingBooking.date)}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="newTime" className="text-right">Nuovo Orario</Label>
                        <Input 
                            id="newTime" 
                            type="time" 
                            value={newBookingTime} 
                            onChange={(e) => setNewBookingTime(e.target.value)} 
                            className="col-span-3"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="outline">Annulla</Button>
                    </DialogClose>
                    <Button type="button" onClick={handleModifyBookingTime}>Salva Modifiche</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      )}

    </motion.div>
  );
};

export default AdminDashboardPage;
  