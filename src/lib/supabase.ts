// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔧 [supabase.ts] Début initialisation');
console.log('🔧 [supabase.ts] URL:', supabaseUrl);
console.log('🔧 [supabase.ts] Key exists:', !!supabaseAnonKey);

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ [supabase.ts] Variables manquantes');
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('✅ [supabase.ts] Supabase initialisé:', {
  hasFrom: typeof supabase.from === 'function',
  hasSelect: typeof supabase.from('test').select === 'function'
});