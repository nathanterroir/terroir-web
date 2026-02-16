import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Prerender static pages at build time (SSG) — best for SEO
  { path: '', renderMode: RenderMode.Prerender },
  { path: 'contact', renderMode: RenderMode.Prerender },
  { path: 'blog', renderMode: RenderMode.Prerender },

  // Blog posts rendered on server per-request (SSR) for dynamic content
  { path: 'blog/:slug', renderMode: RenderMode.Server },

  // Catch-all: client-side render
  { path: '**', renderMode: RenderMode.Client },
];
