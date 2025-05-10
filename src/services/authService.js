
import { getSupabase } from '@/lib/supabaseClient';

const adminCredentials = [
  { username: 'admin', password: 'admin', email: 'admin@example.com', fullName: 'Amministratore Master' },
  { username: 'kekko934', password: '1029229Km', email: 'kekko934.admin@example.com', fullName: 'Kekko (Admin)' },
  { username: 'valentina', password: '123456789', email: 'valentina.admin@example.com', fullName: 'Valentina (Admin)' }
];

const enrichUserWithProfile = async (supabase, user) => {
  if (!user) return null;
  try {
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('full_name, username, phone')
      .eq('auth_user_id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error("Error fetching user profile:", profileError);
      return user; 
    }
    return profile ? { ...user, ...profile } : user;
  } catch (e) {
    console.error("Exception fetching user profile:", e);
    return user; 
  }
};

const clearAdminLocalStorage = () => {
  localStorage.removeItem('isAdminAuth');
  localStorage.removeItem('user'); // Rimuove l'utente admin locale
};

const setAdminLocalStorage = (user) => {
  localStorage.setItem('isAdminAuth', 'true');
  localStorage.setItem('user', JSON.stringify(user));
};

export const initializeAuthListener = (onAuthStateChangeCallback) => {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn("Supabase client not available for auth listener.");
    onAuthStateChangeCallback(null, false, false); 
    return { unsubscribe: () => {} };
  }

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    async (_event, session) => {
      const supabaseUser = session?.user || null;
      if (supabaseUser) {
        const enrichedUser = await enrichUserWithProfile(supabase, supabaseUser);
        const isSupabaseAdminByEmail = adminCredentials.some(admin => admin.email === enrichedUser?.email);
        const hasAdminClaim = enrichedUser?.app_metadata?.claims_admin === true;
        const isAdmin = isSupabaseAdminByEmail || hasAdminClaim;
        
        if (isAdmin) {
          setAdminLocalStorage(enrichedUser);
        } else {
          clearAdminLocalStorage(); // Pulisce se l'utente Supabase non è un admin
        }
        onAuthStateChangeCallback(enrichedUser, isAdmin, false);
      } else {
        // No Supabase session, check for local admin session
        const localAdminUserJson = localStorage.getItem('user');
        const localIsAdminAuth = localStorage.getItem('isAdminAuth');
        let localAdminValid = false;
        let parsedLocalAdminUser = null;

        if (localIsAdminAuth === 'true' && localAdminUserJson) {
          try {
            parsedLocalAdminUser = JSON.parse(localAdminUserJson);
            const foundAdmin = adminCredentials.find(cred => cred.username === parsedLocalAdminUser.username && cred.email === parsedLocalAdminUser.email);
            if (parsedLocalAdminUser.app_metadata?.claims_admin || foundAdmin) {
              localAdminValid = true;
            }
          } catch (parseError) {
            console.error("Error parsing local admin user:", parseError);
          }
        }

        if (localAdminValid && parsedLocalAdminUser) {
            // Mantieni localStorage per admin locale
            onAuthStateChangeCallback(parsedLocalAdminUser, true, false);
        } else {
            // Nessuna sessione Supabase e nessun admin locale valido
            clearAdminLocalStorage();
            onAuthStateChangeCallback(null, false, false);
        }
      }
    }
  );

  (async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { 
        const localAdminUserJson = localStorage.getItem('user');
        const localIsAdminAuth = localStorage.getItem('isAdminAuth');
        if (localIsAdminAuth === 'true' && localAdminUserJson) {
            try {
                const parsedLocalAdminUser = JSON.parse(localAdminUserJson);
                const foundAdmin = adminCredentials.find(cred => cred.username === parsedLocalAdminUser.username && cred.email === parsedLocalAdminUser.email);
                if (parsedLocalAdminUser.app_metadata?.claims_admin || foundAdmin) {
                    onAuthStateChangeCallback(parsedLocalAdminUser, true, false);
                    return; 
                }
            } catch (e) { /* ignore */ }
        }
        onAuthStateChangeCallback(null, false, false);
    }
    // Se c'è una sessione, onAuthStateChange la gestirà.
  })();


  return { unsubscribe: () => subscription?.unsubscribe() };
};

