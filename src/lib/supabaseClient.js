
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xvgkmatccqljmywvucil.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inh2Z2ttYXRjY3Fsam15d3Z1Y2lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY3NTkyOTQsImV4cCI6MjA2MjMzNTI5NH0.5eCY8QDtriU4H5ev-QvTZvlfjtygXAMMvoUnwbVaX48';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getSupabase = () => {
  if (!supabase) {
    console.warn("Supabase client is not initialized. Check your credentials and configuration.");
  }
  return supabase;
};
  