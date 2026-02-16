use lettre::{
    message::header::ContentType,
    transport::smtp::authentication::Credentials,
    AsyncSmtpTransport, AsyncTransport, Message, Tokio1Executor,
};

use crate::config::AppConfig;
use crate::models::{ContactSubmission, WaitlistEntry};

pub async fn notify_contact(config: &AppConfig, submission: &ContactSubmission) -> anyhow::Result<()> {
    let subject = format!("New contact: {} ({})", submission.name, submission.email);
    let body = format!(
        "New contact form submission on Terroir AI\n\n\
         Name: {}\n\
         Email: {}\n\
         Company: {}\n\
         Phone: {}\n\
         Acreage: {}\n\
         Crop Type: {}\n\
         Source: {}\n\
         Date: {}\n\n\
         Message:\n{}\n\n\
         ---\n\
         View all submissions: {}/admin",
        submission.name,
        submission.email,
        submission.company.as_deref().unwrap_or("—"),
        submission.phone.as_deref().unwrap_or("—"),
        submission.acreage.as_deref().unwrap_or("—"),
        submission.crop_type.as_deref().unwrap_or("—"),
        submission.source,
        submission.created_at.format("%Y-%m-%d %H:%M UTC"),
        submission.message,
        config.app_base_url,
    );
    send_email(config, &subject, &body).await
}

pub async fn notify_waitlist(config: &AppConfig, entry: &WaitlistEntry) -> anyhow::Result<()> {
    let subject = format!("New pilot signup: {}", entry.email);
    let body = format!(
        "New waitlist/pilot signup on Terroir AI\n\n\
         Email: {}\n\
         Name: {}\n\
         Company: {}\n\
         Interest: {}\n\
         Date: {}\n\n\
         ---\n\
         View all submissions: {}/admin",
        entry.email,
        entry.name.as_deref().unwrap_or("—"),
        entry.company.as_deref().unwrap_or("—"),
        entry.interest,
        entry.created_at.format("%Y-%m-%d %H:%M UTC"),
        config.app_base_url,
    );
    send_email(config, &subject, &body).await
}

async fn send_email(config: &AppConfig, subject: &str, body: &str) -> anyhow::Result<()> {
    let (Some(host), Some(port), Some(username), Some(password), Some(to)) = (
        config.smtp_host.as_ref(),
        config.smtp_port,
        config.smtp_username.as_ref(),
        config.smtp_password.as_ref(),
        config.admin_email.as_ref(),
    ) else {
        tracing::debug!("SMTP not configured, skipping email");
        return Ok(());
    };

    let email = Message::builder()
        .from(format!("Terroir AI <{username}>").parse()?)
        .to(to.parse()?)
        .subject(subject)
        .header(ContentType::TEXT_PLAIN)
        .body(body.to_string())?;

    let creds = Credentials::new(username.clone(), password.clone());

    let mailer = AsyncSmtpTransport::<Tokio1Executor>::starttls_relay(host)?
        .port(port)
        .credentials(creds)
        .build();

    mailer.send(email).await?;
    tracing::info!("Notification email sent: {subject}");
    Ok(())
}
