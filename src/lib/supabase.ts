import { createClient } from '@supabase/supabase-js';
import type { Database } from '../types/supabase';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase credentials. Make sure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set.'
  );
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

/** 🔐 Auth helpers */
export async function signIn(email: string, password: string) {
  return await supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return await supabase.auth.signOut();
}

/** 👤 Profile CRUD */
export async function getProfile(userId: string) {
  console.log('🚀 getProfile starting for:', userId);

  const { data, error } = await supabase
    .from('profiles')
    .select('id, full_name, role, phone, email, skills, calendar_id, created_at, updated_at')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('❌ getProfile error:', error);
    throw error;
  }

  return data;
}

export async function updateProfile(
  userId: string,
  updates: Partial<Database['public']['Tables']['profiles']['Update']>
) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  return { data, error };
}

/** 🧾 Jobs */
export async function getJobs(filters: Record<string, any> = {}) {
  // Your existing job filtering logic here
}

/** 🔍 Fetch a single job by its human-readable code */
export async function getJobByCode(jobCode: string) {
  return supabase
    .from('jobs')
    .select(
      `
      *,
      client:clients(*),
      invoices(*),
      receipts(*)
    `
    )
    .eq('job_code', jobCode)
    .maybeSingle();
}
