use axum::extract::{Path, Query, State};
use axum::Json;
use serde::Deserialize;

use crate::errors::ApiResult;
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

// ── Contact ───────────────────────────────────

pub async fn submit_contact(
    State(state): State<AppState>,
    Json(req): Json<ContactRequest>,
) -> ApiResult<Json<serde_json::Value>> {
    services::create_contact(&state.db, &req).await?;
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
    services::create_waitlist_entry(&state.db, &req).await?;
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
