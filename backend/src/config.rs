use anyhow::{Context, Result};

#[derive(Clone, Debug)]
pub struct AppConfig {
    pub database_url: String,
    pub port: u16,
    pub cors_origin: String,
    pub db_max_connections: u32,
    pub environment: String,
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
        })
    }

    #[allow(dead_code)]
    pub fn is_production(&self) -> bool {
        self.environment == "production"
    }
}
