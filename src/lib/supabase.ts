import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/**
 * In the actual app, Supabase env vars must be set.
 * In tools like Storybook/tests, we prefer to fail only if Supabase is *used*,
 * so the UI can render with mocked providers.
 */
export const supabase = (() => {
  if (supabaseUrl && supabaseAnonKey) {
    return createClient(supabaseUrl, supabaseAnonKey)
  }

  const message =
    'Missing Supabase environment variables. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'

  // Throw lazily if any code attempts to use Supabase.
  return new Proxy(
    {},
    {
      get() {
        throw new Error(message)
      },
    }
  ) as ReturnType<typeof createClient>
})()