export const refreshSession = async () => {
  const supabase = getSupabase();
  if (!supabase) return { user: null, isAdmin: false, error: { message: "Supabase non configurato." } };

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError) {
    clearAdminLocalStorage();
    return { user: null, isAdmin: false, error: sessionError };
  }

  if (session?.user) {
    const enrichedUser = await enrichUserWithProfile(supabase, session.user);
    const isSupabaseAdminByEmail = adminCredentials.some(admin => admin.email === enrichedUser?.email);
    const hasAdminClaim = enrichedUser?.app_metadata?.claims_admin === true;
    const isAdmin = isSupabaseAdminByEmail || hasAdminClaim;
    
    if (isAdmin) {
      setAdminLocalStorage(enrichedUser);
    } else {
      clearAdminLocalStorage();
    }
    return { user: enrichedUser, isAdmin, error: null };
  }
  
  // No Supabase session, check for local admin
  const localAdminUserJson = localStorage.getItem('user');
  const localIsAdminAuth = localStorage.getItem('isAdminAuth');
  if (localIsAdminAuth === 'true' && localAdminUserJson) {
    try {
      const parsedLocalAdminUser = JSON.parse(localAdminUserJson);
      const foundAdmin = adminCredentials.find(cred => cred.username === parsedLocalAdminUser.username && cred.email === parsedLocalAdminUser.email);
      if (parsedLocalAdminUser.app_metadata?.claims_admin || foundAdmin) {
        // Mantieni localStorage per admin locale
        return { user: parsedLocalAdminUser, isAdmin: true, error: null };
      }
    } catch (e) { /* ignore parsing error */ }
  }

  // Nessuna sessione Supabase e nessun admin locale valido
  clearAdminLocalStorage();
  return { user: null, isAdmin: false, error: null }; 
};


export const loginUser = async (identifier, password) => {
  const supabase = getSupabase();
  if (!supabase) {
    return { user: null, error: { message: "Supabase non configurato." }, isAdmin: false };
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email: identifier, password });

  if (error) {
    return { user: null, error, isAdmin: false };
  }

  if (data.user) {
    const enrichedUser = await enrichUserWithProfile(supabase, data.user);
    const isSupabaseAdminByEmail = adminCredentials.some(admin => admin.email === enrichedUser?.email);
    const hasAdminClaim = enrichedUser?.app_metadata?.claims_admin === true;
    const isAdmin = isSupabaseAdminByEmail || hasAdminClaim;

    if (isAdmin) {
      setAdminLocalStorage(enrichedUser);
    } else {
      clearAdminLocalStorage();
    }
    return { user: enrichedUser, error: null, isAdmin };
  }
  return { user: null, error: { message: "Utente non trovato o credenziali errate." }, isAdmin: false };
};

export const registerUser = async (fullName, username, email, password, phone) => {
  const supabase = getSupabase();
  if (!supabase) {
    return { user: null, error: { message: "Supabase non configurato." } };
  }

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
        username: username,
        phone: phone,
      }
    }
  });

  if (error) {
    return { user: null, error };
  }
  // Dopo la registrazione, l'utente non è un admin, quindi pulisci localStorage admin
  clearAdminLocalStorage();
  return { user: data.user, error: null };
};

export const logoutUser = async () => {
  const supabase = getSupabase();
  if (!supabase) {
    clearAdminLocalStorage();
    return { error: null }; 
  }
  const { error } = await supabase.auth.signOut();
  clearAdminLocalStorage(); // Pulisce sempre al logout
  return { error };
};

export const adminLoginUser = (usernameInput, passwordInput) => {
  const adminAccount = adminCredentials.find(
    cred => cred.username.toLowerCase() === usernameInput.toLowerCase() && cred.password === passwordInput
  );

  if (adminAccount) {
    const adminUser = { 
      id: `local-admin-${adminAccount.username}`, 
      email: adminAccount.email, 
      username: adminAccount.username,
      user_metadata: { full_name: adminAccount.fullName, username: adminAccount.username },
      app_metadata: { claims_admin: true } 
    };
    setAdminLocalStorage(adminUser); // Imposta localStorage per admin locale
    return { success: true, user: adminUser };
  }
  return { success: false, user: null };
};
  