# 📚 Dokumentations-Guide

## 🎯 Zwei Ansätze

Du hast zwei Möglichkeiten für die Dokumentation:

### Option 1: Separate Docs pro Package (Empfohlen)
Jedes Package hat eigene Dokumentation.

### Option 2: Kombinierte Docs
Alle Packages in einer großen Dokumentation.

---

## 📦 Option 1: Separate Docs (Empfohlen)

### Lokal generieren

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

### Setup

**1. Push zu GitHub:**
```bash
git add .
git commit -m "Add monorepo with docs"
git push origin main
```

**2. GitHub Pages aktivieren:**
- GitHub → Settings → Pages
- Source: `gh-pages` branch
- Save

**3. Warten (~2 Min)**
Die GitHub Action generiert und deployed automatisch!

**4. Fertig!**
Docs sind online unter deiner GitHub Pages URL.

---

## 🎨 Option 2: Kombinierte Docs

### Lokal generieren

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

## 🔧 Konfiguration anpassen

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

## 🎨 Docs anpassen

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

## 📤 Deployment-Optionen

### GitHub Pages (Automatisch)

✅ Bereits konfiguriert in `.github/workflows/docs.yml`

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

---

## 🔍 Lokales Entwickeln

### Docs im Watch-Mode

```bash
# Terminal 1: Build im Watch-Mode
cd packages/player
pnpm dev

# Terminal 2: Docs neu generieren bei Änderungen
# (Manuell nach Code-Änderungen)
pnpm docs

# Terminal 3: Server
npx serve docs
```

### Hot-Reload Setup (optional)

```bash
# Install nodemon
pnpm add -Dw nodemon

# Watch files und regeneriere
nodemon --watch src --exec "pnpm docs"
```

---

## 📋 Vergleich

| Feature | Separate Docs | Kombinierte Docs |
|---------|---------------|------------------|
| **URLs** | /player/, /editor/ | / (alles zusammen) |
| **Navigation** | Pro Package | Übergreifend |
| **Build-Zeit** | Schneller (parallel) | Langsamer |
| **Wartung** | Einfacher | Komplexer |
| **Übersicht** | Fokussiert | Komplett |
| **Empfohlen für** | Große Monorepos | Kleine Monorepos |

---

## 💡 Meine Empfehlung

### Für dich: Option 1 (Separate Docs)

**Warum?**
- ✅ Jedes Package hat eigene Spec-Version
- ✅ Unabhängige Dokumentation
- ✅ Einfacher zu warten
- ✅ Schnellere Builds
- ✅ Fokussierte Navigation

**URLs:**
```
https://your-org.github.io/verona-monorepo/
  ├── player/    (Spec 4.0.0)
  ├── editor/    (Spec 3.5.0)
  ├── schemer/   (Spec 2.0.0)
  └── widget/    (Spec 1.0.0)
```

---

## 🚀 Quick Start

### Separate Docs (Empfohlen)

```bash
# 1. Docs generieren
pnpm docs

# 2. Lokal anschauen
cd packages/player
npx serve docs

# 3. Zu GitHub pushen
git push origin main

# 4. GitHub Pages aktivieren
# Settings → Pages → gh-pages branch

# 5. Fertig!
```

### Kombinierte Docs

```bash
# 1. Docs generieren
pnpm docs:combined

# 2. Lokal anschauen
pnpm docs:serve

# 3. Deploy anpassen (siehe oben)
```

---

## ❓ FAQ

**Q: Können Player und Editor unterschiedliche Docs-Versionen haben?**  
A: Ja! Bei separaten Docs hat jedes Package eigene Versionsnummer in der Dokumentation.

**Q: Wie aktualisiere ich nur Player-Docs?**  
A: `cd packages/player && pnpm docs && git push`

**Q: Kann ich beides haben (separate + kombiniert)?**  
A: Ja! Generiere beides und deploye an verschiedene Orte.

**Q: Wo sind die Docs lokal?**  
A: 
- Separate: `packages/player/docs/`
- Kombiniert: `docs/` (Root)

---

**Die GitHub Action ist bereits konfiguriert und einsatzbereit!** 🎉

Push einfach zu GitHub und die Docs werden automatisch generiert und deployed.
