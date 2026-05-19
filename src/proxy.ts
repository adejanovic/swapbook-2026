import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const APP_PREFIXES = ['/dashboard', '/album', '/duplicates', '/community', '/profile'];
const AUTH_PATHS = ['/welcome', '/login', '/register'];

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session tokens — must not be removed.
  const { data: { user } } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;
  const isAppRoute = APP_PREFIXES.some(p => pathname === p || pathname.startsWith(p + '/'));
  const isAuthPath = AUTH_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));

  if (isAppRoute && !user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (isAuthPath && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|icons|api/).*)'],
};
