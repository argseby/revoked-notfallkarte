# syntax=docker/dockerfile:1

# ---- build ------------------------------------------------------------------
FROM node:22-alpine AS build
WORKDIR /src
COPY package.json package-lock.json ./
RUN --mount=type=cache,target=/root/.npm npm ci
COPY . .
RUN npm run build

# ---- runtime ----------------------------------------------------------------
# Static files only, and no settings: the page talks to no server.
FROM nginx:1.29-alpine
COPY --from=build /src/dist /usr/share/nginx/html
COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY nginx/security_headers.inc.template /etc/nginx/templates/security_headers.inc.template
# The templates hold no variables of ours; the filter keeps envsubst from
# blanking nginx's own ($uri).
ENV NGINX_ENVSUBST_FILTER=^REVOKED_
EXPOSE 8080
# wget is busybox's, already in the image.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8080/ >/dev/null || exit 1
