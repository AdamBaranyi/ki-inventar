#!/usr/bin/env bash
# Prüft die Abhängigkeiten. Aufruf: bash scripts/audit.sh high|moderate
#
# Eine Stelle für Stufe und Ausnahmen: ci.yml ruft es mit «high» und blockiert,
# der tägliche Lauf mit «moderate» und meldet nur (scripts/sicherheits-meldung.sh).
# Der Exit-Code ist der von bun audit: 0 heisst sauber ab dieser Stufe, alles
# andere heisst Befund oder eine Prüfung, die nicht stattfand.
#
# Jede Ausnahme steht hier mit Kennung, Grund und «prüfen bis TT.MM.JJJJ» und ist
# in docs/SECURITY.md begründet. Ziel ist eine leere Liste.
set -euo pipefail
stufe="${1:-high}"
case "$stufe" in
  low | moderate | high | critical) ;;
  *)
    echo "Unbekannte Stufe «$stufe» (low, moderate, high, critical)." >&2
    exit 2
    ;;
esac
ausnahmen=()
# bun audit 1.3.14 färbt auch in Dateien und Pipes, NO_COLOR wirkt nicht. Die
# Farbcodes gehen hier weg, damit CI-Protokoll, Laufzusammenfassung und das Issue
# lesbar bleiben; pipefail oben hält dabei den Exit-Code von bun audit. Das
# Escape-Zeichen kommt aus printf, so läuft sed mit GNU und BSD gleich.
esc=$(printf '\033')
# Die Form mit «+» hält die leere Liste aus: Bash vor 4.4 bricht sonst mit
# «unbound variable» ab.
bun audit --audit-level="$stufe" ${ausnahmen[@]+"${ausnahmen[@]}"} 2>&1 | sed "s/${esc}\[[0-9;]*m//g"
echo "Keine offenen Befunde ab $stufe."
