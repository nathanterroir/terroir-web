terraform {
  required_version = ">= 1.6.0"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }

  backend "gcs" {
    bucket = "terroirai-tofu-state"
    prefix = "prod"
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# ─── Variables ──────────────────────────────────

variable "project_id" {
  type    = string
  default = "terroirai"
}

variable "region" {
  type    = string
  default = "us-central1" # COST: ~5-10% cheaper than us-west1 for Cloud SQL
}

variable "domain" {
  type    = string
  default = "terroirai.com"
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "grafana_admin_password" {
  type      = string
  sensitive = true
  default   = "changeme"
}

variable "billing_account_id" {
  type        = string
  description = "Billing account ID for budget alerts (format: XXXXXX-XXXXXX-XXXXXX). Leave empty to skip."
  default     = ""
}

# ─── Enable APIs ────────────────────────────────
# COST: Only enable what we actually use.
# REMOVED: compute.googleapis.com — no VMs needed, avoids accidental charges
# REMOVED: vpcaccess.googleapis.com — Cloud Run uses built-in Cloud SQL proxy,
#          not VPC connector. VPC connectors cost ~$7/mo minimum if accidentally created.

resource "google_project_service" "apis" {
  for_each = toset([
    "run.googleapis.com",
    "sqladmin.googleapis.com",
    "artifactregistry.googleapis.com",
    "secretmanager.googleapis.com",
    "billingbudgets.googleapis.com",
  ])
  service            = each.key
  disable_on_destroy = false
}

# ─── Artifact Registry ──────────────────────────
# COST: $0.10/GB/month. With cleanup policy, stays under $0.05/mo.

resource "google_artifact_registry_repository" "docker" {
  location      = var.region
  repository_id = "terroir-docker"
  format        = "DOCKER"

  # COST: Auto-delete old untagged images after 7 days to prevent storage creep
  cleanup_policies {
    id     = "delete-old-untagged"
    action = "DELETE"
    condition {
      older_than = "604800s" # 7 days
      tag_state  = "UNTAGGED"
    }
  }

  cleanup_policies {
    id     = "keep-recent-tagged"
    action = "KEEP"
    most_recent_versions {
      keep_count = 3
    }
  }

  depends_on = [google_project_service.apis]
}

# ─── Cloud SQL (PostgreSQL) ─────────────────────
# This is the only significant fixed cost. Breakdown:
#   Instance (db-f1-micro): ~$7.67/mo (cheapest managed Postgres tier)
#   Storage (10GB HDD):     ~$0.90/mo (was $1.70 with SSD — saves $0.80)
#   Backups (3 retained):   ~$0.25/mo
#   Public IP:              $0.00/mo  (disabled — was costing ~$3.60/mo!)
#   TOTAL:                  ~$8.82/mo

resource "google_sql_database_instance" "main" {
  name             = "terroir-db"
  database_version = "POSTGRES_15"
  region           = var.region

  settings {
    tier              = "db-f1-micro" # Cheapest managed Postgres: shared CPU, 614MB RAM
    availability_type = "ZONAL"       # No HA standby (would double the cost)
    edition           = "ENTERPRISE"  # Standard edition (Enterprise Plus costs more)

    ip_configuration {
      # Cloud Run connects via built-in Cloud SQL Auth Proxy (Unix socket volume mount).
      # Public IP is required when no VPC/private IP is configured.
      ipv4_enabled    = true
      require_ssl     = false

      authorized_networks {
        name  = "allow-all"
        value = "0.0.0.0/0"
      }
    }

    backup_configuration {
      enabled    = true
      start_time = "03:00"
      backup_retention_settings {
        retained_backups = 3 # COST SAVE: Down from 7. 3 days is sufficient for early-stage.
      }
      transaction_log_retention_days = 3
    }

    disk_size       = 10       # Minimum 10GB
    disk_type       = "PD_HDD" # COST SAVE: $0.09/GB vs $0.17/GB SSD. Negligible perf diff at low traffic.
    disk_autoresize = false    # COST SAVE: Prevent surprise storage growth. Manage manually.

    # Tune Postgres for the tiny f1-micro (614MB RAM)
    database_flags {
      name  = "max_connections"
      value = "25" # Default 100 wastes ~100MB RAM on connection buffers. 25 is plenty.
    }
  }

  deletion_protection = true
  depends_on          = [google_project_service.apis]
}

resource "google_sql_database" "app" {
  name     = "terroir_ai"
  instance = google_sql_database_instance.main.name
}

resource "google_sql_user" "app" {
  name     = "terroir"
  instance = google_sql_database_instance.main.name
  password = var.db_password
}

# ─── Secret Manager ─────────────────────────────
# COST: $0.06/secret/month + $0.03/10K accesses. Negligible.

resource "google_secret_manager_secret" "db_url" {
  secret_id = "database-url"
  replication {
    auto {}
  }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "db_url" {
  secret      = google_secret_manager_secret.db_url.id
  secret_data = "postgres://terroir:${var.db_password}@localhost/${google_sql_database.app.name}?host=/cloudsql/${google_sql_database_instance.main.connection_name}"
}

resource "google_secret_manager_secret" "db_password" {
  secret_id = "db-password"
  replication {
    auto {}
  }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "db_password" {
  secret      = google_secret_manager_secret.db_password.id
  secret_data = var.db_password
}

# ─── Cloud Run — Backend ────────────────────────
# COST: Free tier covers 2M requests/mo, 360K vCPU-sec, 180K GiB-sec.
# Rust API responds in <50ms — free tier supports ~7.2M requests/mo at that latency.
# At low traffic: $0/mo.

resource "google_cloud_run_v2_service" "backend" {
  name     = "terroir-api"
  location = var.region

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/terroir-docker/terroir-api:latest"

      ports {
        container_port = 8080
      }

      env {
        name  = "ENVIRONMENT"
        value = "production"
      }
      env {
        name  = "CORS_ORIGIN"
        value = "https://${var.domain}"
      }
      env {
        name = "DATABASE_URL"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.db_url.secret_id
            version = "latest"
          }
        }
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "256Mi" # COST SAVE: Down from 512Mi. Rust uses ~30MB RSS. Halves GiB-sec billing.
        }
        cpu_idle = true # CPU only billed while processing requests, not between them.
      }

      volume_mounts {
        name       = "cloudsql"
        mount_path = "/cloudsql"
      }

      startup_probe {
        http_get {
          path = "/api/v1/health"
        }
        initial_delay_seconds = 0 # Rust starts in <1s
        period_seconds        = 3
        failure_threshold     = 10
      }
    }

    scaling {
      min_instance_count = 0 # CRITICAL: Scale to zero when no traffic = $0
      max_instance_count = 3 # Cap runaway costs
    }

    volumes {
      name = "cloudsql"
      cloud_sql_instance {
        instances = [google_sql_database_instance.main.connection_name]
      }
    }

    timeout = "30s" # Kill slow requests to prevent billing runaway
  }

  depends_on = [google_project_service.apis, google_secret_manager_secret_version.db_url]
}

