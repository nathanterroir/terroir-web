#!/usr/bin/env bash
set -euo pipefail

# ──────────────────────────────────────────────
# Terroir AI — Deploy to GCP
# Usage: ./scripts/deploy.sh [prod]
# ──────────────────────────────────────────────

ENV="${1:-prod}"
PROJECT_ID="terroirai"
REGION="us-central1"
REPO="terroir-docker"
REGISTRY="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO}"

echo "╔══════════════════════════════════════╗"
echo "║   Terroir AI — Deploying (${ENV})    ║"
echo "╚══════════════════════════════════════╝"

# 1. Ensure we're authenticated
echo "→ Checking gcloud auth..."
gcloud auth print-access-token > /dev/null 2>&1 || {
  echo "  Please run: gcloud auth login"
  exit 1
}
gcloud config set project "${PROJECT_ID}"

# 2. Configure Docker for Artifact Registry
echo "→ Configuring Docker for Artifact Registry..."
gcloud auth configure-docker "${REGION}-docker.pkg.dev" --quiet

# 3. Create state bucket if it doesn't exist
echo "→ Ensuring Terraform state bucket..."
gsutil ls "gs://${PROJECT_ID}-tofu-state" 2>/dev/null || \
  gsutil mb -p "${PROJECT_ID}" -l "${REGION}" "gs://${PROJECT_ID}-tofu-state"

# 4. Build & push backend
echo "→ Building backend Docker image..."
docker build -t "${REGISTRY}/terroir-api:latest" ./backend
echo "→ Pushing backend image..."
docker push "${REGISTRY}/terroir-api:latest"

# 5. Build & push frontend
echo "→ Building frontend Docker image..."
docker build -t "${REGISTRY}/terroir-web:latest" ./frontend
echo "→ Pushing frontend image..."
docker push "${REGISTRY}/terroir-web:latest"

# 6. Build & push Grafana
echo "→ Building Grafana Docker image..."
docker build -t "${REGISTRY}/terroir-grafana:latest" ./grafana
echo "→ Pushing Grafana image..."
docker push "${REGISTRY}/terroir-grafana:latest"

# 7. Apply infrastructure
echo "→ Applying OpenTofu infrastructure..."
cd infra
tofu init -upgrade
tofu apply -auto-approve
cd ..

# 7. Output URLs
echo ""
echo "╔══════════════════════════════════════╗"
echo "║        Deploy Complete! 🌿           ║"
echo "╚══════════════════════════════════════╝"
echo ""
cd infra
echo "Frontend: $(tofu output -raw frontend_url)"
echo "Backend:  $(tofu output -raw backend_url)"
echo "Grafana:  $(tofu output -raw grafana_url)"
cd ..
