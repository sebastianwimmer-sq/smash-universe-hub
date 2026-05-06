# PEAKING — Brand Specification

> **Tagline:** Always peaking.
> **Sub-Tagline:** The climb is the peak.
> **Live:** https://peaking.world (DNS propagating) · Mirror: https://smashuniverse.info/insta
> **Repo (primary):** https://github.com/sebastianwimmer-sq/peaking-world
> **Repo (mirror):** https://github.com/sebastianwimmer-sq/smash-universe-hub
> **Source-Repo (lokal):** `~/smash-insta-manager/`

Personal Insta-Influencer-Tracking-Tool für Solo-Creators auf der Reise von 2k → 1M Follower.

> *„Track was hooked. Climb deine Influence. Always peaking."*

**Status:** v1.2 (06.05.2026) — Sunrise Hustle Brand · Multi-Account-Support · Influencer-Glow

---

## 📋 Inhaltsverzeichnis

1. [Brand Foundation](#-brand-foundation)
2. [Colors](#-colors)
3. [Logo](#-logo)
4. [Typography](#-typography)
5. [Voice / Tone](#-voice--tone)
6. [Components](#-components)
7. [Animations](#-animations)
8. [Anti-Patterns](#-anti-patterns)
9. [When to Use This File](#-when-to-use-this-file)

---

## 🎯 Brand Foundation

| Element | Wert |
|---|---|
| **Name** | PEAKING |
| **Tagline (Haupt)** | „Always peaking." |
| **Tagline (Sub)** | „The climb is the peak." |
| **Pitch in 1 Satz** | „From climb to peak — your sunrise tool for solo creators." |
| **Vibe** | Influencer-Glow · Sunrise-warm · Premium-modern · Hopeful-Energetic |
| **Vibe-Vergleich** | Notion × Buffer × Loom |
| **Audience** | Solo-Creators 16–30 (Sebi-like) · DACH primary, EN secondary |
| **Domain** | peaking.world (United-Domains) |
| **Insta-Handle** | @peakingworld |

---

## 🎨 Colors

### Sunrise-Gradient (Primary Brand)

| Token | Hex | RGB | Usage |
|---|---|---|---|
| Sunrise Coral | `#FF6B6B` | `rgb(255, 107, 107)` | Gradient start, hot accents |
| **Sunrise Orange** ⭐ | `#FFA94D` | `rgb(255, 169, 77)` | **Primary single-color accent** (buttons, links, glow, neon-Klasse) |
| Sunrise Yellow | `#FFD43B` | `rgb(255, 212, 59)` | Gradient end, highlights |

**Standard-Sunrise-Gradient:**
```css
background: linear-gradient(135deg, #FFD43B, #FFA94D, #FF6B6B);
/* Alt: 2-stop für Buttons */
background: linear-gradient(135deg, #FFA94D, #FF6B6B);
```

**Sunrise-Glow (Box-Shadow):**
```css
box-shadow: 0 8px 24px rgba(255, 169, 77, 0.35);
/* Strong */
box-shadow: 0 12px 36px rgba(255, 169, 77, 0.55);
```

### Background

| Token | Hex / Value | Usage |
|---|---|---|
| BG Gradient Start | `#0f172a` | App background top |
| BG Gradient End | `#1e293b` | App background bottom |
| Glass Surface | `rgba(30, 41, 59, 0.6)` | Cards (glassmorphism) |
| Glass Border | `rgba(255, 255, 255, 0.1)` | Card hairlines |
| Surface Strong | `rgba(15, 23, 42, 0.8)` | Modal backgrounds, code blocks |

**Standard-BG-Gradient:**
```css
background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
```

### Text

| Token | Hex | Usage |
|---|---|---|
| Text Primary | `#ffffff` | Headlines, body |
| Text Secondary | `#94a3b8` | Subtle copy, labels |
| Text Muted | `#64748b` | Footnotes, timestamps |

### State (functional, not brand)

| Token | Hex | Usage |
|---|---|---|
| Success | `#10b981` / `#34d399` | Posted, success-states |
| Warning | `#f59e0b` / `#fbbf24` | Planned, in-progress |
| Danger | `#ef4444` / `#f87171` | Delete, errors |
| Trend-Up | `#34d399` | Positive metric trend |
| Trend-Down | `#f87171` | Negative metric trend |

### Pillar-Colors (separate System — NICHT als Brand-Color verwenden!)

Diese sind **content-categorization tokens**, KEINE Brand-Tokens. Werden in den 4-Säulen-Pills (Idea-Cards, Calendar-Stripes, Pillar-Charts) verwendet:

| Pillar | Hex | Emoji |
|---|---|---|
| Outdoor | `#10b981` | 🏔️ |
| Gym/Fitness | `#f59e0b` | 💪 |
| Mindset | `#8b5cf6` | 🧠 |
| Plant-Based | `#84cc16` | 🌿 |

> ⚠️ **Achtung:** Gym-Pillar (`#f59e0b`) ist phonetisch nahe Sunrise-Orange. Im Brand-Context immer Sunrise-Orange (`#FFA94D`) nehmen. Im Pillar-Context Pillar-Orange.

---

## ⛰️ Logo

### Files (in `assets/`)

| File | Format | Usage |
|---|---|---|
| `logo.svg` | 64×64 SVG | Triangle-only. Favicon, App-Icon, Splash-Icon, Insta-PB. |
| `logo-wordmark.svg` | 280×64 SVG | Triangle + „peaking"-Wordmark. Header-Bereich. |
| `logo-preview.html` | HTML | Multi-Size + App-Icon + Insta-PB Mockups. |

### Logo-Concept

**„Peak Triangle mit Sunrise-Gradient"** — stilisierter Berg-Gipfel als gefülltes Dreieck, vertical Gradient von Coral (unten/links) → Orange (mitte) → Yellow (oben/rechts), als Symbol für „Sunrise am Peak".

### SVG-Source (logo.svg)

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" fill="none">
  <title>PEAKING — Always peaking.</title>
  <defs>
    <linearGradient id="sunrise" x1="0%" y1="100%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#FF6B6B"/>
      <stop offset="50%" stop-color="#FFA94D"/>
      <stop offset="100%" stop-color="#FFD43B"/>
    </linearGradient>
  </defs>
  <path d="M 32 8 L 58 56 L 6 56 Z" fill="url(#sunrise)"/>
</svg>
```

### Usage-Matrix

| Spot | File | Größe | CSS-Klassen |
|---|---|---|---|
| Splash-Icon (Login) | `logo.svg` | 96×96 | `peaking-pulse logo-glow-strong` |
| Dashboard-Header | `logo.svg` | 32–40 | `logo-glow` |
| Favicon | `logo.svg` | Browser handles | — |
| Apple-Touch-Icon | `logo.svg` | 180×180 | — |
| Header-Wordmark | inline `<span>PEAKING</span>` | text-3xl bis text-4xl | `text-sunrise font-bold tracking-tight` |
| Insta-PB | `logo.svg` auf Black-BG | 96×96 | 3px Sunrise-Border |

---

## 🅰️ Typography

- **Font-Stack:** `-apple-system, BlinkMacSystemFont, 'Inter', 'Segoe UI', sans-serif`
- **Wordmark „PEAKING":**
  - Uppercase Variante: `text-3xl bis text-5xl font-bold tracking-tight text-sunrise`
  - Lowercase Variante: gleicher Style mit `lowercase` für softeren Vibe (Stripe-Style)
- **Headlines:** `font-bold` (700) bis `font-black` (900)
- **Body:** Tailwind Default (400–600)
- **Captions/Labels:** `text-xs uppercase tracking-wider text-gray-500`

---

## 🗣️ Voice / Tone

### Core Principles
- **Hopeful** — Optimismus, Aufstieg, „du kommst hoch"
- **Energetic** — Hustle-Vibe, aber nicht aggressiv
- **Inspiring** — Identifikations-Stories („every reel is a step")
- **Honest** — Build-in-Public-DNA, keine Vanity-Lügen

### Sätze die zu PEAKING gehören
- „Always peaking."
- „The climb is the peak."
- „From climb to peak."
- „You're climbing — the peak rewards you."
- „Track was hooked. Skip the rest."
- „From 2k to 1M. Always peaking."

### Sätze die NICHT zu PEAKING gehören
- „Date your best self." → SMASH only
- „Mach hin." → SMASH only
- „Hulk-Mode an." → SMASH only
- Productivity-Bro-Talk: „Hustle 18h/Tag", „Optimize your daily routine"
- Self-Help-Esoterik: „Manifest your peak"

### Sprache
- **DE primary, EN secondary** (Audience ist DACH-first)
- Englische Tagline + Tool-Labels OK (sind kurz + Kultur-bekannt)
- Lange Erklärungen + Onboarding immer DE

---

## 🧱 Components (CSS-Klassen-Referenz)

### Buttons

| Klasse | Effekt |
|---|---|
| `.btn-primary` | Sunrise-Gradient (Yellow→Orange→Coral) Background, dark text, font-bold |
| `.btn-shimmer` | Hover: White-Shine sweep across (links→rechts) |
| `.btn-glow-strong` | Stärkerer Sunrise-Box-Shadow + Inset-Highlight |
| `.press-feedback` | Active: scale(0.96) — taktiles Feedback beim Tap |

### Cards & Surfaces

| Klasse | Effekt |
|---|---|
| `.glass` | Glassmorphism (backdrop-filter blur + halbtransparenter dark BG) |
| `.lift-glow` | Hover: lift up 4px + Sunrise-Glow-Shadow + Border-Tint |
| `.gradient-flow` | Animierter Sunrise-Background (8s loop) |
| `.bg-depth` | Subtle radiale Sunrise-Glows in Ecken (für Body) |

### Pills & Chips

| Klasse | Effekt |
|---|---|
| `.chip` | Pill-shaped Filter-Button, transparent BG |
| `.chip.active` | Sunrise-Gradient BG + Glow |
| `.pillar-pill` | Pillar-color BG (functional, nicht brand) |
| `.status-pill` | Success/Warning/Skipped-States für Calendar-Slots |

### Toast & Modals

| Klasse | Effekt |
|---|---|
| `.toast` | Sunrise-Orange BG, dark text, bouncy entry-animation |
| `.modal-bg` | Backdrop blur + dark overlay |

### Account-Switcher (Dashboard)

| Klasse | Effekt |
|---|---|
| `.account-switch` | Pill mit Sunrise-Border + Hover-Glow |
| `.account-menu` | Dropdown mit Sunrise-Border + Glow-Shadow |

---

## 🎬 Animations (in `assets/effects.css`)

| Klasse | Trigger | Effekt |
|---|---|---|
| `.peaking-pulse` | always-on (Logo) | 3.5s scale + drop-shadow loop |
| `.float-in` | on-load | opacity 0→1 + translateY 16px→0 |
| `.scale-in` | on-load (modals, splash) | opacity 0→1 + scale 0.94→1 |
| `.fade-in` | on-load | opacity 0→1 |
| `.bounce-toast` | toast.show | bouncy entry mit overshoot |
| `.shimmer-sweep` | always-on (text) | gradient sweep across text |
| `.bg-shift` | always-on (gradient-flow) | gradient position 0%↔100% |
| `.glow-pulse` | always-on (heroes) | box-shadow pulse |
| `.stagger > *` | on-load (lists/grids) | staggered float-in mit 40ms delay-step |

---

## 🚫 Anti-Patterns (NIE machen)

- ❌ **Hulk-Green** (`#39FF14`, `#00ff6a`, `#2ecc71`) verwenden — gehört zu SMASH, klare Brand-Trennung halten
- ❌ Mehr als 3 Stops im Sunrise-Gradient (Coral/Orange/Yellow ist die kanonische Palette)
- ❌ Light-Mode-Variante (PEAKING ist **Dark-Only**)
- ❌ Drop-Shadows ohne Sunrise-Tint (sondern grau/schwarz) — wirkt billig
- ❌ Generic Stock-Mountain-Logos statt unser eigenes SVG
- ❌ SMASH-Brand-Voice mischen („Mach hin.", „Hulk-Mode") in PEAKING-Spots
- ❌ Mehr als eine Brand-Voice pro Page
- ❌ Pillar-Color-Token als Brand-Color verwenden (`#10b981` ist Outdoor-Pillar, NICHT „Brand-Grün")
- ❌ Cookie-Banner / DSGVO-Tracking-Pop-Ups (Tool ist passwort-geschützt + Plausible cookieless)

---

## 📋 When to Use This File

| Situation | What to do |
|---|---|
| Logo-/Farb-Fragen | **Zuerst hier nachschauen**, nicht improvisieren |
| Neue Component bauen | Tokens aus diesem File copy-pasten |
| Brand-Drift-Verdacht | Re-Audit gegen diesen File |
| Neuer Helper onboarden (Designer, anderer Claude, Friend-Sebi-User) | Diesen File als ersten Read empfehlen |
| Neue Page / neues Modul | Color-Tokens + Voice-Sätze + Component-Klassen aus hier |
| Update beschließen | Hier ZUERST ändern, dann Code-Files anpassen (SSoT-Workflow) |

---

## 🔗 Related Files

- `assets/logo.svg` — Logo-Source
- `assets/logo-wordmark.svg` — Wordmark-Variante
- `assets/effects.css` — Animations + Glow-Klassen
- `assets/logo-preview.html` — Visual-Preview-Page
- `js/app.js` — `SmashApp.PILLAR_INFO` (pillar-color-tokens)

---

## 📝 Versionierung

- **v1.0** (06.05.2026) — Initial: Sunrise Hustle Brand-Setup nach Pivot von Hulk-Green
- **v1.1** (06.05.2026) — Logo SVG (Triangle + Sunrise-Gradient) added
- **v1.2** (06.05.2026) — Glow + Animations System (`effects.css`) added, Multi-Account dazu

---

*PEAKING ist eine eigenständige Brand. Klare Trennung von SMASH (Hulk-Green-Brand). Beide leben im SMASH-Universe.*
