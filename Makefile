.PHONY: dev dev-db dev-backend dev-frontend setup clean test build deploy stop

# ────────────────────────────────────────────────
# Terroir AI — Developer Commands
# ────────────────────────────────────────────────
# Run `make setup` once, then `make dev` every day.
# ────────────────────────────────────────────────

# One-time setup: install deps, start DB, run migrations
setup:
	@echo "🌿 Setting up Terroir AI dev environment..."
	@echo "→ Starting Postgres..."
	docker compose up -d postgres
	@echo "→ Waiting for Postgres to be ready..."
	@sleep 3
	@echo "→ Installing frontend dependencies..."
	cd frontend && npm install
	@echo "→ Copying backend .env..."
	@if [ ! -f backend/.env ]; then cp backend/.env.example backend/.env; fi
	@echo "→ Building backend (first build may take a few minutes)..."
	cd backend && cargo build
	@echo ""
	@echo "✅ Setup complete! Run 'make dev' to start developing."

# Start everything for local development (3 processes)
dev:
	@echo "🌿 Starting Terroir AI dev environment..."
	@echo "   Frontend  → http://localhost:4200"
	@echo "   Backend   → http://localhost:8080"
	@echo "   Grafana   → http://localhost:3000  (admin/admin)"
	@echo "   API proxy: localhost:4200/api/* → localhost:8080/api/*"
	@echo ""
	@make dev-db
	@sleep 2
	@make -j2 dev-backend dev-frontend

# Just the database + Grafana
dev-db:
	docker compose up -d postgres grafana

# Backend with cargo watch for hot reload
dev-backend:
	@echo "→ Starting Rust backend (port 8080)..."
	cd backend && cargo run

# Frontend with proxy to backend
dev-frontend:
	@echo "→ Starting Angular dev server (port 4200)..."
	cd frontend && npx ng serve --proxy-config proxy.conf.json

# Stop all services
stop:
	docker compose down

# Run tests
test:
	cd backend && cargo test
	cd frontend && npx ng test --watch=false

# Build production images
build:
	docker compose build

# Deploy to GCP
deploy:
	./scripts/deploy.sh prod

# Full clean
clean:
	docker compose down -v
	rm -rf frontend/node_modules frontend/dist frontend/.angular
	cd backend && cargo clean
