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
# Die Form mit «+» hält die leere Liste aus: Bash vor 4.4 bricht sonst mit
# «unbound variable» ab.
bun audit --audit-level="$stufe" ${ausnahmen[@]+"${ausnahmen[@]}"}
echo "Keine offenen Befunde ab $stufe."
