import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
/**
 * Creates a Supabase client for server-side rendering (SSR) with access to
 * cookies. This is necessary because Supabase's `createServerClient` function
 * expects a `cookies` object with `getAll` and `setAll` methods.
 *
 * The `cookies` object is used to manage user sessions. It allows us to store
 * and retrieve user authentication information, such as the user's ID and access
 * token.
 *
 * This function assumes that the `cookies` object returned by `next/headers`
 * can be used to get and set cookies.
 *
 * If the `cookies` object is not available, this function will throw an error.
 * This can happen if the function is called from a client-side component, which
 * doesn't have access to the `cookies` object.
 *
 * If the `cookies` object is available, but the `setAll` method throws an error,
 * this likely means that the function is being called from a Server Component,
 * which doesn't have access to the `cookies` object. This can be ignored if you
 * have middleware refreshing user sessions.
 *
 * This function is used in server components to create a Supabase client with the
 * necessary cookies for authentication. It is used in `lib/supabase/middleware.ts`
 * to create a Supabase client with the necessary cookies for authentication in
 * server-side rendering.
 *
 * @returns {Promise<SupabaseClient>} A Supabase client with access to cookies.
 * @throws {Error} If the `cookies` object is not available or if the `setAll`
 *                 method throws an error.
 */
export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    }
  )
}