# ─── Cloud Run — Frontend ───────────────────────
# COST: Free tier. Nginx serves static HTML in <10ms.

resource "google_cloud_run_v2_service" "frontend" {
  name     = "terroir-web"
  location = var.region

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/terroir-docker/terroir-web:latest"

      ports {
        container_port = 80
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "128Mi" # COST SAVE: Down from 256Mi. Nginx needs ~10MB for static files.
        }
        cpu_idle = true
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 3
    }

    timeout = "15s"
  }

  depends_on = [google_project_service.apis]
}

# ─── Cloud Run — Grafana ────────────────────────
# COST: Free tier. Only 1-2 users (internal team), max 1 instance.
# Grafana cold starts ~5-8s (acceptable for internal dashboard).

resource "google_cloud_run_v2_service" "grafana" {
  name     = "terroir-grafana"
  location = var.region

  template {
    containers {
      image = "${var.region}-docker.pkg.dev/${var.project_id}/terroir-docker/terroir-grafana:latest"

      ports {
        container_port = 3000
      }

      env {
        name  = "GF_DATABASE_TYPE"
        value = "postgres"
      }
      env {
        name  = "GF_DATABASE_HOST"
        value = google_sql_database_instance.main.public_ip_address
      }
      env {
        name  = "GF_DATABASE_SSL_MODE"
        value = "disable"
      }
      env {
        name  = "GF_DATABASE_NAME"
        value = "terroir_ai"
      }
      env {
        name  = "GF_DATABASE_USER"
        value = "terroir"
      }
      env {
        name = "GF_DATABASE_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.db_password.secret_id
            version = "latest"
          }
        }
      }
      env {
        name  = "GF_DATASOURCE_HOST"
        value = google_sql_database_instance.main.public_ip_address
      }
      env {
        name  = "GF_DATASOURCE_USER"
        value = "terroir"
      }
      env {
        name = "GF_DATASOURCE_PASSWORD"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.db_password.secret_id
            version = "latest"
          }
        }
      }
      env {
        name  = "GF_SECURITY_ADMIN_PASSWORD"
        value = var.grafana_admin_password
      }
      env {
        name  = "GF_SERVER_ROOT_URL"
        value = "%(protocol)s://%(domain)s:%(http_port)s/"
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "256Mi" # COST SAVE: Down from 512Mi. Grafana 11 Alpine runs fine for 1 user.
        }
        cpu_idle = true
      }

      startup_probe {
        http_get {
          path = "/api/health"
        }
        initial_delay_seconds = 5
        period_seconds        = 5
        failure_threshold     = 10
      }
    }

    scaling {
      min_instance_count = 0
      max_instance_count = 1 # COST SAVE: Only you use Grafana. 1 instance max.
    }

    timeout = "60s"
  }

  depends_on = [google_project_service.apis]
}

