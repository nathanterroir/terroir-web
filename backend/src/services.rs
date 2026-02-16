use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::{ApiError, ApiResult};
use crate::models::*;

pub async fn list_blog_posts(pool: &PgPool, limit: i64, offset: i64) -> ApiResult<Vec<BlogPostSummary>> {
    let posts = sqlx::query_as!(
        BlogPostSummary,
        r#"
        SELECT id, slug, title, subtitle, category, hero_image_url,
               excerpt, author_name, read_time_minutes, published_at
        FROM blog_posts
        WHERE published = true
        ORDER BY published_at DESC
        LIMIT $1 OFFSET $2
        "#,
        limit,
        offset
    )
    .fetch_all(pool)
    .await?;

    Ok(posts)
}

pub async fn get_blog_post_by_slug(pool: &PgPool, slug: &str) -> ApiResult<BlogPost> {
    sqlx::query_as!(
        BlogPost,
        r#"SELECT * FROM blog_posts WHERE slug = $1 AND published = true"#,
        slug
    )
    .fetch_optional(pool)
    .await?
    .ok_or_else(|| ApiError::NotFound(format!("Post '{slug}' not found")))
}

pub async fn create_contact(pool: &PgPool, req: &ContactRequest) -> ApiResult<ContactSubmission> {
    let submission = sqlx::query_as!(
        ContactSubmission,
        r#"
        INSERT INTO contact_submissions (id, name, email, company, phone, acreage, crop_type, message, source)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
        "#,
        Uuid::new_v4(),
        req.name,
        req.email,
        req.company,
        req.phone,
        req.acreage,
        req.crop_type,
        req.message,
        req.source.clone().unwrap_or_else(|| "website".to_string()),
    )
    .fetch_one(pool)
    .await?;

    Ok(submission)
}

pub async fn create_waitlist_entry(pool: &PgPool, req: &WaitlistRequest) -> ApiResult<WaitlistEntry> {
    let entry = sqlx::query_as!(
        WaitlistEntry,
        r#"
        INSERT INTO waitlist_entries (id, email, name, company, interest)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (email, interest) DO UPDATE SET name = EXCLUDED.name, company = EXCLUDED.company
        RETURNING *
        "#,
        Uuid::new_v4(),
        req.email,
        req.name,
        req.company,
        req.interest.clone().unwrap_or_else(|| "general".to_string()),
    )
    .fetch_one(pool)
    .await?;

    Ok(entry)
}

// ── Analytics ────────────────────────────────

pub async fn record_page_view(pool: &PgPool, req: &PageViewRequest) -> ApiResult<()> {
    sqlx::query!(
        r#"
        INSERT INTO analytics_page_views
            (session_id, visitor_id, path, referrer, utm_source, utm_medium, utm_campaign, utm_term, utm_content, screen_width)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        "#,
        req.session_id,
        req.visitor_id,
        req.path,
        req.referrer,
        req.utm_source,
        req.utm_medium,
        req.utm_campaign,
        req.utm_term,
        req.utm_content,
        req.screen_width,
    )
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn record_event(pool: &PgPool, req: &TrackEventRequest) -> ApiResult<()> {
    sqlx::query!(
        r#"
        INSERT INTO analytics_events
            (session_id, visitor_id, event_name, event_category, event_label, event_value, properties, path)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        "#,
        req.session_id,
        req.visitor_id,
        req.event_name,
        req.event_category.clone().unwrap_or_else(|| "interaction".to_string()),
        req.event_label,
        req.event_value,
        req.properties.clone().unwrap_or(serde_json::json!({})),
        req.path,
    )
    .execute(pool)
    .await?;
    Ok(())
}

pub async fn list_experiments(pool: &PgPool) -> ApiResult<Vec<Experiment>> {
    let exps = sqlx::query_as!(Experiment, "SELECT * FROM experiments ORDER BY created_at DESC")
        .fetch_all(pool)
        .await?;
    Ok(exps)
}

pub async fn create_experiment(pool: &PgPool, req: &ExperimentRequest) -> ApiResult<Experiment> {
    let exp = sqlx::query_as!(
        Experiment,
        r#"
        INSERT INTO experiments (id, name, hypothesis, metric_name, baseline_value, target_value)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING *
        "#,
        Uuid::new_v4(),
        req.name,
        req.hypothesis,
        req.metric_name,
        req.baseline_value,
        req.target_value,
    )
    .fetch_one(pool)
    .await?;
    Ok(exp)
}
