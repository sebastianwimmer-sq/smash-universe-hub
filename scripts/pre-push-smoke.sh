#!/usr/bin/env bash
# PEAKING / smash-universe-hub Pre-Push Smoke-Test (07.05.2026)
# Cross-Repo-Pattern aus SMASH ported. Bridge bis Cloudflare-Pages-Staging steht.
#
# Usage:
#   bash scripts/pre-push-smoke.sh
# Oder als git hook: bash scripts/install-hook.sh

set -e
cd "$(dirname "$0")/.."

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

ERRORS=0
WARNINGS=0

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}🔬 PEAKING Pre-Push Smoke-Test${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# ─── 1. HTML-Balance & Critical Tags ───────────────────────────
echo -e "\n${BLUE}▸ 1/4 HTML-Struktur${NC}"
for f in index.html insta/index.html insta/dashboard.html insta/links.html; do
  if [[ ! -f "$f" ]]; then continue; fi
  open=$(grep -oE "<div\b" "$f" | wc -l | tr -d ' ')
  close=$(grep -oE "</div>" "$f" | wc -l | tr -d ' ')
  if [[ "$open" != "$close" ]]; then
    echo -e "  ${YELLOW}⚠ $f: $open <div> vs $close </div> — diff $((open-close))${NC}"
    WARNINGS=$((WARNINGS+1))
  else
    echo -e "  ${GREEN}✓ $f: $open <div> balanced${NC}"
  fi
done

# ─── 2. Critical-Files-Check ──────────────────────────────────
echo -e "\n${BLUE}▸ 2/4 Critical Files${NC}"
for f in CNAME insta/index.html insta/sw.js insta/manifest.json privacy/index.html press/index.html; do
  if [[ -f "$f" ]]; then
    echo -e "  ${GREEN}✓ $f${NC}"
  else
    echo -e "  ${YELLOW}⚠ Missing: $f${NC}"
    WARNINGS=$((WARNINGS+1))
  fi
done

# ─── 3. Internal-Link-Check ───────────────────────────────────
echo -e "\n${BLUE}▸ 3/4 Internal Link Check${NC}"
PAGES=("index.html" "insta/index.html" "insta/links.html")
broken=0
for p in "${PAGES[@]}"; do
  if [[ ! -f "$p" ]]; then continue; fi
  while IFS= read -r link; do
    file=$(echo "$link" | sed 's/[?#].*//')
    if [[ -z "$file" || "$file" == "#" || "$file" == "/" ]]; then continue; fi
    if [[ "$file" == "http"* || "$file" == "mailto:"* || "$file" == "tel:"* ]]; then continue; fi
    if [[ "$file" == "/"* ]]; then file="${file:1}"; fi
    if [[ "$file" == *".html" && ! -f "$file" && ! -f "$(dirname "$p")/$file" ]]; then
      echo -e "  ${YELLOW}⚠ $p → broken: $file${NC}"
      broken=$((broken+1))
    fi
  done < <(grep -oE 'href="[^"]+"' "$p" | sed 's/href="//;s/"$//')
done
if [[ "$broken" -eq 0 ]]; then
  echo -e "  ${GREEN}✓ Keine broken Internal Links${NC}"
else
  WARNINGS=$((WARNINGS+broken))
fi

# ─── 4. Service-Worker-Check ──────────────────────────────────
echo -e "\n${BLUE}▸ 4/4 Service-Worker${NC}"
if [[ -f "insta/sw.js" ]]; then
  swsize=$(wc -c < insta/sw.js | tr -d ' ')
  echo -e "  ${GREEN}✓ insta/sw.js (${swsize} bytes)${NC}"
else
  echo -e "  ${YELLOW}⚠ kein insta/sw.js gefunden${NC}"
  WARNINGS=$((WARNINGS+1))
fi

# ─── Summary ───────────────────────────────────────────────────
echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [[ "$ERRORS" -gt 0 ]]; then
  echo -e "${RED}✗ $ERRORS ERROR(S) — Push BLOCKED${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 1
elif [[ "$WARNINGS" -gt 0 ]]; then
  echo -e "${YELLOW}⚠ $WARNINGS WARNING(S) — Push erlaubt${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 0
else
  echo -e "${GREEN}✓ Alles clean — ready to push 🚀${NC}"
  echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  exit 0
fi
