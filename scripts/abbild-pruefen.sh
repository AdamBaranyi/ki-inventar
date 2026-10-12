#!/usr/bin/env bash
# Baut das Produktionsabbild und prüft es von aussen, so wie es auf dem Server
# läuft: nur lesbar, ohne Rechte, als Benutzer ohne Namen. Geprüft werden die
# App, tiefe Links, die Kopfzeilen, der Cache und die Schrift.
# Aufruf: bash scripts/abbild-pruefen.sh   (braucht Docker)
set -euo pipefail

NAME=ki-inventar-pruefung
PORT=${PORT:-18080}
BASIS="http://127.0.0.1:$PORT"

docker build --quiet -f infra/Dockerfile -t ki-inventar-web:pruefung . >/dev/null
docker rm -f "$NAME" >/dev/null 2>&1 || true
docker run -d --name "$NAME" --read-only --tmpfs /tmp --user 65534:65534 --cap-drop ALL \
  --security-opt no-new-privileges:true -p "127.0.0.1:$PORT:8080" ki-inventar-web:pruefung >/dev/null
trap 'docker rm -f "$NAME" >/dev/null 2>&1 || true' EXIT

for _ in $(seq 1 30); do
  curl -sf -o /dev/null "$BASIS/" && break
  sleep 1
done

fehler=0
pruefe() {
  local beschreibung=$1
  shift
  if "$@"; then
    echo "ok      $beschreibung"
  else
    echo "FEHLER  $beschreibung"
    fehler=1
  fi
}
enthaelt() { grep -qi -- "$2" <<<"$1"; }
fehlt() { ! grep -qi -- "$2" <<<"$1"; }

start=$(curl -s -D - -o /dev/null "$BASIS/")
seite=$(curl -s "$BASIS/")
tief=$(curl -s -D - "$BASIS/werkzeug/gibt-es-nicht/bearbeiten?frage=3")
skript=$(grep -o 'main-[A-Za-z0-9_-]\{8\}\.js' <<<"$seite" | head -1)
schrift=$(curl -s "$BASIS/$(grep -o 'styles-[A-Za-z0-9_-]\{8\}\.css' <<<"$seite" | head -1)" |
  grep -o 'media/mona-sans-latin-standard-normal-[A-Za-z0-9_-]\{8\}\.woff2' | head -1)

pruefe "Startseite mit Status 200" enthaelt "$start" '^HTTP/1.1 200'
pruefe "Basis ist die eigene Adresse" enthaelt "$seite" '<base href="/">'
pruefe "Tiefer Link liefert die App" enthaelt "$tief" '<ki-root>'
pruefe "CSP mit frame-ancestors" enthaelt "$start" "^content-security-policy:.*frame-ancestors 'none'"
pruefe "CSP ohne unsafe-inline" fehlt "$start" 'unsafe-inline'
pruefe "nosniff" enthaelt "$start" '^x-content-type-options: nosniff'
pruefe "Kein Referrer" enthaelt "$start" '^referrer-policy: no-referrer'
pruefe "Kein Rahmen" enthaelt "$start" '^x-frame-options: DENY'
pruefe "Permissions-Policy" enthaelt "$start" '^permissions-policy: camera=()'
pruefe "Kein Server-Name" fehlt "$start" '^server:'
pruefe "index.html wird jedes Mal geprüft" enthaelt "$start" '^cache-control: no-cache'
pruefe "Skript mit Hash bleibt ein Jahr" enthaelt "$(curl -s -D - -o /dev/null "$BASIS/$skript")" 'max-age=31536000, immutable'
pruefe "Schrift kommt vom eigenen Server" enthaelt "$(curl -s -D - -o /dev/null "$BASIS/$schrift")" '^content-type: font/woff2'
pruefe "Lizenz der Schrift liegt bei" enthaelt "$(curl -s "$BASIS/schrift-lizenz.txt")" 'SIL OPEN FONT LICENSE'

exit "$fehler"
