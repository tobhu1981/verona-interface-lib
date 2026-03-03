# Dokumentations-Guide

## Separate Package Dokumentation erstellen

```bash
# Einzelnes Package
cd packages/player
pnpm docs
pnpm docs:serve  # Öffnet http://localhost:3000

# Alle Packages
pnpm docs  # (im Root)
```

### Struktur

```
packages/
├── player/
│   └── docs/              # ← Player Docs
│       ├── index.html
│       ├── classes/
│       └── ...
├── editor/
│   └── docs/              # ← Editor Docs
└── schemer/
    └── docs/              # ← Schemer Docs
```

### GitHub Pages URLs

Nach dem Deployment:
```
https://your-username.github.io/verona-monorepo/
https://your-username.github.io/verona-monorepo/player/
https://your-username.github.io/verona-monorepo/editor/
https://your-username.github.io/verona-monorepo/schemer/
```
1. Zu GitHub pushen: `git push origin main`
2. GitHub Pages aktivieren → Settings → Pages → gh-pages branch

## Kombinierte Dokumentation für alle Packages erstellen

```bash
# Im Root-Verzeichnis
pnpm docs:combined

# Mit lokalem Server
pnpm docs:serve  # Öffnet http://localhost:3000
```

### Struktur

```
verona-monorepo/
└── docs/                  # ← Alle Packages zusammen
    ├── index.html
    ├── modules/
    │   ├── @verona_player.html
    │   ├── @verona_editor.html
    │   └── ...
    └── ...
```

### GitHub Pages URL

```
https://your-username.github.io/verona-monorepo/
```

Alle Packages in einer Navigation!

### Setup

Ändere `.github/workflows/docs.yml`:

```yaml
- name: Generate documentation
  run: pnpm docs:combined  # ← Statt pnpm docs

- name: Deploy to GitHub Pages
  uses: peaceiris/actions-gh-pages@v3
  with:
    publish_dir: ./docs  # ← Statt ./gh-pages
```

---

## Konfiguration anpassen

### Package-spezifische Docs (typedoc.json)

Jedes Package hat eigene Config:

```json
// packages/player/typedoc.json
{
  "name": "@verona/player",
  "entryPoints": ["src/index.ts"],
  "out": "docs",
  "readme": "README.md"
}
```

### Kombinierte Docs (Root typedoc.json)

```json
// typedoc.json (Root)
{
  "name": "Verona Interfaces",
  "entryPoints": [
    "packages/player/src/index.ts",
    "packages/editor/src/index.ts"
  ],
  "entryPointStrategy": "packages",
  "out": "docs"
}
```

---

## Docs anpassen

### Theme ändern

```json
// typedoc.json
{
  "theme": "default",  // oder andere Themes
  "customCss": "./custom.css"
}
```

### README einbinden

```json
{
  "readme": "README.md",  // Zeigt README auf Startseite
  // oder
  "readme": "none"        // Keine README
}
```

### Kategorien

```typescript
/**
 * Send methods
 * @category Sending
 */
export class VeronaPlayer {
  /**
   * Send ready notification
   * @category Lifecycle
   */
  sendReady() { }
}
```

---

## Deployment-Optionen

### GitHub Pages (Automatisch)

Bereits konfiguriert in `.github/workflows/docs.yml`

**Trigger:**
- Push auf `main`
- Tag erstellen (z.B. `player@4.0.0`)
- Manuell: Actions → Run workflow

### Netlify

```bash
# netlify.toml
[build]
  command = "pnpm install && pnpm build && pnpm docs:combined"
  publish = "docs"
```

### Vercel

```json
// vercel.json
{
  "buildCommand": "pnpm install && pnpm build && pnpm docs:combined",
  "outputDirectory": "docs"
}
```