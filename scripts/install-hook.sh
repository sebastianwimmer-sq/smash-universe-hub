#!/usr/bin/env bash
# Installiert den Smoke-Test als git pre-push-hook für PEAKING / smash-universe-hub.

set -e
cd "$(dirname "$0")/.."

HOOK_DIR=".git/hooks"
HOOK_FILE="$HOOK_DIR/pre-push"

if [[ ! -d "$HOOK_DIR" ]]; then
  echo "✗ Kein .git/hooks gefunden. Bist du im Repo?"
  exit 1
fi

cat > "$HOOK_FILE" <<'EOF'
#!/usr/bin/env bash
bash "$(git rev-parse --show-toplevel)/scripts/pre-push-smoke.sh"
EOF

chmod +x "$HOOK_FILE"
chmod +x "$(dirname "$0")/pre-push-smoke.sh"

echo "✓ pre-push hook installed at $HOOK_FILE"
echo "✓ Test läuft jetzt automatisch vor jedem 'git push'."
echo ""
echo "Manuell triggern:  bash scripts/pre-push-smoke.sh"
echo "Hook entfernen:    rm .git/hooks/pre-push"
