import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://wqlisywtqrksovwfhgim.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxbGlzeXd0cXJrc292d2ZoZ2ltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE0NDU3NjcsImV4cCI6MjA4NzAyMTc2N30.ntp3UurYtVksaDQkHUi0VfoWLNvRGgYv7CbvnjHsRUQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
