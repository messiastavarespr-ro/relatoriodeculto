
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cqbjwlojyrwvkxaqspev.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxYmp3bG9qeXJ3dmt4YXFzcGV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNTA3NjYsImV4cCI6MjA4MjcyNjc2Nn0.HcMJI2avznMc-pDTXhNdBcB2sdrWxruV43A2wMhi_pE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
