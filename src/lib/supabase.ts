import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database';

// Initialize Supabase client with TypeScript support
const supabaseUrl: string = "https://duuilscjtvbxyzmyrkms.supabase.co";
const supabaseKey: string = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImR1dWlsc2NqdHZieHl6bXlya21zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTIwNTc5NDcsImV4cCI6MjA2NzYzMzk0N30.KC4tLFuXhlEKtrZXYpEOPnyfS8dKS36gQhEsaInAaBs";

export const supabase: SupabaseClient<Database> = createClient<Database>(supabaseUrl, supabaseKey);

// Type-safe helper functions
export type SupabaseResponse<T> = {
  data: T | null;
  error: Error | null;
};

export type SupabaseTable = keyof Database['public']['Tables'];