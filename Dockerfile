# ── Stage 1: install production dependencies ──────────────────────────────────
FROM node:18-alpine AS deps

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --only=production && npm cache clean --force

# ── Stage 2: final application image ──────────────────────────────────────────
FROM node:18-alpine AS app

WORKDIR /app

# Copy production node_modules from the deps stage
COPY --from=deps /app/node_modules ./node_modules

# Copy application source and entrypoint
COPY src /app/src
COPY package.json /app/package.json
COPY entrypoint.sh /app/entrypoint.sh

# Pre-create all required directories and set up non-root user.
# All upload subdirectories are created here so volume mounts from the host
# do not need to be pre-initialised by the user — Docker will merge the
# container's empty directories with the host mount point.
#
# sed strips Windows CRLF line endings from entrypoint.sh so the image builds
# correctly whether the source files were copied on Windows or Linux.
RUN sed -i 's/\r$//' /app/entrypoint.sh && \
    mkdir -p \
      uploads/products \
      uploads/categories \
      uploads/hero \
      uploads/requests \
      logs && \
    addgroup -g 1001 -S nodejs && \
    adduser  -S nodeuser -u 1001 -G nodejs && \
    chown -R nodeuser:nodejs /app && \
    chmod +x /app/entrypoint.sh

USER nodeuser

EXPOSE 3000

# Health check — passes once the app is connected to MongoDB
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# Entrypoint seeds data and starts the server automatically
ENTRYPOINT ["/app/entrypoint.sh"]
