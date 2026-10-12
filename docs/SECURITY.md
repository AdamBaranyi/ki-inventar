# Sicherheit

Das KI-Inventar ist eine statische Seite ohne Server, ohne Konto und ohne Datenübermittlung. Was
jemand eingibt, bleibt im `localStorage` seines Browsers. Die Angriffsfläche ist darum klein; dieses
Dokument hält fest, was trotzdem gilt und wie es geprüft wird.

## Im Browser

- **Content Security Policy** als `<meta>` in `src/index.html`:
  `default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; object-src 'none'; base-uri 'self'; form-action 'none'`.
  Keine Inline-Skripte, keine Inline-Stile. Darum haben Komponenten keine eigenen Stile (Angular
  legt sie zur Laufzeit als `<style>` an), sondern alle Stile liegen als Dateien unter `src/styles`
  und neben den Komponenten und werden über `src/styles.css` gebündelt. `inlineCritical` ist aus,
  weil das kritische CSS sonst inline und mit `onload` käme. Zod läuft mit `jitless`, sonst meldet
  die CSP den Versuch mit `new Function`. `subresourceIntegrity` ist aus: Die Option legt eine
  Import-Map als Inline-Skript an, die die CSP blockiert; bei Skripten vom selben Ursprung bringt
  sie wenig.
- **Geprüft** in `e2e/`: Auf jedem Bildschirm keine CSP-Verstösse und keine Anfrage an einen fremden
  Ursprung. Gegenprobe: eingeschleustes HTML mit Ereignis-Handler wird blockiert und gemeldet.
- **Keine Netzaufrufe zur Laufzeit.** Schrift (Mona Sans) liegt im Repo, keine CDN, kein Tracking.
- **Eingaben** prüft Zod beim Laden aus dem Speicher und beim Wiederherstellen einer Sicherung; der
  Dienst speichert nur, was dem Schema entspricht. Unlesbare Daten werden nie überschrieben, sondern
  beim Neubeginn unter `ki-inventar-unlesbar` beiseitegelegt.
- **CSV-Export** entschärft Formeln: Felder, die mit `=`, `+`, `-`, `@`, Tab oder Wagenrücklauf
  beginnen, bekommen ein Apostroph davor (`src/app/fach/csv.ts`, mit Tests).
- **Kopfzeilen** setzt auf vps1 (`ki-inventar.adambaranyi.xyz`) der Caddy im Abbild
  (`infra/Caddyfile`): CSP als Kopfzeile mit `frame-ancestors 'none'`, `nosniff`,
  `Referrer-Policy: no-referrer`, `Permissions-Policy`, COOP, CORP, `X-Frame-Options: DENY`, kein
  `Server`. TLS und HSTS kommen vom vorgelagerten Caddy (Tallyroom). GitHub Pages kann keine
  Kopfzeilen setzen; dort gilt nur die CSP im Meta-Tag.
- **Abbild:** läuft nur lesbar, als Benutzer 65534, mit `cap_drop: ALL`, `no-new-privileges`,
  128 MB und 64 Prozessen; Caddy ohne Datei-Capability, Verwaltungsschnittstelle aus. Die CI baut
  es bei jedem Push und prüft es von aussen (`scripts/abbild-pruefen.sh`); drei Sabotagen
  verlangen, dass diese Prüfung rot wird.

## Abhängigkeiten

- `bunfig.toml`: neue Fassungen erst nach sieben Tagen (`minimumReleaseAge = 604800`), Fassungen fest
  eingetragen (`exact = true`).
- `scripts/audit.sh` ist die eine Stelle für Stufe und Ausnahmen. Die CI ruft es bei Push und Pull
  Request mit `high` und blockiert. Der tägliche Lauf (`sicherheit-taeglich.yml`) ruft es mit
  `moderate` und meldet nur: Befunde kommen in ein Issue «Sicherheitsmeldungen», das bei geänderten
  Kennungen ergänzt und bei sauberem Stand geschlossen wird. Rot wird der tägliche Lauf nur bei einem
  Geheimnis oder wenn die Prüfung nicht stattfand (Exit-Code ohne Kennung, etwa ohne Netz).
- GitHub liest `bun.lock` nicht; Dependabot macht für Bun nur Versions-Updates. Der einzige Alarm
  für Sicherheitslücken in Paketen ist darum `bun audit`.
- Dependabot: Bun wöchentlich (Minor und Patch als ein Sammel-PR), GitHub Actions monatlich, beide
  mit sieben Tagen Wartezeit. Actions sind auf Commits festgelegt.
- Die Skripte sind im Ablauf getestet (`scripts/sicherheit.test.mjs`, `gh` und `bun` als Attrappen).

### Ausnahmen

Keine. Eine Ausnahme bekäme hier eine Zeile mit Kennung, Paket, Grund und «prüfen bis»; der Test in
`scripts/sicherheit.test.mjs` hält diese Tabelle und `scripts/audit.sh` deckungsgleich.

| Kennung | Paket | Grund | prüfen bis |
| ------- | ----- | ----- | ---------- |

## Geheimnisse

Das Repo enthält keine. gitleaks prüft die ganze Historie in der CI und täglich.

## Melden

Eine Lücke bitte nicht als öffentliches Issue, sondern über die Kontaktadresse im Impressum von
[adambaranyi.xyz](https://adambaranyi.xyz/de/impressum/) melden.
