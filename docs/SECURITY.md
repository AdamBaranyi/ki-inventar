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
  Kennungen ergänzt wird und bei sauberem Stand offen bleibt und «keine Befunde» sagt (seit
  25.10.2026; Schliessen und Neuanlegen hiess jedes Mal zuweisen und mailen). Rot wird der tägliche
  Lauf nur bei einem
  Geheimnis oder wenn die Prüfung nicht stattfand (Exit-Code ohne Kennung, etwa ohne Netz).
- Als «das Issue» zählt nur eines, das der Bot des Workflows angelegt hat (`app/github-actions`) und
  das das Label `sicherheit` trägt. Ein gleichnamiges Issue eines anderen Kontos bleibt unberührt.
- GitHub liest `bun.lock` nicht; Dependabot macht für Bun nur Versions-Updates. Der einzige Alarm
  für Sicherheitslücken in Paketen ist darum `bun audit`.
- Dependabot: Bun wöchentlich (Minor und Patch als ein Sammel-PR), GitHub Actions monatlich, beide
  mit sieben Tagen Wartezeit. Actions sind auf Commits festgelegt.
- Die Skripte sind im Ablauf getestet (`scripts/sicherheit.test.mjs`, `gh` und `bun` als Attrappen),
  die Schritte des Tageslaufs ebenso, mit ihrem `run`-Block aus dem Workflow
  (`scripts/tageslauf.test.mjs`).
- bun audit färbt seine Ausgabe auch in Dateien. `scripts/audit.sh` und die Ansicht im Tageslauf
  entfernen die Farbcodes, damit CI-Protokoll, Laufzusammenfassung und Issue lesbar bleiben; der
  Exit-Code von bun audit bleibt dabei erhalten (`pipefail`).

### Ausnahmen

Keine. Eine Ausnahme bekäme hier eine Zeile mit Kennung, Paket, Grund und «prüfen bis»; der Test in
`scripts/sicherheit.test.mjs` hält diese Tabelle und `scripts/audit.sh` deckungsgleich.

| Kennung | Paket | Grund | prüfen bis |
| ------- | ----- | ----- | ---------- |

### Overrides

| Paket  | Fassung | Grund                                                                                                                                                                                                                                                                              | prüfen bis |
| ------ | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- |
| `vite` | 8.3.4   | `@angular/build` 22.2.2 legt vite fest auf 8.3.0; GHSA-587h-7wmj-h5pm (launch-editor, high) ist erst ab 8.3.3 behoben. Nur Werkzeug: Der Build ist mit und ohne Override gleich (29 von 29 Prüfsummen in `dist`, 21.10.2026). Weg, sobald `@angular/build` vite ab 8.3.3 festlegt. | 21.11.2026 |
| `zod`  | 4.6.6   | `@angular/cli` 22.2.2 legt zod fest auf 4.6.5; GHSA-mrhx-c7xc-m3w5 (Speicher bei überlangen Listen, high) ist ab 4.6.6 behoben. Nur Werkzeug: zod der Anwendung selbst steht schon auf 4.6.6. Weg, sobald `@angular/cli` zod ab 4.6.6 festlegt.                                    | 25.11.2026 |

## Behobene Befunde

### Lockvogel-Issue konnte den täglichen Alarm stumm schalten · behoben 21.10.2026

`scripts/sicherheits-meldung.sh` nahm das neueste offene Issue mit dem Titel «Sicherheitsmeldungen».
Im öffentlichen Repo kann jedes Konto so ein Issue eröffnen und seinen Text mit der Markierung des
aktuellen Stands füllen; die Markierung lässt sich aus den öffentlichen Kennungen nachrechnen. Der
Lauf hätte dann jede neue Meldung für bekannt gehalten und geschwiegen, bei einem sauberen Lauf das
fremde Issue geschlossen. Für die Bun-Abhängigkeiten ist das der einzige Alarm. Gefunden in
Evidarium bei der Prüfung nach security-guidance, hier übernommen.

**Behoben:** Gezählt wird nur ein Issue vom Bot dieses Workflows mit dem Label `sicherheit`; Labels
setzen Konten ohne Rechte nicht. Gefiltert wird weiter erst nach dem Lesen, ohne Suchindex. Die
gh-Attrappe führt fremde Issues und liefert wie gh das neueste zuerst und nur die verlangten Felder.
Fünf Tests mit fremden Issues; ohne Autor- oder Label-Prüfung wird je einer rot.

## Geheimnisse

Das Repo enthält keine. gitleaks prüft die ganze Historie in der CI und täglich.

## Melden

Eine Lücke bitte nicht als öffentliches Issue, sondern über die Kontaktadresse im Impressum von
[adambaranyi.xyz](https://adambaranyi.xyz/de/impressum/) melden.
