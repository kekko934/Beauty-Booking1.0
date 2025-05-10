
import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { 
  initializeAuthListener, 
  loginUser as supabaseLoginUser,
  registerUser as supabaseRegisterUser,
  logoutUser as supabaseLogoutUser,
  adminLoginUser as localAdminLoginUser,
  refreshSession
} from '@/services/authService';
import { AuthActionTypes, authReducer, initialState } from '@/reducers/authReducer';
import { useAuthEffects } from '@/hooks/useAuthEffects';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = React.useReducer(authReducer, initialState);
  const { toast } = useToast();
  const navigate = useNavigate();

  const { user, isAdminAuth, loading } = state;

  const onAuthStateChangeCallback = useCallback((userPayload, isAdminPayload, loadingStatus) => {
    dispatch({ 
      type: AuthActionTypes.INITIALIZE_AUTH, 
      payload: { user: userPayload, isAdmin: isAdminPayload, loading: loadingStatus }
    });
  }, [dispatch]);

  useAuthEffects(dispatch, () => initializeAuthListener(onAuthStateChangeCallback));

  useEffect(() => {
    let isMounted = true; 

    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible' && isMounted) {
        if (!state.user && !state.isAdminAuth) {
          // Se non c'è nessun utente loggato (né Supabase né admin locale),
          // non c'è bisogno di refreshare la sessione o mostrare loading.
          // Lo stato iniziale di loading è già gestito da useAuthEffects.
          // Questo previene il loading infinito se si apre una nuova scheda senza essere loggati.
          if (state.loading) { // Se per qualche motivo era loading, resettalo
             dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
          }
          return;
        }
        
        dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
        try {
          const { user: refreshedUser, isAdmin: refreshedIsAdmin, error } = await refreshSession();
          if (!isMounted) return; 

          if (error) {
            console.error("Error refreshing session on visibility change:", error);
            // In caso di errore nel refresh, se non c'è utente, resettiamo.
            // Altrimenti, manteniamo lo stato precedente ma fermiamo il caricamento.
            if (!refreshedUser && !refreshedIsAdmin) { // Nessuna sessione valida trovata
               dispatch({ type: AuthActionTypes.INITIALIZE_AUTH, payload: { user: null, isAdmin: false, loading: false } });
            } else { // C'era un utente/admin, ma il refresh ha fallito, mantieni lo stato ma sblocca
               dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
            }
          } else {
            // Sessione rinfrescata con successo (o nessuna sessione trovata senza errori)
            dispatch({ 
              type: AuthActionTypes.INITIALIZE_AUTH, 
              payload: { user: refreshedUser, isAdmin: refreshedIsAdmin, loading: false } 
            });
          }
        } catch (e) {
          if (isMounted) {
            console.error("Exception during visibility change session refresh:", e);
            dispatch({ type: AuthActionTypes.INITIALIZE_AUTH, payload: { user: null, isAdmin: false, loading: false } });
          }
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      isMounted = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [dispatch, state.user, state.isAdminAuth, state.loading]);


  const handleLogin = useCallback(async (identifier, password) => {
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
    const { user: loggedInUser, error, isAdmin } = await supabaseLoginUser(identifier, password);
    
    if (error) {
      if (error.message !== "Invalid login credentials") {
        toast({ title: "Errore di Accesso", description: error.message || "Si è verificato un errore.", variant: "destructive" });
      }
      dispatch({ type: AuthActionTypes.LOGIN_FAILURE });
      return { user: null, error, success: false };
    }

    if (loggedInUser) {
      dispatch({ type: AuthActionTypes.LOGIN_SUCCESS, payload: { user: loggedInUser, isAdmin } });
      // localStorage per admin gestito in authService
      toast({ title: "Accesso Riuscito", description: "Benvenuto!" });
      return { user: loggedInUser, error: null, success: true };
    }
    
    dispatch({ type: AuthActionTypes.LOGIN_FAILURE });
    return { user: null, error: { message: "Accesso fallito." }, success: false };
  }, [toast, dispatch]);

  const handleRegister = useCallback(async (fullName, username, email, password, phone) => {
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
    const { user: registeredUser, error } = await supabaseRegisterUser(fullName, username, email, password, phone);
    
    if (error) {
      toast({ title: "Errore di Registrazione", description: error.message, variant: "destructive" });
      dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
      return { user: null, error };
    }
    if (registeredUser) {
      const needsConfirmation = !registeredUser.email_confirmed_at && 
                                (registeredUser.identities && registeredUser.identities.length > 0 && !registeredUser.identities[0].identity_data.email_verified);

      if (needsConfirmation) {
        toast({ title: "Registrazione Inviata", description: "Controlla la tua email per confermare l'account." });
      } else {
        toast({ title: "Registrazione Riuscita!", description: "Ora puoi effettuare il login." });
      }
    }
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
    return { user: registeredUser, error: null };
  }, [toast, dispatch]);

  const handleLogout = useCallback(async () => {
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
    const isAdminLoggingOut = isAdminAuth;
    await supabaseLogoutUser(); // Questo pulisce anche localStorage
    
    dispatch({ type: AuthActionTypes.LOGOUT });
    toast({ title: isAdminLoggingOut ? "Logout Admin Riuscito" : "Logout Riuscito" });
    navigate(isAdminLoggingOut ? '/login' : '/');
  }, [toast, navigate, isAdminAuth, dispatch]);

  const handleAdminLogin = useCallback((usernameInput, passwordInput) => {
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: true });
    const { success, user: adminUserDetail } = localAdminLoginUser(usernameInput, passwordInput);
    
    if (success && adminUserDetail) {
      dispatch({ type: AuthActionTypes.ADMIN_LOGIN_SUCCESS, payload: { user: adminUserDetail } });
      // localStorage per admin gestito in authService
      toast({ title: "Accesso Admin Riuscito", description: `Benvenuto ${adminUserDetail.user_metadata?.full_name || adminUserDetail.username}!` });
      return true;
    }
    
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: false });
    return false;
  }, [toast, dispatch]);

  const setUser = useCallback((userData) => {
    dispatch({ type: AuthActionTypes.SET_USER, payload: userData });
  }, [dispatch]);

  const setIsAdminAuth = useCallback((isAdmin) => {
    dispatch({ type: AuthActionTypes.SET_IS_ADMIN_AUTH, payload: isAdmin });
  }, [dispatch]);
  
  const setLoading = useCallback((isLoading) => {
    dispatch({ type: AuthActionTypes.SET_LOADING, payload: isLoading });
  }, [dispatch]);


  return (
    <AuthContext.Provider value={{ user, isAdminAuth, loading, login: handleLogin, register: handleRegister, logout: handleLogout, adminLogin: handleAdminLogin, setUser, setIsAdminAuth, setLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
  