import { createBrowserClient } from '@supabase/ssr';

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase credentials. Check .env.local file.'
    );
  }

  if (!supabaseUrl.startsWith('http')) {
    throw new Error('supabase url must start with https://');
  }

  client = createBrowserClient(supabaseUrl, supabaseAnonKey);
  return client;
}
