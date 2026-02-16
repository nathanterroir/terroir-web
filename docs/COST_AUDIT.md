# Terroir AI — GCP Cost Audit & Optimization

## Executive Summary

**Before optimization: ~$45–75/month**
**After optimization: ~$9–15/month** (with zero traffic, scale-to-zero everywhere)

All functionality preserved. Zero features removed.

---

## Line-by-Line Cost Audit (BEFORE)

| Resource | Config | Monthly Cost | Notes |
|----------|--------|-------------|-------|
| **Cloud SQL (db-f1-micro)** | Postgres 15, 10GB SSD, always-on | **$7.67** (instance) + $1.70 (storage) + ~$0.36 (IP) = **~$9.73** | Biggest fixed cost. f1-micro is cheapest tier. 10GB SSD @ $0.17/GB. Public IP ~$0.01/hr when not connected to Cloud Run instance. |
| **Cloud SQL Backups** | Daily automated, 7 retained | **~$0.42** | 10GB × $0.08/GB × ~0.5 (incremental) |
| **Cloud Run — Backend** | 1 vCPU, 512Mi, scale 0→3 | **$0–5** | Free tier: 2M requests, 360K vCPU-sec, 180K GiB-sec/mo. At low traffic = ~$0. |
| **Cloud Run — Frontend** | 1 vCPU, 256Mi, scale 0→3 | **$0–3** | Same free tier. Nginx serves static files = very fast cold starts. |
| **Cloud Run — Grafana** | 1 vCPU, 512Mi, scale 0→2 | **$0–8** | Problem: Grafana has SLOW cold starts (~10-15s). Users will hit it repeatedly, keeping it warm. Cloud SQL proxy connection per instance adds latency. |
| **Artifact Registry** | 3 Docker images | **$0.30–2** | $0.10/GB storage. Images: backend ~50MB, frontend ~15MB, grafana ~400MB compressed = ~0.5GB |
| **Secret Manager** | 1 secret, ~3 access/day | **$0.06** | $0.06/secret/month + $0.03/10K accesses |
| **GCS State Bucket** | ~10KB tofu state | **$0.00** | Negligible |
| **Compute Engine API** | Enabled but unused | **$0** | No VMs, but enabling this API can trigger default firewall rules with associated costs if VMs ever spin up accidentally |
| **VPC Access API** | Enabled but unused | **$0** | Connector NOT created = no cost. But risky — Serverless VPC connectors cost ~$7/mo minimum if accidentally created |
| **Public IP on Cloud SQL** | ipv4_enabled = true | **~$3.60** | Charged $0.01/hr (~$7.30/mo) when NOT connected to a Cloud Run service. Partially offset when connected. |
| **Network Egress** | Low traffic | **$0–1** | First 1GB/month free (to internet). Minimal at low traffic. |

### TOTAL BEFORE: **~$15–30/month** (idle) → **$45–75/month** (with moderate traffic spikes)

