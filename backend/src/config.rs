use anyhow::{Context, Result};

#[derive(Clone, Debug)]
pub struct AppConfig {
    pub database_url: String,
    pub port: u16,
    pub cors_origin: String,
    pub db_max_connections: u32,
    pub environment: String,
    pub admin_token: Option<String>,
    pub smtp_host: Option<String>,
    pub smtp_port: Option<u16>,
    pub smtp_username: Option<String>,
    pub smtp_password: Option<String>,
    pub admin_email: Option<String>,
    pub app_base_url: String,
}

impl AppConfig {
    pub fn from_env() -> Result<Self> {
        Ok(Self {
            database_url: std::env::var("DATABASE_URL")
                .context("DATABASE_URL must be set")?,
            port: std::env::var("PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()
                .context("PORT must be a valid u16")?,
            cors_origin: std::env::var("CORS_ORIGIN")
                .unwrap_or_else(|_| "*".to_string()),
            db_max_connections: std::env::var("DB_MAX_CONNECTIONS")
                .unwrap_or_else(|_| "5".to_string())
                .parse()
                .unwrap_or(5),
            environment: std::env::var("ENVIRONMENT")
                .unwrap_or_else(|_| "development".to_string()),
            admin_token: std::env::var("ADMIN_TOKEN").ok().filter(|s| !s.is_empty()),
            smtp_host: std::env::var("SMTP_HOST").ok().filter(|s| !s.is_empty()),
            smtp_port: std::env::var("SMTP_PORT").ok().and_then(|p| p.parse().ok()),
            smtp_username: std::env::var("SMTP_USERNAME").ok().filter(|s| !s.is_empty()),
            smtp_password: std::env::var("SMTP_PASSWORD").ok().filter(|s| !s.is_empty()),
            admin_email: std::env::var("ADMIN_EMAIL").ok().filter(|s| !s.is_empty()),
            app_base_url: std::env::var("APP_BASE_URL")
                .unwrap_or_else(|_| "http://localhost:4200".to_string()),
        })
    }

    #[allow(dead_code)]
    pub fn is_production(&self) -> bool {
        self.environment == "production"
    }
}
