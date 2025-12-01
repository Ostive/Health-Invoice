// This file is deprecated - use @/lib/supabase/client or @/lib/supabase/server instead
// Keeping for backwards compatibility with existing components during migration

import { createClient } from '@supabase/supabase-js';

// Load from environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wmlxlxlloziooyaxigmo.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndtbHhseGxsb3ppb295YXhpZ21vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NzE2NTAsImV4cCI6MjA3OTI0NzY1MH0.aASi1bHRkERPTEMrufHnDnqH5TKUJnrc1ufzlAMhlEk';

// Validate credentials
if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase credentials missing!');
  throw new Error('Supabase configuration error');
}



export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    flowType: 'pkce', // Use PKCE flow for better security
    debug: true // Enable debug logs
  },
  global: {
    headers: {
      'x-application-name': 'health-invoice-app'
    }
  }
});
