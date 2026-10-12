#!/bin/sh
# Rollt das KI-Inventar auf vps1 aus. Führt Adam aus:
#   sudo /opt/ki-inventar/infra/deploy.sh [commit]
# Ohne Commit gilt der Stand von origin/main. Daten gibt es auf dem Server
# keine: Alles, was jemand erfasst, liegt in seinem Browser.
set -eu

cd /opt/ki-inventar
git fetch --quiet origin
git checkout --quiet --detach "${1:-origin/main}"
KI_INVENTAR_VERSION=$(git rev-parse --short HEAD)
export KI_INVENTAR_VERSION

docker compose -f infra/compose.prod.yml up -d --build --remove-orphans

# Abnahme: Der Dienst muss im Netz des Proxys antworten.
for _ in $(seq 1 30); do
  if docker compose -f infra/compose.prod.yml exec -T web wget -q -O /dev/null http://127.0.0.1:8080/; then
    echo "KI-Inventar $KI_INVENTAR_VERSION läuft."
    exit 0
  fi
  sleep 1
done
echo "KI-Inventar $KI_INVENTAR_VERSION antwortet nicht. Protokoll: docker compose -f infra/compose.prod.yml logs web" >&2
exit 1
