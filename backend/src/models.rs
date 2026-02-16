use chrono::{DateTime, Utc};
use serde::{Deserialize, Serialize};
use sqlx::FromRow;
use uuid::Uuid;

// ── Blog Posts ───────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct BlogPost {
    pub id: Uuid,
    pub slug: String,
    pub title: String,
    pub subtitle: Option<String>,
    pub category: String,
    pub hero_image_url: Option<String>,
    pub content_html: String,
    pub excerpt: String,
    pub author_name: String,
    pub read_time_minutes: i32,
    pub published: bool,
    pub published_at: Option<DateTime<Utc>>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct BlogPostSummary {
    pub id: Uuid,
    pub slug: String,
    pub title: String,
    pub subtitle: Option<String>,
    pub category: String,
    pub hero_image_url: Option<String>,
    pub excerpt: String,
    pub author_name: String,
    pub read_time_minutes: i32,
    pub published_at: Option<DateTime<Utc>>,
}

// ── Contact / Lead Forms ─────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct ContactSubmission {
    pub id: Uuid,
    pub name: String,
    pub email: String,
    pub company: Option<String>,
    pub phone: Option<String>,
    pub acreage: Option<String>,
    pub crop_type: Option<String>,
    pub message: String,
    pub source: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct ContactRequest {
    pub name: String,
    pub email: String,
    pub company: Option<String>,
    pub phone: Option<String>,
    pub acreage: Option<String>,
    pub crop_type: Option<String>,
    pub message: String,
    pub source: Option<String>,
}

// ── Waitlist ─────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize, FromRow)]
pub struct WaitlistEntry {
    pub id: Uuid,
    pub email: String,
    pub name: Option<String>,
    pub company: Option<String>,
    pub interest: String,
    pub created_at: DateTime<Utc>,
}

#[derive(Debug, Deserialize)]
pub struct WaitlistRequest {
    pub email: String,
    pub name: Option<String>,
    pub company: Option<String>,
    pub interest: Option<String>,
}

// ── Health ────────────────────────────────────

#[derive(Debug, Serialize)]
pub struct HealthResponse {
    pub status: String,
    pub version: String,
    pub database: String,
}

// ── Analytics ────────────────────────────────

#[derive(Debug, Deserialize)]
pub struct PageViewRequest {
    pub session_id: String,
    pub visitor_id: String,
    pub path: String,
    pub referrer: Option<String>,
    pub utm_source: Option<String>,
    pub utm_medium: Option<String>,
    pub utm_campaign: Option<String>,
    pub utm_term: Option<String>,
    pub utm_content: Option<String>,
    pub screen_width: Option<i32>,
}

#[derive(Debug, Deserialize)]
pub struct TrackEventRequest {
    pub session_id: String,
    pub visitor_id: String,
    pub event_name: String,
    pub event_category: Option<String>,
    pub event_label: Option<String>,
    pub event_value: Option<f64>,
    pub properties: Option<serde_json::Value>,
    pub path: Option<String>,
}

#[derive(Debug, Deserialize)]
pub struct ExperimentRequest {
    pub name: String,
    pub hypothesis: String,
    pub metric_name: String,
    pub baseline_value: Option<f64>,
    pub target_value: Option<f64>,
}

#[derive(Debug, Serialize, FromRow)]
pub struct Experiment {
    pub id: Uuid,
    pub name: String,
    pub hypothesis: String,
    pub metric_name: String,
    pub baseline_value: Option<f64>,
    pub target_value: Option<f64>,
    pub current_value: Option<f64>,
    pub status: String,
    pub started_at: DateTime<Utc>,
    pub ended_at: Option<DateTime<Utc>>,
    pub notes: Option<String>,
    pub created_at: DateTime<Utc>,
    pub updated_at: DateTime<Utc>,
}
