// Password-protects the whole site at the edge.
// Set SITE_USER and SITE_PASSWORD in Vercel → Project → Settings → Environment Variables.
// Nothing is served until Basic Auth passes, so the page source never reaches an unauthorised visitor.

export const config = {
  // Protect everything except Vercel's internals and the favicon.
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};

export default function middleware(request) {
  const USER = process.env.SITE_USER || 'keerthi';
  const PASS = process.env.SITE_PASSWORD;

  // If no password is configured, fail closed rather than silently exposing the site.
  if (!PASS) {
    return new Response('Site protection is not configured.', {
      status: 503,
      headers: { 'content-type': 'text/plain' },
    });
  }

  const header = request.headers.get('authorization') || '';

  if (header.startsWith('Basic ')) {
    let decoded = '';
    try {
      decoded = atob(header.slice(6));
    } catch (e) {
      decoded = '';
    }
    const i = decoded.indexOf(':');
    const user = i === -1 ? '' : decoded.slice(0, i);
    const pass = i === -1 ? '' : decoded.slice(i + 1);
    if (user === USER && pass === PASS) {
      return; // authorised — serve the request normally
    }
  }

  return new Response('Authentication required.', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Portfolio", charset="UTF-8"',
      'content-type': 'text/plain',
    },
  });
}
