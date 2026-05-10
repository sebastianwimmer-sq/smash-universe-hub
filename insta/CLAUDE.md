# PEAKING — Personal Insta-Tracking-Tool für Solo-Creators

> **Tagline:** Always peaking.
> **Sub-Tagline:** The climb is the peak.
> **Live (primary):** https://peaking.world (DNS propagating)
> **Live (mirror):** https://smashuniverse.info/insta
> **Insta:** [@peakingworld](https://instagram.com/peakingworld)
> **Repo (primary):** github.com/sebastianwimmer-sq/peaking-world
> **Repo (mirror):** github.com/sebastianwimmer-sq/smash-universe-hub
> **Source-Repo (lokal, kein Git):** `~/smash-insta-manager/`
> **Brand-SSoT:** [`assets/BRAND.md`](assets/BRAND.md)

Personal Influencer-Management-Tool. Track Reels, plan Content, finde Hooks — alles in einer passwort-geschützten Static-App. Solo built mit Claude Code in 1 Tag (06.05.2026), Naming/Brand-Pivot von „Smash IG Manager" → „PEAKING" am gleichen Tag.

**Status (06.05.2026, 08:30):** v1.2 — alle 8 Module live, Multi-Account-Support, Sunrise-Brand, Growth-Center für @peakingworld Bootstrap. DNS für peaking.world propagiert noch. Erstes @peakingworld-Reel pending.

---

## 📋 Inhaltsverzeichnis

1. [Stack](#stack)
2. [Dateien-Struktur](#dateien-struktur)
3. [Brand-Kodex](#brand-kodex-verpflichtend)
4. [Module (live)](#module-live)
5. [Multi-Account-System](#multi-account-system)
6. [Deploy-Workflow](#deploy-workflow)
7. [Roadmap](#roadmap)
8. [Cross-Project (SMASH)](#cross-project-smash)
9. [Anti-Patterns](#anti-patterns)
10. [Quick-Refs](#quick-refs)

---

## Stack

- **Frontend:** Static HTML/CSS/JS, **kein Build-Step** (United-Domains/GH-Pages-tauglich)
- **CSS:** Tailwind via CDN + custom `assets/effects.css` für Glow + Animations
- **Charts:** Chart.js via CDN (nur in `tracker.html` + `analytics.html`)
- **Storage:** localStorage (Multi-Account-prefixed: `smash:<account>:<key>`)
- **Auth:** SHA-256-Hash des Login-PWs in `js/app.js` (Hash, nicht Plaintext), 24h Session
- **Hosting:** GitHub Pages (Auto-Deploy bei push to main)
- **Domain:** peaking.world bei United-Domains, A-Records auf GH-Pages-IPs (185.199.108-111.153)

---

## Dateien-Struktur

```
~/peaking-world/                  (= Primary Deploy-Repo)
├── CNAME                         "peaking.world"
├── CLAUDE.md                     (diese Datei)
├── index.html                    Login (SHA-256, 24h Session)
├── dashboard.html                Stats + Posting-Plan + Account-Switcher + Quick-Actions (7 Tiles)
├── js/
│   └── app.js                    SmashApp-Modul: Auth, Storage (account-aware), Helpers, Pillar-Info
├── data/
│   └── seed-ideas.json           30 Initial Reel-Ideen für vegetarianhulk
├── modules/
│   ├── tracker.html              Reel-Performance-Tracker + PEAKING Auto-Analyzer (Smash-Style umgebrandet)
│   ├── builder.html              Carousel-Builder (10 Slides, Berg-Style, Bulk-Download)
│   ├── ideas.html                Idea Bank (Filter/Search/Custom)
│   ├── captions.html             Caption Library (20 Templates + 4 Hashtag-Sets + Variablen-System)
│   ├── calendar.html             Wochen-Plan (Tap-Slot-Zuweisung, mobile-first)
│   ├── analytics.html            ER-Hero, Pillar-Bar-Chart, 7×24 Heatmap, Top-3 + Recyclen-Loop
│   ├── growth.html               Growth Center für @peakingworld (Profil-Setup, First-Reel, Posting-Plan, Cross-Promo)
│   └── instagram-pb.html         Profilbild-Generator (3 Varianten + Screenshot-Anleitung)
└── assets/
    ├── BRAND.md                  ⭐ Single-Source-of-Truth für ALLE Brand-Decisions
    ├── logo.svg                  Triangle (Sunrise-Gradient), 64×64 viewBox
    ├── logo-wordmark.svg         Triangle + "peaking" Wordmark, 280×64
    ├── logo-preview.html         Multi-Size + Mockup-Preview-Page
    ├── logo-v2-{a,b,c}.svg       Naming-Picker-Backups (V2-Iteration vor Sunrise)
    ├── logo-v2-preview.html      Picker-Page für V2
    └── effects.css               Glow + Animations (peaking-pulse, lift-glow, stagger, shimmer, gradient-flow)
```

**Source-Repo (lokal, primary edit):** `~/smash-insta-manager/` — gleiche Struktur, von dort wird in beide Deploy-Repos kopiert.

---

## Brand-Kodex (verpflichtend)

### Single Source of Truth
**Bei JEDER Brand-Frage zuerst `assets/BRAND.md` lesen — nicht improvisieren.** Vollständige Spec für Colors, Logo, Typography, Voice, Components, Animations, Anti-Patterns.

### Kern-Prinzipien (Kurzfassung)
- **Sunrise-Gradient** (`#FF6B6B → #FFA94D → #FFD43B`) ist Brand-Color
- **Single-Color-Accent:** `#FFA94D` (Sunrise-Orange) für Buttons, Links, Glow
- **NIE Hulk-Green** (`#39FF14`/`#00ff6a`/`#2ecc71`) — gehört zu SMASH (Schwester-Brand), klare Trennung
- **Dark-Only** (kein Light-Mode)
- **Mobile-first** (Container max-w-5xl, alle Modals scrollbar bis 90vh)
- **Glassmorphism** (`.glass`-Klasse) für Cards, mit subtiler `backdrop-filter blur(10px)`
- **Animations dezent** (Influencer-Glow, nicht 2003-MySpace)

### Voice
- Hopeful · Energetic · Inspiring (DE primär, EN secondary)
- „Always peaking." / „The climb is the peak." / „From climb to peak."
- **NIEMALS:** „Date your best self." / „Mach hin." / „Hulk-Mode an." (= SMASH-only)

---

## Module (live)

| # | Modul | Zweck | Status |
|---|---|---|---|
| 1 | `index.html` | Login mit SHA-256-Hash | ✅ Live |
| 2 | `dashboard.html` | Stats, Posting-Plan, Account-Switcher, Quick-Actions | ✅ Live |
| 3 | `modules/tracker.html` | Reel-Performance manuell eintragen + Charts + PEAKING Auto-Analyzer (Claude-AI-Workflow) | ✅ Live |
| 4 | `modules/builder.html` | Carousel-Builder für Berg-Foto-Story, 10 Slides, Bulk-Download | ✅ Live |
| 5 | `modules/ideas.html` | Idea Bank mit 30 Seed + Filter (Pillar/Format/Status) + Custom-Add | ✅ Live |
| 6 | `modules/captions.html` | 20 Templates × 4 Pillars × 5 Functions + 4 Hashtag-Sets + Variablen-System | ✅ Live |
| 7 | `modules/calendar.html` | Wochen-Plan mit Tap-Slot-Zuweisung + Säulen-Balance | ✅ Live |
| 8 | `modules/analytics.html` | ER-Hero, Pillar-Bar-Chart, 7×24 Heatmap, Top-3 + Recyclen-Loop, JSON/CSV-Export | ✅ Live |
| 9 | `modules/growth.html` | Growth Center für @peakingworld (Profil-Checklist, First-Reel, 10 Ideas, 4-Wochen-Plan, Cross-Promo) | ✅ Live |
| 10 | `modules/instagram-pb.html` | Profilbild-Generator (3 Varianten + Screenshot-Anleitung) | ✅ Live |

### Smarte Cross-Modul-Loops (transparent)
- Idea → Calendar: Idee in Slot legen markiert sie als „using"
- Calendar → Idea: „Gepostet" markieren updatet auch Idea-Status
- Analytics → Idea: Top-Performer haben „Als neue Idee speichern"-Button (Hook recyclen)
- Captions → Hashtags: Use-Modal hat Toggle „Hashtag-Set anhängen"

---

## Multi-Account-System

**Seit 06.05.2026** unterstützt PEAKING zwei Insta-Accounts in **separaten localStorage-Spaces**:

```
ACCOUNTS = {
  vegetarianhulk: { emoji: '🏔️', label: 'Outdoor + Plant-Based', color: '#10b981' },
  peakingworld:    { emoji: '🚀', label: 'AI + Creator Tools (BIP)', color: '#FFA94D' }
}
```

### API
```js
SmashApp.ACCOUNTS                // → { vegetarianhulk, peakingworld }
SmashApp.getCurrentAccount()     // → 'vegetarianhulk' | 'peakingworld'
SmashApp.switchAccount(key)      // → wechselt + page reload
SmashApp.getAccount(key)         // → Account-Info-Object
SmashApp.getDataForAccount(account, key)  // cross-account read (für Compare-Dashboard later)
```

### Storage-Schema
```
smash:auth                                     (global)
smash:currentAccount                           (global)
smash:vegetarianhulk:{reels,ideas,calendar,captionsCustom,growthChecklist}
smash:peakingworld:{reels,ideas,calendar,captionsCustom,growthChecklist}
smash:migrationV2Done                          (migration-flag, beim ersten Load gesetzt)
```

### Migration (von Single-Account zu Multi)
Beim ersten Load nach v1.1 wandern Legacy-Keys (`smash:reels` etc.) automatisch zu `smash:vegetarianhulk:reels`. Alte Keys bleiben 1 Release als Safety-Backup.

### UI
Account-Switcher im Dashboard-Header (oben rechts) — Pill mit Sunrise-Border, Dropdown-Menü mit beiden Accounts. Tap → page reload mit anderem Daten-Space.

### Bekannte Limitation (V1)
**Pillars sind noch global** (Outdoor/Gym/Mindset/Plant für beide Accounts). V2 würde account-spezifische Pillars haben (peakingworld = Tools/BIP/Marketing/BTS). Refactor wäre groß; aktuell zeigt das Growth-Center die peakingworld-spezifischen Pillars als Static-Reference.

---

## Deploy-Workflow (Stage→Prod, seit 07.05.2026)

**WICHTIG — 2 unabhaengige Systeme, NIE direkt auf Prod pushen:**

| Repo | URL | Rolle |
|---|---|---|
| `~/smash-insta-manager/` | (lokal, kein Git) | Source of Truth |
| `~/smash-universe-hub/insta/` | smashuniverse.info/insta | **STAGING** (hidden, Test-System) |
| `~/peaking-world/` | peaking.world | **PRODUCTION** (Insta-Bio-Link) |

### Standard-Workflow

```bash
# 1. Edit in Source
cd ~/smash-insta-manager && # ... edit ...

# 2. STAGE first (smashuniverse.info/insta)
cp -R index.html dashboard.html js modules data assets sw.js manifest.json links.html ~/smash-universe-hub/insta/
cd ~/smash-universe-hub && git add insta/ && git commit -m "STAGE: <desc>" && git push

# 3. QA-Sweep auf Stage (~60-120s warten + curl-checks)
curl -s -o /dev/null -w "%{http_code}" https://smashuniverse.info/insta/

# 4. WENN STAGE ✓ → PROD (peaking.world)
cp -R index.html dashboard.html js modules data assets sw.js manifest.json links.html CLAUDE.md ~/peaking-world/
cd ~/peaking-world && git add -A && git commit -m "PROD: <desc>" && git push

# 5. QA-Sweep auf Prod
```

→ Details in `~/.claude/projects/.../memory/project_peaking_stage_prod_workflow.md`.

### Wichtig: CNAME-Trap
**NIEMALS** im GitHub-Pages-Settings „Remove Domain" klicken — löscht die `CNAME`-Datei aus dem Repo automatisch (Sebi hatte das Trauma schon mal mit smashuniverse.info!). Wenn `peaking.world` plötzlich 404: erst CNAME im Repo prüfen.

### iOS Safari + HTTP-Edge-Cases
Solange peaking.world auf HTTP laeuft (kein SSL): **Recorder/SW/getUserMedia/Notifications broken**. Login funktioniert nach Pure-JS-SHA-256-Fallback (07.05.). Details: `feedback_peaking_qa_workflow.md`.

---

## Roadmap

### v1 ✅ Done (06.05.2026)
- [x] 8 Module komplett (Login, Dashboard, 6 Modules)
- [x] Multi-Account-Support (vegetarianhulk + peakingworld)
- [x] Sunrise-Brand-Pivot (von Hulk-Green zu eigenem Brand)
- [x] Logo + BRAND.md
- [x] Influencer-Glow + Animations
- [x] Growth Center + PB Generator

### v1.5 — Backlog (kommende Wochen)
- [ ] **Account-spezifische Pillars** (peakingworld = Tools/BIP/Marketing/BTS) — Refactor von PILLAR_INFO
- [ ] **Public Linktree** auf `peaking.world/links` (sobald DNS live + erste Reels gepostet)
- [ ] **Plausible-Tracking** auf Public-Pages (cookieless DSGVO-clean) — siehe SMASH-Pattern in `~/life-tracker/links.html`
- [ ] **PWA-Manifest** für Add-to-Homescreen
- [ ] **Cross-Account Compare-Dashboard** („welcher Account wächst schneller?")
- [ ] **Account-spezifische Theme-Colors** (vegetarianhulk = grün-tinted, peakingworld = sunrise-tinted)

### v2 — Phase 2 (Sommer 2026)
- [ ] **Local AI Pattern-Detection** (Posting-Zeit, Hook-Performance, Säulen-Drift) — siehe `project_peaking_cookies_ai_backlog.md`
- [ ] **Meta Graph API Integration** für Auto-Sync (statt manuelles Eintragen) — Approval-Antrag 1-3 Tage Wartezeit, Setup via `jlbadano/ig-mcp`
- [ ] **Privacy + Terms HTML** für Meta App Review

### v3 — Phase 3 (Herbst 2026)
- [ ] **Multi-User-Auth** (Firebase Auth oder Cloudflare Access) — wenn Sebis Freunde mitnutzen wollen
- [ ] **Real AI** mit Claude API für Hook-Generation, Predictive Analytics
- [ ] **Backend** für Cross-Device-Sync

---

## Cross-Project (SMASH)

**Schwester-Brand:** SMASH (smashtheapp.de) — Habit-Tracker-PWA. Repo: `~/life-tracker/`. Hat eigene Brand (Hulk-Green), eigene Voice (Hulk-Voice), eigenes CLAUDE.md.

### Übernommene Patterns
- ✅ `assets/BRAND.md` als Single-Source-of-Truth
- ✅ `CLAUDE.md` im Repo (diese Datei)
- ✅ Modular-HTML-File-Structure (statt Single-Page wie SMASH)
- ✅ GitHub-Pages-Auto-Deploy
- ✅ localStorage-First-Approach

### NICHT übernommene Patterns (mit Grund)
- ❌ Single-Page-HTML (SMASH ist 5100 Zeilen in 1 File — PEAKING ist modular gesplitted für bessere Wartbarkeit)
- ❌ Firebase Backend (PEAKING ist client-only, kein Auth-User-Management nötig)
- ❌ Pro-/Free-Tier-Logic (PEAKING ist single-user-tool, kein Monetarisierungs-Layer aktuell)
- ❌ Hulk-Brand-Voice / Hulk-Green (klare Brand-Trennung)

### Cross-Reference-Memos
- `~/.claude/projects/.../memory/project_smash_insta_manager.md` — Hauptmemo
- `~/.claude/projects/.../memory/project_peaking_meta_mcp_backlog.md` — Auto-Sync-Plan
- `~/.claude/projects/.../memory/project_peaking_cookies_ai_backlog.md` — AI-Phase-2/3
- `~/.claude/projects/.../memory/feedback_smash_insta_access_backlog.md` — Security-Optionen
- `~/.claude/projects/.../memory/project_peaking_cross_reference.md` — von Strategy-Claude erstellt

---

## Anti-Patterns

- ❌ Hulk-Green einbauen (gehört SMASH)
- ❌ Pillar-Color als Brand-Color verwenden (Outdoor-Green ist Pillar-Token, nicht Brand)
- ❌ Light-Mode-Variante bauen
- ❌ Build-Step einbauen (npm/webpack/etc. — bricht GH-Pages-Auto-Deploy)
- ❌ Account-Daten ohne `_storageKey()` lesen (würde Multi-Account brechen)
- ❌ CNAME-Datei aus Repo löschen (Custom-Domain stirbt)
- ❌ Splash-Page mit zu viel Movement (epileptische Anfälle vermeiden, max 1 Pulse-Loop)
- ❌ Strategy-Claude-Inhalte über @peakinginfluence ungeprüft übernehmen — der Account heißt **@peakingworld**

---

## Quick-Refs

### Live-URLs
- **Login:** https://smashuniverse.info/insta/ (Mirror, sofort live) · https://peaking.world (DNS pending)
- **Dashboard:** /dashboard.html
- **Module:** /modules/{tracker,builder,ideas,captions,calendar,analytics,growth,instagram-pb}.html
- **Logo-Preview:** /assets/logo-preview.html

### Login
- **Passwort:** Sebis Login-PW (Plaintext bewusst NICHT dokumentiert — Hash in `js/app.js`)
- **Session:** 24h via localStorage

### GitHub
- **Primary:** github.com/sebastianwimmer-sq/peaking-world
- **Mirror:** github.com/sebastianwimmer-sq/smash-universe-hub (in `/insta/`-Subpath)

### Memories (für nächste Claude-Session)
Lade beim Session-Start: `project_smash_insta_manager.md` zuerst — alle anderen sind dort verlinkt.

---

*Built solo by Sebi + Claude Code, 06.05.2026. Always peaking. ⛰️🌅*
