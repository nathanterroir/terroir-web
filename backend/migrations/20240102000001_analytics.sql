-- ═══════════════════════════════════════════════════════════════
-- Analytics Schema — AARRR Pirate Metrics for Lean Startup
--
-- Acquisition  → page_views, utm tracking
-- Activation   → funnel_events (aha_moment, first_scan, signup)
-- Retention    → sessions (returning visitor tracking)
-- Referral     → funnel_events (share, invite)
-- Revenue      → funnel_events (trial_start, subscription)
-- ═══════════════════════════════════════════════════════════════

-- ── Page Views (Acquisition) ────────────────────────────────

CREATE TABLE IF NOT EXISTS analytics_page_views (
    id              BIGSERIAL PRIMARY KEY,
    session_id      VARCHAR(64) NOT NULL,
    visitor_id      VARCHAR(64) NOT NULL,  -- persistent anonymous ID
    path            VARCHAR(500) NOT NULL,
    referrer        TEXT,
    utm_source      VARCHAR(200),
    utm_medium      VARCHAR(200),
    utm_campaign    VARCHAR(200),
    utm_term        VARCHAR(200),
    utm_content     VARCHAR(200),
    user_agent      TEXT,
    screen_width    INTEGER,
    country         VARCHAR(10),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pv_created_at ON analytics_page_views(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pv_session ON analytics_page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_pv_visitor ON analytics_page_views(visitor_id);
CREATE INDEX IF NOT EXISTS idx_pv_path ON analytics_page_views(path);
CREATE INDEX IF NOT EXISTS idx_pv_utm_source ON analytics_page_views(utm_source) WHERE utm_source IS NOT NULL;

-- ── Funnel Events (Activation / Retention / Referral / Revenue) ──

CREATE TABLE IF NOT EXISTS analytics_events (
    id              BIGSERIAL PRIMARY KEY,
    session_id      VARCHAR(64) NOT NULL,
    visitor_id      VARCHAR(64) NOT NULL,
    event_name      VARCHAR(200) NOT NULL,   -- e.g. 'cta_click', 'contact_submit', 'waitlist_join', 'download_click'
    event_category  VARCHAR(100) NOT NULL DEFAULT 'interaction', -- acquisition, activation, retention, referral, revenue
    event_label     VARCHAR(500),            -- e.g. 'hero_cta', 'blog_cta'
    event_value     DOUBLE PRECISION,        -- optional numeric value
    properties      JSONB DEFAULT '{}',      -- flexible key-value pairs
    path            VARCHAR(500),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_created_at ON analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_events_category ON analytics_events(event_category);
CREATE INDEX IF NOT EXISTS idx_events_visitor ON analytics_events(visitor_id);
CREATE INDEX IF NOT EXISTS idx_events_session ON analytics_events(session_id);

-- ── Experiments (Lean Startup hypothesis tracking) ──────────

CREATE TABLE IF NOT EXISTS experiments (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            VARCHAR(300) NOT NULL,     -- e.g. "H1: Directed scouting reduces labor costs"
    hypothesis      TEXT NOT NULL,             -- "We believe that [target audience] will [expected behavior] because [reason]"
    metric_name     VARCHAR(200) NOT NULL,     -- the OMTM for this experiment
    baseline_value  DOUBLE PRECISION,          -- measured before experiment
    target_value    DOUBLE PRECISION,          -- what success looks like
    current_value   DOUBLE PRECISION,          -- latest measurement
    status          VARCHAR(50) NOT NULL DEFAULT 'active', -- active, validated, invalidated, paused
    started_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    ended_at        TIMESTAMPTZ,
    notes           TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Views for Grafana Dashboards ────────────────────────────

-- Daily traffic summary
CREATE OR REPLACE VIEW v_daily_traffic AS
SELECT
    DATE(created_at) AS day,
    COUNT(*) AS page_views,
    COUNT(DISTINCT visitor_id) AS unique_visitors,
    COUNT(DISTINCT session_id) AS sessions
FROM analytics_page_views
GROUP BY DATE(created_at)
ORDER BY day DESC;

-- Traffic by source
CREATE OR REPLACE VIEW v_traffic_by_source AS
SELECT
    COALESCE(utm_source, 'direct') AS source,
    COALESCE(utm_medium, 'none') AS medium,
    DATE(created_at) AS day,
    COUNT(*) AS page_views,
    COUNT(DISTINCT visitor_id) AS unique_visitors
FROM analytics_page_views
GROUP BY COALESCE(utm_source, 'direct'), COALESCE(utm_medium, 'none'), DATE(created_at)
ORDER BY day DESC, page_views DESC;

-- Top pages
CREATE OR REPLACE VIEW v_top_pages AS
SELECT
    path,
    DATE(created_at) AS day,
    COUNT(*) AS views,
    COUNT(DISTINCT visitor_id) AS unique_visitors
FROM analytics_page_views
GROUP BY path, DATE(created_at)
ORDER BY day DESC, views DESC;

-- Funnel conversion rates (daily)
CREATE OR REPLACE VIEW v_daily_funnel AS
SELECT
    DATE(pv.day) AS day,
    pv.unique_visitors AS visitors,
    COALESCE(cta.clicks, 0) AS cta_clicks,
    COALESCE(contacts.submissions, 0) AS contact_submissions,
    COALESCE(waitlist.joins, 0) AS waitlist_joins,
    CASE WHEN pv.unique_visitors > 0
         THEN ROUND(COALESCE(cta.clicks, 0)::numeric / pv.unique_visitors * 100, 2)
         ELSE 0 END AS cta_rate_pct,
    CASE WHEN pv.unique_visitors > 0
         THEN ROUND(COALESCE(contacts.submissions, 0)::numeric / pv.unique_visitors * 100, 2)
         ELSE 0 END AS contact_rate_pct
FROM v_daily_traffic pv
LEFT JOIN (
    SELECT DATE(created_at) AS day, COUNT(DISTINCT visitor_id) AS clicks
    FROM analytics_events WHERE event_name = 'cta_click'
    GROUP BY DATE(created_at)
) cta ON pv.day = cta.day
LEFT JOIN (
    SELECT DATE(created_at) AS day, COUNT(*) AS submissions
    FROM contact_submissions
    GROUP BY DATE(created_at)
) contacts ON pv.day = contacts.day
LEFT JOIN (
    SELECT DATE(created_at) AS day, COUNT(*) AS joins
    FROM waitlist_entries
    GROUP BY DATE(created_at)
) waitlist ON pv.day = waitlist.day;

-- Retention: returning visitors by week cohort
CREATE OR REPLACE VIEW v_weekly_retention AS
WITH first_visit AS (
    SELECT visitor_id, DATE_TRUNC('week', MIN(created_at)) AS cohort_week
    FROM analytics_page_views
    GROUP BY visitor_id
),
weekly_visits AS (
    SELECT
        pv.visitor_id,
        fv.cohort_week,
        DATE_TRUNC('week', pv.created_at) AS visit_week
    FROM analytics_page_views pv
    JOIN first_visit fv ON pv.visitor_id = fv.visitor_id
)
SELECT
    cohort_week,
    EXTRACT(WEEK FROM visit_week - cohort_week)::int AS weeks_since_first,
    COUNT(DISTINCT visitor_id) AS returning_visitors
FROM weekly_visits
GROUP BY cohort_week, EXTRACT(WEEK FROM visit_week - cohort_week)::int
ORDER BY cohort_week, weeks_since_first;
