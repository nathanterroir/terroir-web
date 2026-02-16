use axum::{routing::{get, post}, Router};

use super::handlers;
use crate::AppState;

pub fn api_router() -> Router<AppState> {
    Router::new()
        .route("/health", get(handlers::health_check))
        .route("/blog", get(handlers::list_posts))
        .route("/blog/{slug}", get(handlers::get_post))
        .route("/contact", post(handlers::submit_contact))
        .route("/waitlist", post(handlers::submit_waitlist))
        .route("/sitemap.xml", get(handlers::dynamic_sitemap))
        // Analytics
        .route("/analytics/pageview", post(handlers::track_pageview))
        .route("/analytics/event", post(handlers::track_event))
        // Experiments (Lean Startup)
        .route("/experiments", get(handlers::list_experiments).post(handlers::create_experiment))
}
