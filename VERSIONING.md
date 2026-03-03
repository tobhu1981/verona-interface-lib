# Versionierungs-Anleitung: Spec vs. Package Version

## Zwei Versionen verstehen

### Package-Version (NPM)
- Version **Library-Implementation**
- Folgt SemVer (Semantic Versioning)
- Ändert sich bei Code-Updates

### Spec-Version (Verona)
- Die Version der **Verona-Spezifikation** die implementiert wird
- Definiert von Verona-Projekt
- Ändert sich nur bei Spec-Updates

---

## Setup: Beide Versionen in jeweiliger package.json

### Beispiel für Package: Player

**`packages/player/package.json`:**

```json
{
  "name": "@verona/player",
  "version": "1.2.3",              // ← Package-Version (NPM)
  "veronaSpec": "6.1.1",           // ← Spec-Version (Custom Field)
  "keywords": [
    "verona",
    "verona-player",
    "verona-spec-6.1.1"            // ← Für npm-Suche
  ]
}
```

**`packages/player/src/constants.ts`:**

```typescript
// ============================================================================
// CONSTANTS
// ============================================================================

import pkg from '../package.json';

/** @internal Default target origin for postMessage */
export const DEFAULT_TARGET_ORIGIN = '*';

/**
 * NPM Package version of @verona/player library
 * Automatically read from package.json
 * @public
 */
export const PACKAGE_VERSION = pkg.version;

/**
 * Verona Player Specification version implemented by this library
 * Automatically read from package.json
 * @public
 */
export const VERONA_SPEC_VERSION = pkg.veronaSpec;
```

**`packages/player/src/index.ts`:**

```typescript
// Constants
export { 
  PACKAGE_VERSION, 
  VERONA_SPEC_VERSION,
  DEFAULT_TARGET_ORIGIN 
} from './constants';

// ... rest of exports
```

---

## Workflow 1: Package-Version ändern (Bugfix/Features)

**Wann:** Code-Änderungen ohne Spec-Änderung

### Schritt-für-Schritt:

```bash
# 1. In das Package wechseln
cd packages/player

# 2. Code ändern
# ... deine Änderungen ...

# 3. Version setzen

## pumpen (automatisch):
npm version patch   # 1.2.3 → 1.2.4 (Bugfix)
npm version minor   # 1.2.3 → 1.3.0 (Feature)

## manuell setzen:
npm version         # 1.0.0-beta → 1.2.0-beta

# 4. Build
pnpm build

# 5. Commit & Push
git add .
git commit -m "fix: correct message handling"
git push origin main

# 6. Optional: Tag für Release
git tag player@1.2.4
git push --tags
```

**Resultat:**
- ✅ `package.json` → `"version": "1.2.4"`
- ✅ `package.json` → `"veronaSpec": "6.1.1"` (unverändert!)
- ✅ `PACKAGE_VERSION` → `"1.2.4"`
- ✅ `VERONA_SPEC_VERSION` → `"6.1.1"` (unverändert!)

---

## Workflow 2: Spec-Version ändern (Breaking Change)

**Wann:** Neue Verona-Spezifikation veröffentlicht

### Schritt-für-Schritt:

```bash
# 1. In das Package wechseln
cd packages/player

# 2. Code anpassen für neue Spec
# ... Implementierung der neuen Spec ...

# 3. Spec-Version MANUELL in package.json ändern
```

**Editiere `package.json`:**
```json
{
  "name": "@verona/player",
  "version": "1.2.3",              // ← Noch alte Version
  "veronaSpec": "6.2.0",           // ← MANUELL auf neue Spec ändern!
  "keywords": [
    "verona",
    "verona-player",
    "verona-spec-6.2.0"            // ← Auch hier aktualisieren!
  ]
}
```

```bash
# 4. MAJOR Version bump (Breaking Change!)
npm version major   # 1.2.3 → 2.0.0

# 5. Build
pnpm build

# 6. Commit & Push
git add .
git commit -m "BREAKING CHANGE: update to Verona Spec 6.2.0"
git push origin main

# 7. Tag für Release
git tag player@2.0.0
git push --tags
```

**Resultat:**
- ✅ `package.json` → `"version": "2.0.0"` (MAJOR bump!)
- ✅ `package.json` → `"veronaSpec": "6.2.0"` (neue Spec!)
- ✅ `PACKAGE_VERSION` → `"2.0.0"`
- ✅ `VERONA_SPEC_VERSION` → `"6.2.0"`

---

## Versionierungs-Matrix

