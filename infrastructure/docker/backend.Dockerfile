# syntax=docker/dockerfile:1
# Backend image — multi-stage (docs/docker.md §2). Build context = repo root.
# bookworm-slim (glibc) is used over alpine so argon2's prebuilt binaries load
# without a from-source compile.

FROM node:22-bookworm-slim AS base
WORKDIR /app

# --- Build: full install + tsc ---
FROM base AS build
ENV NODE_ENV=development
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci
COPY tsconfig.base.json ./
COPY backend ./backend
RUN npm run build --workspace backend

# --- Prod dependencies only ---
FROM base AS prod-deps
ENV NODE_ENV=production
COPY package.json package-lock.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
RUN npm ci --omit=dev

# --- Runtime ---
FROM base AS runtime
ENV NODE_ENV=production PORT=3000
COPY --from=prod-deps /app/node_modules ./node_modules
COPY --from=build /app/backend/dist ./backend/dist
COPY backend/package.json ./backend/package.json
COPY package.json ./package.json

USER node
EXPOSE 3000
# Liveness via the app's own /health (Node 22 has global fetch — no curl needed).
HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD node -e "fetch('http://localhost:'+(process.env.PORT||3000)+'/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "backend/dist/main.js"]
