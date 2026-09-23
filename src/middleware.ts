import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Create a response we can modify (for cookie handling)
  let response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value);
            response.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  const role = user?.user_metadata?.role || 'tenant';

  // Public routes — redirect to dashboard if already logged in
  const isPublicRoute = pathname === '/login' || pathname.startsWith('/activate');
  if (isPublicRoute) {
    if (user) {
      const dest = role === 'admin' ? '/admin' : '/portal';
      return NextResponse.redirect(new URL(dest, request.url));
    }
    return response;
  }

  // Protected routes — redirect to login if not authenticated
  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Admin routes — only for admin role
  if (pathname.startsWith('/admin')) {
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/portal', request.url));
    }
  }

  // Portal routes — only for tenant role
  if (pathname.startsWith('/portal')) {
    if (role !== 'tenant') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    // Match all routes except API, static files, and images
    '/((?!api|_next/static|_next/image|images|favicon.ico).*)',
  ],
};