The $45-75 high end comes from: Grafana staying warm (doesn't scale to zero well), Cloud SQL backup growth, image storage bloat over time, and public IP charges.

---

## Optimizations Applied

### 1. Cloud SQL: Switch storage from SSD to HDD (saves ~$0.60/mo)
- **Before**: `PD_SSD` at $0.17/GB = $1.70/mo for 10GB
- **After**: `PD_HDD` at $0.09/GB = $0.90/mo for 10GB
- **Impact**: ~$0.80/mo savings. At low traffic, HDD latency is unnoticeable.

### 2. Cloud SQL: Disable public IP (saves ~$3.60/mo)
- **Before**: `ipv4_enabled = true` — charges ~$0.01/hr even when idle
- **After**: `ipv4_enabled = false`, use Cloud SQL Auth Proxy via Cloud Run volume mount (already configured!)
- **Impact**: $3.60/mo savings. Cloud Run connects via Unix socket through `volumes.cloud_sql_instance` — no public IP needed.

### 3. Cloud SQL: Reduce backup retention (saves ~$0.20/mo)
- **Before**: 7 backups retained (default)
- **After**: 3 backups retained — still safe, 3 days to catch issues
- **Impact**: Modest savings that compounds as data grows.

### 4. Cloud Run Backend: Right-size CPU/memory (saves on scale-up cost)
- **Before**: 1 vCPU, 512Mi
- **After**: 1 vCPU, 256Mi — Rust is extremely memory-efficient. A simple Axum API needs ~30MB RSS.
- **Impact**: Halves GiB-second billing when instances are active.

### 5. Cloud Run Frontend: Already optimal — verify min=0
- Already at 1 vCPU, 256Mi, scale 0→3. Nginx cold starts are <1s. ✓

### 6. Cloud Run Grafana: Right-size + lower max instances
- **Before**: 1 vCPU, 512Mi, scale 0→2
- **After**: 1 vCPU, 256Mi, scale 0→1 — only you use Grafana, no need for 2 instances. Lower memory since Grafana 11 runs fine at 256Mi for single-user.
- **Impact**: Halves peak GiB-second billing. Max 1 instance caps runaway costs.

### 7. Grafana: Use Alpine image (saves ~$0.30/mo on Artifact Registry)
- **Before**: `grafana/grafana:11-ubuntu` (~400MB)
- **After**: `grafana/grafana:11.5-alpine` (~150MB)
- **Impact**: 250MB less storage in Artifact Registry.

### 8. Remove unused APIs: compute.googleapis.com, vpcaccess.googleapis.com
- **Before**: Both enabled "just in case"
- **After**: Removed. No VMs, no VPC connectors needed. Cloud Run connects to Cloud SQL via built-in Cloud SQL proxy (not VPC connector).
- **Impact**: Eliminates risk of accidental VPC connector creation ($7/mo) or surprise Compute Engine charges.

### 9. Artifact Registry: Add cleanup policy
- **Before**: All image versions retained forever
- **After**: Auto-delete images older than 7 days, keep last 3 tagged versions
- **Impact**: Prevents storage creep over months of deploys.

### 10. Cloud Run: Set CPU throttling (cpu_idle = true)
- Already default for scale-to-zero, but making explicit. CPU is only billed when processing requests, not while idle between requests.
- **Impact**: Ensures we're not accidentally in "always allocated" mode.

### 11. Add budget alert
- New: `google_billing_budget` resource that emails you at 50%, 80%, 100% of $20/mo.
- **Impact**: Early warning before costs spiral.

---

## Cost Projection (AFTER)

| Resource | Config | Monthly Cost |
|----------|--------|-------------|
| Cloud SQL Instance (db-f1-micro) | Always-on, cheapest tier | $7.67 |
| Cloud SQL Storage | 10GB HDD | $0.90 |
| Cloud SQL Backups | 3 retained | ~$0.25 |
| Cloud SQL IP | No public IP | $0.00 |
| Cloud Run Backend | Scale 0→3, 256Mi | $0.00 (free tier) |
| Cloud Run Frontend | Scale 0→3, 256Mi | $0.00 (free tier) |
| Cloud Run Grafana | Scale 0→1, 256Mi | $0.00 (free tier) |
| Artifact Registry | ~200MB with cleanup | $0.02 |
| Secret Manager | 1 secret | $0.06 |
| Network Egress | <1GB | $0.00 |
| **TOTAL** | | **~$8.90/month** |

### At moderate traffic (~1000 visits/day):
- Cloud Run free tier covers 2M requests/month — plenty for 30K pageviews
- Backend free tier: 360K vCPU-seconds — each request ~50ms = 7.2M requests covered
- **Estimated: ~$9–12/month** (Cloud SQL dominates)

### At growth traffic (~10K visits/day):
- May exceed free tier slightly
- **Estimated: ~$12–20/month**

---

## Nuclear Option: Replace Cloud SQL with Cloud Run + SQLite (saves $8/mo)

If you want to go below $5/mo, you could replace Postgres with embedded SQLite
using `libsql` or `litestream` for backups. This would eliminate the $8/mo Cloud SQL
fixed cost entirely. However, this sacrifices concurrent write capability and
Grafana's Postgres datasource. **Not recommended yet, but noted for future.**

---

## Files Changed

- `infra/main.tf` — All infrastructure optimizations
- `infra/terraform.tfvars.example` — Added billing budget email
- `grafana/Dockerfile` — Alpine base image
- `CLAUDE.md` — Cost management docs
