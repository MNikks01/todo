# syntax=docker/dockerfile:1
# Frontend image — build the SPA, serve it with nginx (docs/docker.md §3).
# Build context = repo root. VITE_API_BASE_URL is baked at build time (Vite
# inlines it); override per environment via build-arg.

FROM node:26-bookworm-slim AS build
WORKDIR /app
ARG VITE_API_BASE_URL=http://localhost:3000/api/v1
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
COPY package.json package-lock.json ./
COPY frontend/package.json frontend/package.json
COPY backend/package.json backend/package.json
RUN npm ci
COPY tsconfig.base.json ./
COPY frontend ./frontend
RUN npm run build --workspace frontend

FROM nginx:1.27-alpine AS runtime
COPY infrastructure/docker/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/frontend/dist /usr/share/nginx/html
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -qO- http://localhost/ >/dev/null 2>&1 || exit 1
