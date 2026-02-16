# Terroir AI Platform

> **The Field Fitness Tracker** — Real-time computer vision for specialty crop intelligence.

## Quick Start (2 commands)

```bash
# First time only — installs deps, starts Postgres, builds backend
make setup

# Every time — starts all 3 services with hot reload
make dev
```

That's it. Open [http://localhost:4200](http://localhost:4200).

## What `make dev` Does

| Service   | URL                    | What                                      |
|-----------|------------------------|-------------------------------------------|
| Frontend  | http://localhost:4200  | Angular 21 dev server with hot reload     |
| Backend   | http://localhost:8080  | Rust/Axum API (recompile with `cargo run`) |
| Database  | localhost:5432         | PostgreSQL 15 in Docker                   |

The Angular dev server automatically proxies `/api/*` to the backend, so there are no CORS issues in development.

## All Commands

```bash
make setup          # One-time: install deps, start DB, build
make dev            # Start everything (frontend + backend + db)
make dev-frontend   # Just Angular
make dev-backend    # Just Rust API
make dev-db         # Just Postgres
make stop           # Stop Docker containers
make test           # Run all tests
make clean          # Full reset (delete node_modules, target, volumes)
make deploy         # Deploy to GCP
```

## Prerequisites

- **Node.js 22+** and npm
- **Rust 1.93+** — `curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh`
- **Docker** — for local Postgres

## VS Code

Open the workspace file for the best experience:

```bash
code terroir-ai.code-workspace
```

Recommended extensions will be prompted automatically (Rust Analyzer, Angular Language Service, Prettier, Docker, Terraform).

## Architecture

```
terroir-ai-platform/
├── frontend/          # Angular 21 (zoneless, signals, standalone)
├── backend/           # Rust 2024 (Axum 0.8 + Tokio + SQLx)
├── infra/             # OpenTofu → GCP Cloud Run + Cloud SQL
├── scripts/           # Deploy helpers
├── CLAUDE.md          # Instructions for Claude Code
├── Makefile           # All dev commands
└── docker-compose.yml # Local Postgres
```

## Deploy to GCP

```bash
# 1. Configure (one time)
gcloud auth login && gcloud config set project terroirai
cp infra/terraform.tfvars.example infra/terraform.tfvars
# Edit terraform.tfvars with your DB password

# 2. Deploy
make deploy
```

## Claude Code

This repo includes a `CLAUDE.md` that gives Claude Code full context on the project — structure, conventions, API endpoints, and common tasks.

## License

Proprietary — Terroir AI Inc. All rights reserved.
