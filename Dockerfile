# syntax=docker/dockerfile:1
#
# Stages
#   build    install deps (npm ci once package-lock.json is committed) + tsc -b + vite build -> dist/
#   runtime  unprivileged nginx (non-root, port 8080) serving dist/ and proxying /api + /socket.io
#
# The backend address is NOT baked into the image: set BACKEND_UPSTREAM at run time
# (docker/nginx/default.conf.template is rendered by the nginx entrypoint on start).
# VITE_* variables ARE baked at build time - they are public, never put secrets in them.

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json* ./
# npm runs the "prepare" script (git hook installer; a no-op without .git) - it must exist in the image.
COPY scripts/git-hooks.mjs ./scripts/
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi
COPY . .
# Public build-time config (bundled into the JS): passed by CI from the repository's Actions VARIABLES
# (set by terraform/tf-rtfe from rt-fe/.env). Unset or empty -> safe defaults. Never pass secrets here.
ARG VITE_API_BASE_URL
ARG VITE_DEFAULT_LOCALE
ENV VITE_API_BASE_URL=${VITE_API_BASE_URL:-/api}
ENV VITE_DEFAULT_LOCALE=${VITE_DEFAULT_LOCALE:-en}
RUN npm run build

# Mainline nginx (security fixes land here first; 1.30 stable lagged a CRITICAL fix on 2026-11-20). OS packages upgraded at build time so fixable CVEs do not wait for a new base tag
# (the Trivy gate fails on fixable CRITICAL). The image runs as the unprivileged nginx user (uid 101).
FROM nginxinc/nginx-unprivileged:1.31-alpine AS runtime
USER root
RUN apk upgrade --no-cache
USER 101
ENV BACKEND_UPSTREAM=http://backend:4000
COPY --from=build /app/dist /usr/share/nginx/html
COPY docker/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY docker/nginx/security-headers.conf /etc/nginx/snippets/security-headers.conf
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/healthz >/dev/null 2>&1 || exit 1