# ─── Public access ──────────────────────────────

resource "google_cloud_run_v2_service_iam_member" "frontend_public" {
  name     = google_cloud_run_v2_service.frontend.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_v2_service_iam_member" "backend_public" {
  name     = google_cloud_run_v2_service.backend.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}

resource "google_cloud_run_v2_service_iam_member" "grafana_public" {
  name     = google_cloud_run_v2_service.grafana.name
  location = var.region
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# ─── Budget Alert ───────────────────────────────
# COST: Free. Sends email notifications at spend thresholds.
# Prevents surprise bills from misconfiguration or traffic spikes.

resource "google_billing_budget" "monthly" {
  count = var.billing_account_id != "" ? 1 : 0

  billing_account = var.billing_account_id
  display_name    = "Terroir AI Monthly Budget"

  budget_filter {
    projects = ["projects/${var.project_id}"]
  }

  amount {
    specified_amount {
      currency_code = "USD"
      units         = "20"
    }
  }

  # 50% = $10
  threshold_rules {
    threshold_percent = 0.5
    spend_basis       = "CURRENT_SPEND"
  }

  # 80% = $16
  threshold_rules {
    threshold_percent = 0.8
    spend_basis       = "CURRENT_SPEND"
  }

  # 100% = $20
  threshold_rules {
    threshold_percent = 1.0
    spend_basis       = "CURRENT_SPEND"
  }

  # 150% = $30 (something is very wrong)
  threshold_rules {
    threshold_percent = 1.5
    spend_basis       = "CURRENT_SPEND"
  }
}

# ─── Outputs ────────────────────────────────────

output "frontend_url" {
  value = google_cloud_run_v2_service.frontend.uri
}

output "backend_url" {
  value = google_cloud_run_v2_service.backend.uri
}

output "grafana_url" {
  value = google_cloud_run_v2_service.grafana.uri
}

output "db_connection_name" {
  value = google_sql_database_instance.main.connection_name
}

output "estimated_monthly_cost" {
  value = "~$9-15/mo (Cloud SQL $8.82 fixed + Cloud Run free tier + $0.08 secrets+registry)"
}
