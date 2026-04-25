/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vpulqdqahnzgqkogiqpm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZwdWxxZHFhaG56Z3Frb2dpcXBtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2OTgzOTUsImV4cCI6MjA4NTI3NDM5NX0.7fRZ0C7CwYnciKcFUTJ0o8tkwkgtNH-3vhQ_fFF2hWA';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Activity = {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  place: string;
  capacity: number;
  tags: string[];
  created_at: string;
  created_by: string;
};

export type Registration = {
  id: string;
  activity_id: string;
  name: string;
  hn: string;
  tel: string;
  created_at: string;
};
