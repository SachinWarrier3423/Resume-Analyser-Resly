import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Server-side Supabase client (uses service role for admin operations)
// For client-side, create a separate client with anon key
export function createServerClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    // In production, throw error. In development, provide helpful message.
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set."
      );
    } else {
      console.warn(
        "Supabase environment variables not set. Some features may not work."
      );
      // Return a mock client to prevent crashes in development
      return createClient<Database>(
        supabaseUrl || "https://placeholder.supabase.co",
        supabaseServiceKey || "placeholder-key",
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );
    }
  }

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Client-side Supabase client (uses anon key)
export function createClientClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing Supabase environment variables. Ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set."
    );
  }

  return createClient<Database>(supabaseUrl, supabaseAnonKey);
}

