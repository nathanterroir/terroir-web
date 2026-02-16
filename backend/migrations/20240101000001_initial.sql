CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(300) UNIQUE NOT NULL,
    title VARCHAR(500) NOT NULL,
    subtitle VARCHAR(500),
    category VARCHAR(100) NOT NULL DEFAULT 'general',
    hero_image_url TEXT,
    content_html TEXT NOT NULL DEFAULT '',
    excerpt TEXT NOT NULL DEFAULT '',
    author_name VARCHAR(200) NOT NULL DEFAULT 'Terroir AI Team',
    read_time_minutes INTEGER NOT NULL DEFAULT 5,
    published BOOLEAN NOT NULL DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published, published_at DESC);

CREATE TABLE IF NOT EXISTS contact_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(200) NOT NULL,
    email VARCHAR(300) NOT NULL,
    company VARCHAR(200),
    phone VARCHAR(50),
    acreage VARCHAR(100),
    crop_type VARCHAR(100),
    message TEXT NOT NULL,
    source VARCHAR(100) NOT NULL DEFAULT 'website',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_contact_email ON contact_submissions(email);

CREATE TABLE IF NOT EXISTS waitlist_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(300) NOT NULL,
    name VARCHAR(200),
    company VARCHAR(200),
    interest VARCHAR(100) NOT NULL DEFAULT 'general',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE(email, interest)
);

CREATE INDEX idx_waitlist_email ON waitlist_entries(email);

-- Seed blog post
INSERT INTO blog_posts (slug, title, subtitle, category, hero_image_url, content_html, excerpt, author_name, read_time_minutes, published, published_at)
VALUES (
    'profitability-in-the-margins',
    'Profitability in the Margins: Overcoming Labor & Regulatory Pressure with Field Intelligence',
    'How real-time field data helps specialty crop farmers fight rising costs',
    'Industry Insights',
    'https://images.unsplash.com/photo-1533038590840-1cde6e668a91?q=80&w=2000&auto=format&fit=crop',
    '<p>The specialty crop industry is facing a perfect storm. Skyrocketing input costs, increasing climate volatility, and tightening regulations are eroding the thin margins farmers rely on.</p>',
    'The specialty crop industry is facing a perfect storm. Skyrocketing input costs, increasing climate volatility, and tightening regulations are eroding the thin margins farmers rely on.',
    'Terroir AI Team',
    6,
    true,
    '2025-10-12T00:00:00Z'
)
ON CONFLICT (slug) DO NOTHING;
