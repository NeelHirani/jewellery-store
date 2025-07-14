import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = "https://duuilscjtvbxyzmyrkms.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1dWlsc2NqdHZieHl6bXlya21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTc5NDcsImV4cCI6MjA2NzYzMzk0N30.KC4tLFuXhlEKtrZXYpEOPnyfS8dKS36gQhEsaInAaBs";
export const supabase = createClient(supabaseUrl, supabaseKey);