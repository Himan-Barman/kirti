import { createClient } from '@supabase/supabase-js';

const getStoredSupabaseConfig = () => {
  const url = localStorage.getItem('kirti_supabase_url') || import.meta.env.VITE_SUPABASE_URL;
  const anonKey = localStorage.getItem('kirti_supabase_anon_key') || import.meta.env.VITE_SUPABASE_ANON_KEY;
  return { url, anonKey };
};

const { url: supabaseUrl, anonKey: supabaseAnonKey } = getStoredSupabaseConfig();

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl!, supabaseAnonKey!)
  : null;

export const saveSupabaseConfig = (url: string, anonKey: string) => {
  if (url && anonKey) {
    localStorage.setItem('kirti_supabase_url', url);
    localStorage.setItem('kirti_supabase_anon_key', anonKey);
    window.location.reload();
  }
};

export const clearSupabaseConfig = () => {
  localStorage.removeItem('kirti_supabase_url');
  localStorage.removeItem('kirti_supabase_anon_key');
  window.location.reload();
};
