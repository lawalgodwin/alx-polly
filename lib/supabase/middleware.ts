import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

/**
 * Updates the session based on the incoming request. If the user is not authenticated and the request is not to the login page,
 * it will redirect the user to the login page. This function is used in the middleware to ensure that the user is authenticated
 * before allowing access to certain pages. It also handles setting the user session using cookies.
 *
 * @param {NextRequest} request - The incoming request.
 * @return {Promise<NextResponse>} The response after updating the session.
 *
 * @throws {Error} If the user is not authenticated and the request is not to the login page.
 *
 * @assumption This function relies on the assumption that the user is authenticated when accessing protected pages.
 * This is enforced by the middleware and the client-side authentication checks.
 *
 * @edgeCase If the user has cookies disabled, the function will not be able to set the user session. This is a common
 * issue and can lead to unexpected behavior, especially when the user tries to access protected pages.
 *
 * @connection This function is used in the middleware to ensure that the user is authenticated before allowing access to
 * certain pages. It also handles setting the user session using cookies, which is used by the client to persist the user's
 * session across page reloads.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (
    !user &&
    !request.nextUrl.pathname.startsWith('/login') &&
    !request.nextUrl.pathname.startsWith('/auth')
  ) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}