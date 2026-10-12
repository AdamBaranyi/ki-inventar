# Produktionsabbild des KI-Inventars: Build mit Node und Bun, Auslieferung mit Caddy.
# Gebaut wird auf dem Server (infra/deploy.sh) und in der CI (scripts/abbild-pruefen.sh).
ARG NODE_VERSION=24.15.0
ARG BUN_VERSION=1.3.14
ARG CADDY_VERSION=2.11.4

FROM oven/bun:${BUN_VERSION}-slim AS bun

FROM node:${NODE_VERSION}-slim AS bau
COPY --from=bun /usr/local/bin/bun /usr/local/bin/bun
WORKDIR /app
COPY package.json bun.lock bunfig.toml ./
RUN bun install --frozen-lockfile
COPY angular.json tsconfig.json tsconfig.app.json ./
COPY public ./public
COPY src ./src
# Eigene Adresse statt Unterordner wie bei GitHub Pages.
RUN node_modules/.bin/ng build --base-href /

FROM caddy:${CADDY_VERSION}-alpine
# Port 8080 braucht keine Sonderrechte; ohne Datei-Capability startet Caddy
# auch mit cap_drop ALL und als Benutzer ohne Rechte.
RUN setcap -r /usr/bin/caddy
ENV XDG_DATA_HOME=/tmp/caddy-daten XDG_CONFIG_HOME=/tmp/caddy-einstellungen
COPY infra/Caddyfile /etc/caddy/Caddyfile
COPY --from=bau /app/dist/ki-inventar/browser /srv
USER 65534:65534
EXPOSE 8080
CMD ["caddy", "run", "--config", "/etc/caddy/Caddyfile", "--adapter", "caddyfile"]
