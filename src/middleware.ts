import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

// RBAC configuration
const roleAccess: Record<string, string[]> = {
  admin: ['/dashboard', '/project', '/user', '/project/detail', '/request', '/sla'],
  user: ['/dashboard', '/my-project', '/project/detail'],
  'admin employee': ['/dashboard', '/employee', '/team', '/applicant', '/selection', '/onboarding',],
  'user employee': ['/dashboard', '/task-list', '/team'],
};

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname;

  if (pathname.startsWith('/api')) {
    return NextResponse.next();
  }
  
  // List of public routes that don't require authentication
  const publicRoutes = ['/login', '/register', '/forgot-password', '/api/auth'];
  
  // Check if route is public
  if (publicRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Get token from request
  const token = await getToken({ 
    req, 
    secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET 
  });

  // Redirect to login if no token
  if (!token) {
    return redirectToLogin(req);
  }

  // Get user role from token
  const userRole = token.role as string;
  const allowedPaths = roleAccess[userRole];

  // If role not found in roleAccess, redirect to login
  if (!allowedPaths) {
    return redirectToLogin(req);
  }

  // Check if user has access to the requested path
  const hasAccess = allowedPaths.some(path => {
    // Exact match
    if (path === pathname) return true;
    // Check if path starts with allowed path (for nested routes)
    if (pathname.startsWith(path + '/') || pathname === path) return true;
    return false;
  });

  // If no access, redirect to dashboard
  if (!hasAccess) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

function redirectToLogin(req: NextRequest) {
  const response = NextResponse.redirect(new URL('/login', req.url));
  // Clear auth cookies
  response.cookies.delete('next-auth.session-token');
  response.cookies.delete('__Secure-next-auth.session-token');
  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|public|assets|uploads).*)',
  ],
};
