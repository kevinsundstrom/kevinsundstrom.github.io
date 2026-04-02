import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Runs at the edge before the homepage renders.
// Computes a time-based greeting and sets it as a cookie
// so the homepage Server Component can read it at render time.
export function middleware(request: NextRequest) {
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 18 ? 'Good afternoon' :
    'Good evening';

  const response = NextResponse.next();
  response.cookies.set('ks_greeting', greeting, { path: '/' });
  return response;
}

export const config = {
  matcher: '/',
};
