use axum::extract::{Path, Query, State};
use axum::http::HeaderMap;
use axum::Json;
use serde::Deserialize;
use validator::Validate;

use crate::errors::{ApiError, ApiResult};
use crate::models::*;
use crate::services;
use crate::AppState;

// ── Health ────────────────────────────────────

pub async fn health_check(State(state): State<AppState>) -> ApiResult<Json<HealthResponse>> {
    let db_status = match sqlx::query("SELECT 1").execute(&state.db).await {
        Ok(_) => "connected".to_string(),
        Err(e) => format!("error: {e}"),
    };

    Ok(Json(HealthResponse {
        status: "ok".to_string(),
        version: env!("CARGO_PKG_VERSION").to_string(),
        database: db_status,
    }))
}

// ── Blog ──────────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct PaginationParams {
    pub limit: Option<i64>,
    pub offset: Option<i64>,
}

pub async fn list_posts(
    State(state): State<AppState>,
    Query(params): Query<PaginationParams>,
) -> ApiResult<Json<Vec<BlogPostSummary>>> {
    let limit = params.limit.unwrap_or(10).min(50);
    let offset = params.offset.unwrap_or(0);
    let posts = services::list_blog_posts(&state.db, limit, offset).await?;
    Ok(Json(posts))
}

pub async fn get_post(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> ApiResult<Json<BlogPost>> {
    let post = services::get_blog_post_by_slug(&state.db, &slug).await?;
    Ok(Json(post))
}

// ── Anti-Spam ────────────────────────────────

fn check_spam(honeypot: &Option<String>, form_loaded_at: &Option<i64>) -> ApiResult<()> {
    if let Some(hp) = honeypot {
        if !hp.is_empty() {
            tracing::info!("Spam blocked: honeypot field filled");
            return Err(ApiError::SpamDetected);
        }
    }
    if let Some(loaded_at) = form_loaded_at {
        let now_ms = chrono::Utc::now().timestamp_millis();
        let elapsed_ms = now_ms - loaded_at;
        if elapsed_ms < 2_000 {
            tracing::info!("Spam blocked: form submitted in {elapsed_ms}ms (too fast)");
            return Err(ApiError::SpamDetected);
        }
    }
    Ok(())
}

// ── Contact ───────────────────────────────────

pub async fn submit_contact(
    State(state): State<AppState>,
    Json(req): Json<ContactRequest>,
) -> ApiResult<Json<serde_json::Value>> {
    check_spam(&req.website, &req._form_loaded_at)?;
    req.validate().map_err(|e| ApiError::Validation(e.to_string()))?;

    let recent = services::count_recent_contacts(&state.db, &req.email, 60).await?;
    if recent >= 3 {
        tracing::info!("Rate limited contact from: {}", req.email);
        return Err(ApiError::RateLimited);
    }

    let submission = services::create_contact(&state.db, &req).await?;

    let config = state.config.clone();
    tokio::spawn(async move {
        if let Err(e) = crate::email::notify_contact(&config, &submission).await {
            tracing::warn!("Failed to send contact notification email: {e}");
        }
    });

    Ok(Json(serde_json::json!({
        "success": true,
        "message": "Thank you for reaching out. We'll be in touch shortly."
    })))
}

// ── Waitlist ──────────────────────────────────

pub async fn submit_waitlist(
    State(state): State<AppState>,
    Json(req): Json<WaitlistRequest>,
) -> ApiResult<Json<serde_json::Value>> {
    check_spam(&req.website, &req._form_loaded_at)?;
    req.validate().map_err(|e| ApiError::Validation(e.to_string()))?;

    let recent = services::count_recent_waitlist(&state.db, &req.email, 60).await?;
    if recent >= 3 {
        tracing::info!("Rate limited waitlist from: {}", req.email);
        return Err(ApiError::RateLimited);
    }

    let entry = services::create_waitlist_entry(&state.db, &req).await?;

    let config = state.config.clone();
    tokio::spawn(async move {
        if let Err(e) = crate::email::notify_waitlist(&config, &entry).await {
            tracing::warn!("Failed to send waitlist notification email: {e}");
        }
    });

    Ok(Json(serde_json::json!({
        "success": true,
        "message": "You're on the list! We'll reach out when your spot is ready."
    })))
}

// ── Dynamic Sitemap ──────────────────────────

pub async fn dynamic_sitemap(
    State(state): State<AppState>,
) -> axum::response::Response {
    use axum::http::{header, StatusCode};
    use axum::response::IntoResponse;

    let base = "https://terroirai.com";
    let mut xml = String::from(
        r#"<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>BASE/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>BASE/blog</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>BASE/contact</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
"#
    ).replace("BASE", base);

    // Fetch published blog posts for dynamic entries
    if let Ok(posts) = services::list_blog_posts(&state.db, 100, 0).await {
        for post in posts {
            xml.push_str(&format!(
                "  <url><loc>{base}/blog/{slug}</loc><lastmod>{date}</lastmod><changefreq>monthly</changefreq><priority>0.6</priority></url>\n",
                slug = post.slug,
                date = post.published_at.map(|d| d.to_string()).unwrap_or_default(),
            ));
        }
    }

    xml.push_str("</urlset>");

    (
        StatusCode::OK,
        [(header::CONTENT_TYPE, "application/xml; charset=utf-8")],
        xml,
    ).into_response()
}

// ── Analytics ────────────────────────────────

pub async fn track_pageview(
    State(state): State<AppState>,
    Json(req): Json<PageViewRequest>,
) -> ApiResult<Json<serde_json::Value>> {
    services::record_page_view(&state.db, &req).await?;
    Ok(Json(serde_json::json!({ "ok": true })))
}

pub async fn track_event(
    State(state): State<AppState>,
    Json(req): Json<TrackEventRequest>,
) -> ApiResult<Json<serde_json::Value>> {
    services::record_event(&state.db, &req).await?;
    Ok(Json(serde_json::json!({ "ok": true })))
}

// ── Experiments ──────────────────────────────

pub async fn list_experiments(
    State(state): State<AppState>,
) -> ApiResult<Json<Vec<Experiment>>> {
    let exps = services::list_experiments(&state.db).await?;
    Ok(Json(exps))
}

pub async fn create_experiment(
    State(state): State<AppState>,
    Json(req): Json<ExperimentRequest>,
) -> ApiResult<Json<Experiment>> {
    let exp = services::create_experiment(&state.db, &req).await?;
    Ok(Json(exp))
}

// ── Admin ────────────────────────────────────

fn validate_admin_token(state: &AppState, headers: &HeaderMap) -> ApiResult<()> {
    let Some(expected) = state.config.admin_token.as_deref() else {
        return Err(ApiError::Unauthorized);
    };

    if let Some(auth) = headers.get("authorization") {
        if let Ok(value) = auth.to_str() {
            if let Some(token) = value.strip_prefix("Bearer ") {
                if token == expected {
                    return Ok(());
                }
            }
        }
    }

    Err(ApiError::Unauthorized)
}

pub async fn admin_stats(
    State(state): State<AppState>,
    headers: HeaderMap,
) -> ApiResult<Json<AdminStats>> {
    validate_admin_token(&state, &headers)?;
    let stats = services::admin_stats(&state.db).await?;
    Ok(Json(stats))
}

pub async fn admin_contacts(
    State(state): State<AppState>,
    headers: HeaderMap,
    Query(params): Query<PaginationParams>,
) -> ApiResult<Json<Vec<ContactSubmission>>> {
    validate_admin_token(&state, &headers)?;
    let limit = params.limit.unwrap_or(100).min(200);
    let offset = params.offset.unwrap_or(0);
    let rows = services::list_contacts(&state.db, limit, offset).await?;
    Ok(Json(rows))
}

pub async fn admin_waitlist(
    State(state): State<AppState>,
    headers: HeaderMap,
    Query(params): Query<PaginationParams>,
) -> ApiResult<Json<Vec<WaitlistEntry>>> {
    validate_admin_token(&state, &headers)?;
    let limit = params.limit.unwrap_or(100).min(200);
    let offset = params.offset.unwrap_or(0);
    let rows = services::list_waitlist(&state.db, limit, offset).await?;
    Ok(Json(rows))
}