| Änderung | Package-Version | Spec-Version | Bump-Type |
|----------|----------------|--------------|-----------|
| Bugfix | 1.2.3 → 1.2.4 | 6.1.1 (gleich) | PATCH |
| Neues Feature | 1.2.3 → 1.3.0 | 6.1.1 (gleich) | MINOR |
| Breaking Change (Code) | 1.2.3 → 2.0.0 | 6.1.1 (gleich) | MAJOR |
| **Neue Spec** | **1.2.3 → 2.0.0** | **6.1.1 → 6.2.0** | **MAJOR** |

---

## Entscheidungsbaum

```
Hat sich die Verona-Spec geändert?
│
├─ JA
│  ├─ 1. veronaSpec in package.json MANUELL ändern
│  ├─ 2. keywords aktualisieren
│  ├─ 3. npm version major (Breaking Change!)
│  └─ 4. CHANGELOG.md: "BREAKING: Spec 6.2.0"
│
└─ NEIN
   ├─ Nur Code-Änderungen?
   │
   ├─ Bugfix → npm version patch
   ├─ Feature → npm version minor
   └─ Breaking Code → npm version major
```

---

## Prüfen welche Versionen aktuell sind

```bash
# In Code
cd packages/player
pnpm build
node -e "const p = require('./dist/index.js'); console.log('Package:', p.PACKAGE_VERSION, 'Spec:', p.VERONA_SPEC_VERSION);"

# Output: Package: 1.2.4 Spec: 6.1.1
```

```typescript
// Im Verona-Modul
import { PACKAGE_VERSION, VERONA_SPEC_VERSION } from '@verona/player';

console.log('Player Library:', PACKAGE_VERSION);    // "1.2.4"
console.log('Implements Spec:', VERONA_SPEC_VERSION); // "6.1.1"
```

---

## Publishing Workflow

### Veröffentlichen nach Package-Update:

```bash
cd packages/player
pnpm build

# Test lokal
npm pack
# Prüfe den .tgz

# Publish
npm publish

# Tag pushen
git push --tags
```

### Veröffentlichen nach Spec-Update:

```bash
cd packages/player
pnpm build

# WICHTIG: Teste Kompatibilität!
# Teste mit alten und neuen Hosts

# Publish mit Tag für Breaking Change
npm publish

# Tag pushen
git push --tags

# GitHub Release mit Migration Guide
```

---

## GitHub Pages Badge

Die `.github/workflows/docs.yml` zeigt automatisch beide Versionen:

**Option 1: Nur Spec-Version (aktuell):**
```html
<span class="badge">Spec $PLAYER_VERSION</span>
```

**Option 2: Beide Versionen:**

Erweitere die `docs.yml`:

```yaml
# Read both versions
PLAYER_PKG_VERSION=$(node -p "require('./packages/player/package.json').version")
PLAYER_SPEC_VERSION=$(node -p "require('./packages/player/package.json').veronaSpec")

# In HTML
<h2>
  @verona/player 
  <span class="badge">v$PLAYER_PKG_VERSION</span>
  <span class="badge spec">Spec $PLAYER_SPEC_VERSION</span>
</h2>
```

---

## ⚠️ Wichtige Regeln

### ✅ DO:
- ✅ **IMMER** MAJOR bump bei Spec-Änderung
- ✅ **IMMER** CHANGELOG.md aktualisieren
- ✅ **IMMER** Migration Guide bei Breaking Changes
- ✅ Beide Versionen in README dokumentieren
- ✅ Keywords in package.json aktualisieren

### ❌ DON'T:
- ❌ Spec-Version ändern ohne Code-Anpassung
- ❌ MINOR/PATCH bump bei Spec-Update
- ❌ Vergessen veronaSpec in package.json zu ändern
- ❌ Vergessen keywords zu aktualisieren

---

## Checkliste: Spec-Update

```
☐ Code für neue Spec implementiert
☐ Tests aktualisiert
☐ package.json → veronaSpec geändert
☐ package.json → keywords aktualisiert
☐ npm version major ausgeführt
☐ CHANGELOG.md geschrieben
☐ MIGRATION.md erstellt (wenn nötig)
☐ README.md aktualisiert
☐ Gebaut und getestet
☐ Committed & Tagged
☐ Gepusht
☐ GitHub Release erstellt
☐ npm published
```

---

## 🔗 Kompatibilitäts-Matrix im README

Füge zu jedem Package-README hinzu:

```markdown
## Compatibility

| Library Version | Spec Version | Status | Release Date |
|----------------|--------------|--------|--------------|
| 2.x.x | 6.2.0 | ✅ Current | 2024-03-15 |
| 1.x.x | 6.1.1 | ⚠️ Legacy | 2024-01-10 |
| 0.x.x | 6.0.0 | ❌ Deprecated | 2023-11-01 |