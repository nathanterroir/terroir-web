# CLAUDE.md — Terroir AI Platform

## Project Overview
Terroir AI is an iPhone-based computer vision app for specialty crop farmers. This repo contains the marketing website and API platform.

## Architecture
- **Frontend**: Angular 21 (zoneless, signals-first, standalone components) in `frontend/`
- **Backend**: Rust 2024 Edition (1.93+), Axum 0.8, Tokio, SQLx in `backend/`
- **Database**: PostgreSQL 15 (Cloud SQL in prod, Docker locally)
- **Infrastructure**: OpenTofu → GCP Cloud Run in `infra/`

## Local Development

### Prerequisites
- Node.js 22+, npm
- Rust 1.93+ (`rustup default stable`)
- Docker (for Postgres)

### First-time setup
```bash
make setup
```

### Start dev servers
```bash
make dev
```
This starts:
- Postgres on port 5432 (Docker)
- Rust backend on port 8080 (with auto-migrations)
- Angular frontend on port 4200 (with proxy to backend)

The Angular dev server proxies `/api/*` → `localhost:8080/api/*`, so no CORS issues.

### Individual commands
```bash
make dev-db          # Just Postgres
make dev-backend     # Just the Rust API
make dev-frontend    # Just Angular
make stop            # Stop Docker containers
make clean           # Full reset
make test            # Run all tests
```

## Key Files

### Frontend (`frontend/`)
- `src/main.ts` — Bootstrap with zoneless change detection
- `src/app/app.routes.ts` — Lazy-loaded routes
- `src/app/components/` — Reusable UI components (all standalone)
- `src/app/pages/` — Route-level page components
- `src/app/services/api.service.ts` — HTTP service for backend API
- `src/environments/` — Environment configs (dev uses proxy, prod uses full URL)
- `proxy.conf.json` — Dev server proxy config
- `src/styles.scss` — Global styles, CSS variables, fonts

### Backend (`backend/`)
- `src/main.rs` — Axum server entry point
- `src/api/routes.rs` — API route definitions
- `src/api/handlers.rs` — Request handlers
- `src/services.rs` — Business logic / DB queries
- `src/models.rs` — Data models and request/response types
- `src/errors.rs` — Error types with Axum IntoResponse
- `src/config.rs` — Environment variable parsing
- `migrations/` — SQL migrations (auto-run on startup)
- `.env` — Local environment variables (copy from `.env.example`)

### Infrastructure (`infra/`)
- `main.tf` — All GCP resources (Cloud Run, Cloud SQL, Artifact Registry, etc.)
- `terraform.tfvars.example` — Template for prod variables

## API Endpoints
```
GET  /api/v1/health     — Health check
GET  /api/v1/blog       — List published blog posts (?limit=&offset=)
GET  /api/v1/blog/:slug — Get single blog post by slug
POST /api/v1/contact    — Submit contact form
POST /api/v1/waitlist   — Join waitlist
```

## Coding Conventions

### Rust (backend)
- Edition 2024, minimum Rust 1.93
- Use `thiserror` for error enums, `anyhow` for ad-hoc errors
- All handlers return `ApiResult<Json<T>>`
- Use `sqlx::query_as!` macro for type-safe queries
- Format with `rustfmt`, lint with `clippy`

### Angular (frontend)
- Angular 21 with zoneless change detection (no zone.js)
- All components are standalone (no NgModules)
- Use signals (`signal()`, `computed()`) for state, not BehaviorSubject
- Use `@if`, `@for`, `@switch` control flow (not *ngIf, *ngFor)
- Use `inject()` function, not constructor injection
- SCSS for styles, DM Sans (UI) + Lora (body/serif) fonts
- Brand color palette defined as CSS variables in `styles.scss`

### General
- No `console.log` in committed code
- Git commit messages: conventional commits (feat:, fix:, chore:, etc.)

## Deployment
```bash
make deploy
# or
./scripts/deploy.sh prod
```

## Testing
```bash
# Backend
cd backend && cargo test

# Frontend
cd frontend && npx ng test
```

## SEO Architecture

This site is optimized for 2026 search engine ranking factors:

### Rendering Strategy (SSG + SSR hybrid)
- `app.routes.server.ts` defines render mode per route
- **SSG (Prerendered at build)**: `/`, `/blog`, `/contact` — static HTML served instantly
- **SSR (Server-rendered per request)**: `/blog/:slug` — dynamic content with full meta tags
- `provideClientHydration()` enables Angular hydration (no content flicker, no CLS)
- `withHttpTransferCacheOptions()` caches API responses from SSR into client

### Meta Tags & Open Graph
- `SeoService` (`services/seo.service.ts`) manages all meta dynamically per route
- Every page calls `seo.updateSeo()` in `ngOnInit` with title, description, OG image, canonical URL
- Twitter Card (`summary_large_image`) auto-set for all pages
- Article-specific OG tags (`article:published_time`, `article:author`) on blog posts

### Structured Data (JSON-LD)
- **Organization + SoftwareApplication + WebSite** schema on homepage
- **FAQPage** schema on homepage (targets common search queries)
- **Article** schema on every blog post (headline, author, dates, image)
- **BreadcrumbList** schema on blog posts for search result breadcrumbs

### Core Web Vitals Optimization
- **LCP**: Hero image has `fetchpriority="high"` + `<link rel="preload">` in `<head>`
- **CLS**: All images have explicit `width` and `height` attributes
- **INP**: Zoneless change detection (no Zone.js patching = faster event handling)
- Fonts loaded with `display=swap` to prevent FOIT
- Static assets cached 1 year with `immutable` header

