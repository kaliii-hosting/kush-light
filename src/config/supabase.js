import { createClient } from '@supabase/supabase-js';

// Your Supabase project details
const supabaseUrl = 'https://fchtwxunzmkzbnibqbwl.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjaHR3eHVuem1remJuaWJxYndsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAxNzI1NjcsImV4cCI6MjA2NTc0ODU2N30.RBE0cd8lOhXMhXRLDipNEqqpkfHdYzolFYnlzCVj_xs';

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name
export const STORAGE_BUCKET = 'kushie01'; // Your existing bucket name