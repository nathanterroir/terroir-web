FROM rust:1.93-bookworm AS builder
WORKDIR /app
COPY Cargo.toml Cargo.lock* ./
RUN mkdir src && echo "fn main() {}" > src/main.rs && \
    mkdir -p src/api && echo "" > src/api/mod.rs && \
    cargo build --release 2>/dev/null || true
RUN rm -rf src
COPY src/ src/
COPY migrations/ migrations/
RUN cargo build --release --bin terroir-api

FROM debian:bookworm-slim
RUN apt-get update && apt-get install -y ca-certificates && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /app/target/release/terroir-api .
COPY --from=builder /app/migrations ./migrations
ENV PORT=8080
EXPOSE 8080
CMD ["./terroir-api"]