### Crawlability
- `robots.txt` at root (allows all, blocks `/api/`)
- `sitemap.xml` static at root (updated at build)
- Dynamic sitemap at `/api/v1/sitemap.xml` (includes all published blog posts)
- Canonical URLs set per page via `<link rel="canonical">`
- Semantic HTML: `<main>`, `<article>`, `<section>`, `<nav>`, `<header>`, `<footer>`, `<time>`, `<address>`
- `<noscript>` fallback content for non-JS crawlers

### Accessibility (also helps SEO)
- `aria-label` on navigation, sections, mobile toggle
- `aria-live="polite"` on loading states
- `aria-expanded` on mobile menu toggle
- All images have descriptive `alt` text
- Semantic heading hierarchy (h1 → h2 → h3)

### Adding SEO to a new page
1. Inject `SeoService` in the component
2. Call `this.seo.updateSeo({...})` in `ngOnInit` with title, description, url
3. Add JSON-LD if appropriate (article, FAQ, etc.)
4. Add route to `sitemap.xml`
5. If SSG: add to `app.routes.server.ts` with `RenderMode.Prerender`

## Common Tasks

### Add a new API endpoint
1. Add route in `backend/src/api/routes.rs`
2. Add handler in `backend/src/api/handlers.rs`
3. Add service function in `backend/src/services.rs`
4. Add model if needed in `backend/src/models.rs`

### Add a new page
1. Create component in `frontend/src/app/pages/my-page/my-page.component.ts`
2. Add lazy-loaded route in `frontend/src/app/app.routes.ts`
3. Add nav link in `frontend/src/app/components/navbar/navbar.component.ts`

### Add a new DB migration
1. Create file: `backend/migrations/YYYYMMDDHHMMSS_description.sql`
2. Migrations auto-run when the backend starts

### Modify infrastructure
1. Edit `infra/main.tf`
2. Run `cd infra && tofu plan` to preview
3. Run `cd infra && tofu apply` to deploy

## Monitoring & Analytics (AARRR Pirate Metrics)

### Architecture
- **Frontend**: `AnalyticsService` tracks page views and events automatically
- **Backend**: `/api/v1/analytics/pageview` and `/api/v1/analytics/event` endpoints
- **Database**: `analytics_page_views`, `analytics_events`, `experiments` tables
- **Dashboards**: Self-hosted Grafana on Cloud Run, pre-provisioned with AARRR dashboard

### Access Grafana
- **Local**: http://localhost:3000 (admin/admin) — starts with `make dev`
- **Production**: Output from `tofu output grafana_url`

### AARRR Metrics Mapped

| Stage       | What We Track                              | DB Table/View        |
|-------------|-------------------------------------------|----------------------|
| Acquisition | Page views, UTM params, referrers          | analytics_page_views |
| Activation  | CTA clicks, contact form, waitlist joins   | analytics_events     |
| Retention   | Returning visitors, weekly cohort retention | v_weekly_retention   |
| Referral    | Share clicks                               | analytics_events     |
| Revenue     | Download clicks, trial starts              | analytics_events     |

### Track a new event from frontend
```typescript
// In any component:
private readonly analytics = inject(AnalyticsService);

// Track with AARRR category
this.analytics.trackEvent('feature_used', 'activation', 'lidar_demo');
this.analytics.trackCtaClick('hero_button');
this.analytics.trackShare('twitter');
```

### Lean Startup Experiments
The `experiments` table tracks hypotheses with baseline/target/current values.
- API: `GET/POST /api/v1/experiments`
- Visible in Grafana under "🧪 EXPERIMENTS" row
- Status: active → validated / invalidated

### Add a new Grafana dashboard
1. Create JSON in `grafana/dashboards/`
2. It auto-provisions on container restart
3. Or create in Grafana UI and export as JSON

### Dashboard SQL Views
Pre-built Postgres views for Grafana (no joins needed):
- `v_daily_traffic` — daily visitors, sessions, page views
- `v_traffic_by_source` — UTM source breakdown
- `v_top_pages` — page popularity
- `v_daily_funnel` — visitors → CTA → contacts → waitlist
- `v_weekly_retention` — cohort retention matrix

## Cost Management

**Target: $9-15/month** — see `docs/COST_AUDIT.md` for full breakdown.

### Where the money goes
- **Cloud SQL db-f1-micro**: ~$8.82/mo (only fixed cost — always-on Postgres)
- **Everything else**: Free tier (Cloud Run, Artifact Registry, Secret Manager)

### Key cost rules
- All Cloud Run services scale to zero (`min_instance_count = 0`)
- `cpu_idle = true` on all services — CPU only billed during request processing
- Cloud SQL has no public IP — saves ~$3.60/mo
- HDD storage, not SSD — saves ~$0.80/mo at no perceptible perf cost
- Artifact Registry auto-cleans old images (7-day retention on untagged)
- Budget alert at $20/mo with thresholds at 50%, 80%, 100%, 150%

### Monitor costs
1. GCP Console → Billing → Reports (filter by project)
2. Budget alerts auto-email at $10, $16, $20, $30
3. `tofu output estimated_monthly_cost` shows expected range

### If costs increase unexpectedly
1. Check Cloud Run metrics — is something staying warm instead of scaling to zero?
2. Check Cloud SQL storage — is `disk_autoresize` accidentally enabled?
3. Check Artifact Registry — are old images piling up?
4. Check for accidental VPC connectors or Compute Engine instances
