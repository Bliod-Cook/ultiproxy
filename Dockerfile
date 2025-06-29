# Multi-stage build for Rust backend
FROM rust:1.83-alpine AS builder

# Install build dependencies
RUN apk add --no-cache musl-dev pkgconfig openssl-dev

# Set working directory
WORKDIR /app

# Copy dependency files first for better caching
COPY Cargo.toml Cargo.lock ./

# Create a dummy main.rs to build dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs

# Build dependencies (this layer will be cached)
RUN cargo build --release && rm -rf src

# Copy source code
COPY src ./src

# Build the application
RUN cargo build --release

# Runtime stage
FROM alpine:latest AS runtime

# Install runtime dependencies
RUN apk add --no-cache ca-certificates

# Create non-root user
RUN addgroup -g 1001 -S ultiproxy && \
    adduser -S -D -H -u 1001 -s /sbin/nologin -G ultiproxy ultiproxy

# Set working directory
WORKDIR /app

# Copy binary from builder stage
COPY --from=builder /app/target/release/ultiproxy /app/ultiproxy

# Copy configuration and examples
COPY config ./config
COPY examples ./examples

# Change ownership to non-root user
RUN chown -R ultiproxy:ultiproxy /app

# Switch to non-root user
USER ultiproxy

# Expose port
EXPOSE 8080

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/health || exit 1

# Run the application
CMD ["./ultiproxy"]