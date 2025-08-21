import { NextResponse } from 'next/server';

/**
 * Next.js Middleware for Route Protection
 * 
 * This middleware runs on every request and handles:
 * - Route protection for dashboard pages
 * - Automatic redirects based on user role
 * - Session validation
 * - Auth token checking
 */

// Protected routes configuration
const PROTECTED_ROUTES = {
  '/pages/dashboard/admin': ['admin'],
  '/pages/dashboard/hoster': ['hoster'],
  '/pages/cars': ['customer']
};

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/about',
  '/contact'
];

// Admin-only routes
const ADMIN_ROUTES = ['/pages/dashboard/admin'];

// Hoster-only routes  
const HOSTER_ROUTES = ['/pages/dashboard/hoster'];

// Customer-only routes
const CUSTOMER_ROUTES = ['/pages/cars'];

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const url = request.nextUrl.clone();

  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon.ico')
  ) {
    return NextResponse.next();
  }

  // Get auth data from cookies/headers
  const isLoggedIn = request.cookies.get('isLoggedIn')?.value || 
                    request.headers.get('x-auth-status');
  const userRole = request.cookies.get('userRole')?.value || 
                  request.headers.get('x-user-role');

  console.log(`🛡️  Middleware: ${pathname} | Logged In: ${isLoggedIn} | Role: ${userRole}`);

  // Check if route is public
  if (PUBLIC_ROUTES.includes(pathname)) {
    // If logged in user tries to access login page, redirect to their dashboard
    if (isLoggedIn && userRole && pathname === '/') {
      return redirectToDashboard(url, userRole);
    }
    return NextResponse.next();
  }

  // Check if user is authenticated
  if (!isLoggedIn || !userRole) {
    console.log('🚫 Unauthenticated access attempt, redirecting to login');
    url.pathname = '/';
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Check role-based access
  const hasAccess = checkRoleAccess(pathname, userRole);
  
  if (!hasAccess) {
    console.log(`🚫 Unauthorized access: ${userRole} trying to access ${pathname}`);
    // Redirect to appropriate dashboard
    return redirectToDashboard(url, userRole);
  }

  // User is authenticated and authorized
  console.log('✅ Access granted');
  
  // Set auth headers for the request
  const response = NextResponse.next();
  response.headers.set('x-auth-status', 'authenticated');
  response.headers.set('x-user-role', userRole);
  
  return response;
}

/**
 * Check if user role has access to the requested path
 */
function checkRoleAccess(pathname, userRole) {
  // Check protected routes configuration
  for (const [route, allowedRoles] of Object.entries(PROTECTED_ROUTES)) {
    if (pathname.startsWith(route)) {
      return allowedRoles.includes(userRole);
    }
  }

  // Additional specific checks
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    return userRole === 'admin';
  }
  
  if (HOSTER_ROUTES.some(route => pathname.startsWith(route))) {
    return userRole === 'hoster';
  }
  
  if (CUSTOMER_ROUTES.some(route => pathname.startsWith(route))) {
    return userRole === 'customer';
  }

  // Default: allow access if no specific rules found
  return true;
}

/**
 * Redirect user to their appropriate dashboard
 */
function redirectToDashboard(url, userRole) {
  const dashboardRoutes = {
    admin: '/pages/dashboard/admin',
    hoster: '/pages/dashboard/hoster', 
    customer: '/pages/cars'
  };

  const dashboardPath = dashboardRoutes[userRole];
  if (dashboardPath) {
    url.pathname = dashboardPath;
    url.search = ''; // Clear any search params
    console.log(`🔄 Redirecting ${userRole} to ${dashboardPath}`);
    return NextResponse.redirect(url);
  }

  // Fallback to home if role is invalid
  url.pathname = '/';
  return NextResponse.redirect(url);
}

// Configure which paths this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
