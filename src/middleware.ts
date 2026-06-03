import { NextRequest, NextResponse } from 'next/server';

// Migração zap.cmove.ai -> app.eixxohub.com (web). 301 permanente.
// /api, /webhooks, /socket.io são roteados pro backend pelo tunnel e não passam aqui.
export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  if (host === 'zap.cmove.ai') {
    const url = new URL(
      req.nextUrl.pathname + req.nextUrl.search,
      'https://app.eixxohub.com',
    );
    return NextResponse.redirect(url, 301);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
