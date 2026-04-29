# SMASH Universe Hub

Corporate hub for SMASH Universe — habit rituals for every stage of life.

**Live:** https://smashuniverse.info
**Apps:** [SMASH](https://smashtheapp.de) (live)
**Strategy memory:** `project_smash_universe_manifest.md`

## Stack

- Static HTML (single-page bilingual DE/EN)
- GitHub Pages hosting (auto-deploy on push to `main`)
- Custom domain via `CNAME` file
- HTTPS via GitHub Pages Auto-Renew (Let's Encrypt)

## Structure

```
smash-universe-hub/
├── index.html         Main bilingual hub (DE/EN with auto-detect + toggle)
├── press/
│   └── index.html     Full press kit (logos, brand-spec, pitch-PDF)
├── CNAME              smashuniverse.info
└── README.md
```

## Local development

Just open `index.html` in a browser. No build step.

## Deploy

`git push` → GitHub Pages picks it up within ~2 minutes.

## Domain setup

DNS at united-domains:

- A-Records (apex `smashuniverse.info`):
  - `185.199.108.153`
  - `185.199.109.153`
  - `185.199.110.153`
  - `185.199.111.153`
- CNAME (`www.smashuniverse.info`): `sebastianwimmer-sq.github.io`

Then enable HTTPS in repo settings → Pages.
