use axum::http::StatusCode;
use axum::response::{IntoResponse, Response};
use axum::Json;
use serde_json::json;

#[derive(Debug, thiserror::Error)]
pub enum ApiError {
    #[error("Not found: {0}")]
    NotFound(String),

    #[error("Validation error: {0}")]
    Validation(String),

    #[error("Database error: {0}")]
    Database(#[from] sqlx::Error),

    #[error("Internal error: {0}")]
    Internal(#[from] anyhow::Error),

    #[error("Unauthorized")]
    Unauthorized,

    #[error("Spam detected")]
    SpamDetected,

    #[error("Too many requests")]
    RateLimited,
}

impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        // Spam: return fake 200 so bots don't learn they were caught
        if matches!(self, ApiError::SpamDetected) {
            return (
                StatusCode::OK,
                Json(json!({
                    "success": true,
                    "message": "Thank you! We'll be in touch shortly."
                })),
            )
                .into_response();
        }

        let (status, message) = match &self {
            ApiError::NotFound(msg) => (StatusCode::NOT_FOUND, msg.clone()),
            ApiError::Validation(msg) => (StatusCode::BAD_REQUEST, msg.clone()),
            ApiError::Database(e) => {
                tracing::error!("Database error: {e:?}");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "An internal error occurred".to_string(),
                )
            }
            ApiError::Internal(e) => {
                tracing::error!("Internal error: {e:?}");
                (
                    StatusCode::INTERNAL_SERVER_ERROR,
                    "An internal error occurred".to_string(),
                )
            }
            ApiError::Unauthorized => (StatusCode::UNAUTHORIZED, "Unauthorized".to_string()),
            ApiError::RateLimited => (
                StatusCode::TOO_MANY_REQUESTS,
                "Too many submissions. Please try again later.".to_string(),
            ),
            ApiError::SpamDetected => unreachable!(),
        };

        (status, Json(json!({ "error": message }))).into_response()
    }
}

pub type ApiResult<T> = Result<T, ApiError>;
