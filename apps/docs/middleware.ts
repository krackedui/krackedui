// Routing for the hosted docs:
//   <system>.krackedui.com/<slug>        → /<system>/<slug>          (docs pages)
//   <system>.krackedui.com/<template>/   → /<system>/<template>/index.html (static template build)
// `<system>.localhost:3002` behaves the same locally. Plain localhost keeps /<system>/... paths.
import { NextResponse, type NextRequest } from 'next/server';
import { homeSlugs, rootDomain, systemTemplates } from './systems-meta';

function systemFromHost(host: string): string | null {
  const name = host.split(':')[0].toLowerCase();
  for (const suffix of [`.${rootDomain}`, '.localhost']) {
    if (name.endsWith(suffix)) {
      const sub = name.slice(0, -suffix.length);
      return sub in homeSlugs ? sub : null;
    }
  }
  return null;
}

export function middleware(req: NextRequest) {
  const url = req.nextUrl.clone();
  const system = systemFromHost(req.headers.get('host') ?? '');
  let path = url.pathname;

  if (system) {
    // Canonical URLs on a subdomain have no /<system> prefix.
    if (path === `/${system}` || path.startsWith(`/${system}/`)) {
      url.pathname = path.slice(system.length + 1) || '/';
      return NextResponse.redirect(url, 308);
    }
    path = `/${system}${path === '/' ? '' : path}`;
  }

  // Templates: /<system>/<template> → trailing slash (relative asset URLs), then its index.html.
  const [, sys, template, ...rest] = path.split('/');
  if (sys && template && systemTemplates[sys]?.includes(template)) {
    if (rest.length === 0) {
      return NextResponse.redirect(new URL(`${url.pathname}/${url.search}`, req.url), 308);
    }
    if (rest.length === 1 && rest[0] === '') {
      url.pathname = `/${sys}/${template}/index.html`;
      return NextResponse.rewrite(url);
    }
  }

  if (system) {
    url.pathname = path;
    return NextResponse.rewrite(url);
  }
  return NextResponse.next();
}

export const config = {
  // Skip Next internals and root-level static files; template assets live under /<system>/<template>/.
  matcher: ['/((?!_next/|r/|icon.svg|favicon.ico|robots.txt).*)'],
};
