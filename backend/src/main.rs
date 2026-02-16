// Terroir AI — API Server
// Rust 2024 Edition • Axum 0.8 • Tokio

use anyhow::Result;
use axum::Router;
use sqlx::postgres::PgPoolOptions;
use std::net::SocketAddr;
use std::sync::Arc;
use tower_http::compression::CompressionLayer;
use tower_http::cors::{Any, CorsLayer};
use tower_http::limit::RequestBodyLimitLayer;
use tower_http::trace::TraceLayer;
use tracing_subscriber::{layer::SubscriberExt, util::SubscriberInitExt};

mod api;
mod config;
mod email;
mod errors;
mod models;
mod services;

use config::AppConfig;

/// Shared application state available to all handlers.
#[derive(Clone)]
pub struct AppState {
    pub db: sqlx::PgPool,
    pub config: Arc<AppConfig>,
}

#[tokio::main]
async fn main() -> Result<()> {
    // Load .env in development
    let _ = dotenvy::dotenv();

    // Structured JSON logging
    tracing_subscriber::registry()
        .with(tracing_subscriber::EnvFilter::try_from_default_env().unwrap_or_else(|_| {
            "terroir_api=info,tower_http=info,sqlx=warn".into()
        }))
        .with(tracing_subscriber::fmt::layer().json())
        .init();

    let config = AppConfig::from_env()?;

    let pool = PgPoolOptions::new()
        .max_connections(config.db_max_connections)
        .connect(&config.database_url)
        .await?;

    tracing::info!("Connected to database");

    // Run embedded migrations on startup
    sqlx::migrate!("./migrations").run(&pool).await?;
    tracing::info!("Migrations applied");

    let state = AppState {
        db: pool,
        config: Arc::new(config.clone()),
    };

    // CORS
    let cors = CorsLayer::new()
        .allow_origin(
            config
                .cors_origin
                .parse::<axum::http::HeaderValue>()
                .unwrap_or_else(|_| axum::http::HeaderValue::from_static("*")),
        )
        .allow_methods(Any)
        .allow_headers(Any);

    let app = Router::new()
        .nest("/api/v1", api::routes::api_router())
        .layer(cors)
        .layer(TraceLayer::new_for_http())
        .layer(CompressionLayer::new())
        .layer(RequestBodyLimitLayer::new(64 * 1024)) // 64 KB max request body
        .with_state(state);

    let addr = SocketAddr::from(([0, 0, 0, 0], config.port));
    tracing::info!("Terroir API listening on {addr}");

    let listener = tokio::net::TcpListener::bind(addr).await?;
    axum::serve(listener, app).await?;

    Ok(())
}
