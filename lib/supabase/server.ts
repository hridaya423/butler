import { createServerClient, type CookieOptions } from "@supabase/ssr";
import type { NextRequest, NextResponse } from "next/server";

type ServerCookie = {
  name: string;
  value: string;
  options: CookieOptions;
};

interface ServerClientResult {
  supabase: ReturnType<typeof createServerClient>;
  applyCookies: (response: NextResponse) => void;
}

export function createServerSupabaseClient(request: NextRequest): ServerClientResult {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing Supabase credentials. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  }

  const cookiesToSet = new Map<string, ServerCookie>();

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () =>
        request.cookies.getAll().map(({ name, value }) => ({
          name,
          value,
        })),
      setAll: (cookies) => {
        cookies.forEach((cookie) => {
          cookiesToSet.set(cookie.name, cookie);
        });
      },
    },
  });

  const applyCookies = (response: NextResponse) => {
    cookiesToSet.forEach(({ name, value, options }) => {
      response.cookies.set({
        name,
        value,
        ...options,
      });
    });
  };

  return {
    supabase,
    applyCookies,
  };
}
