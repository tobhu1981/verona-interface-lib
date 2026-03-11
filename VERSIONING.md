# Versioning Guide: Spec vs. Package Version

## Understanding the Two Versions

### Package Version (NPM)
- Version of the **library implementation**
- Follows SemVer (Semantic Versioning)
- Changes with code updates

### Spec Version (Verona)
- Version of the **Verona specification** being implemented
- Defined by the Verona project
- Changes only when the spec is updated

---

## Setup: Both Versions in the Respective package.json

### Example for Package: Player

**`packages/player/package.json`:**

```json
{
  "name": "@verona/player",
  "version": "1.2.3",              // ← Package version (NPM)
  "veronaSpec": "6.1.1",           // ← Spec version (custom field)
  "keywords": [
    "verona",
    "verona-player",
    "verona-spec-6.1.1"            // ← For npm search
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

## Workflow 1: Bumping the Package Version (Bugfixes / Features)

**When:** Code changes without a spec change

### Step by Step:

```bash
# 1. Navigate to the package
cd packages/player

# 2. Make your changes
# ... your changes ...

# 3. Set the version

## bump automatically:
npm version patch   # 1.2.3 → 1.2.4 (bugfix)
npm version minor   # 1.2.3 → 1.3.0 (feature)

## set manually:
npm version         # 1.0.0-beta → 1.2.0-beta

# 4. Build
pnpm build

# 5. Commit & Push
git add .
git commit -m "fix: correct message handling"
git push origin main

# 6. Optional: tag for release
git tag player@1.2.4
git push --tags
```

**Result:**
- ✅ `package.json` → `"version": "1.2.4"`
- ✅ `package.json` → `"veronaSpec": "6.1.1"` (unchanged!)
- ✅ `PACKAGE_VERSION` → `"1.2.4"`
- ✅ `VERONA_SPEC_VERSION` → `"6.1.1"` (unchanged!)

---

## Workflow 2: Updating the Spec Version (Breaking Change)

**When:** A new Verona specification is published

### Step by Step:

```bash
# 1. Navigate to the package
cd packages/player

# 2. Adapt the code for the new spec
# ... implement the new spec ...

# 3. Manually update veronaSpec in package.json
```

**Edit `package.json`:**
```json
{
  "name": "@verona/player",
  "version": "1.2.3",              // ← Still old version
  "veronaSpec": "6.2.0",           // ← MANUALLY change to new spec!
  "keywords": [
    "verona",
    "verona-player",
    "verona-spec-6.2.0"            // ← Update here too!
  ]
}
```

```bash
# 4. MAJOR version bump (breaking change!)
npm version major   # 1.2.3 → 2.0.0

# 5. Build
pnpm build

# 6. Commit & Push
git add .
git commit -m "BREAKING CHANGE: update to Verona Spec 6.2.0"
git push origin main

# 7. Tag for release
git tag player@2.0.0
git push --tags
```

**Result:**
- ✅ `package.json` → `"version": "2.0.0"` (MAJOR bump!)
- ✅ `package.json` → `"veronaSpec": "6.2.0"` (new spec!)
- ✅ `PACKAGE_VERSION` → `"2.0.0"`
- ✅ `VERONA_SPEC_VERSION` → `"6.2.0"`

---

## Versioning Matrix

| Change | Package Version | Spec Version | Bump Type |
|--------|----------------|--------------|-----------|
| Bugfix | 1.2.3 → 1.2.4 | 6.1.1 (unchanged) | PATCH |
| New feature | 1.2.3 → 1.3.0 | 6.1.1 (unchanged) | MINOR |
| Breaking change (code) | 1.2.3 → 2.0.0 | 6.1.1 (unchanged) | MAJOR |
| **New spec** | **1.2.3 → 2.0.0** | **6.1.1 → 6.2.0** | **MAJOR** |

---

## Decision Tree

```
Has the Verona spec changed?
│
├─ YES
│  ├─ 1. Manually update veronaSpec in package.json
│  ├─ 2. Update keywords
│  ├─ 3. npm version major (breaking change!)
│  └─ 4. CHANGELOG.md: "BREAKING: Spec 6.2.0"
│
└─ NO
   ├─ Code-only changes?
   │
   ├─ Bugfix → npm version patch
   ├─ Feature → npm version minor
   └─ Breaking code change → npm version major
```

---

## Checking Current Versions

```bash
# In the build output
cd packages/player
pnpm build
node -e "const p = require('./dist/index.js'); console.log('Package:', p.PACKAGE_VERSION, 'Spec:', p.VERONA_SPEC_VERSION);"

# Output: Package: 1.2.4 Spec: 6.1.1
```

```typescript
// In a Verona module
import { PACKAGE_VERSION, VERONA_SPEC_VERSION } from '@verona/player';

console.log('Player Library:', PACKAGE_VERSION);     // "1.2.4"
console.log('Implements Spec:', VERONA_SPEC_VERSION); // "6.1.1"
```

---

## Publishing Workflow

### Publishing after a package update:

```bash
cd packages/player
pnpm build

# Test locally
npm pack
# Review the .tgz

# Publish
npm publish

# Push tags
git push --tags
```

### Publishing after a spec update:

```bash
cd packages/player
pnpm build

# IMPORTANT: Test compatibility!
# Test with both old and new hosts

# Publish
npm publish

# Push tags
git push --tags

# Create a GitHub release with a migration guide
```

---

## GitHub Pages Badge

The `.github/workflows/docs.yml` automatically displays both versions:

**Option 1: Spec version only (current):**
```html
<span class="badge">Spec $PLAYER_VERSION</span>
```

**Option 2: Both versions:**

Extend `docs.yml`:

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

## Important Rules

### ✅ DO:
- ✅ **ALWAYS** do a MAJOR bump when the spec changes
- ✅ **ALWAYS** update CHANGELOG.md
- ✅ **ALWAYS** provide a migration guide for breaking changes
- ✅ Document both versions in the README
- ✅ Update keywords in package.json

### ❌ DON'T:
- ❌ Change the spec version without updating the code
- ❌ Use MINOR/PATCH bump for a spec update
- ❌ Forget to update veronaSpec in package.json
- ❌ Forget to update keywords

---

## Checklist: Spec Update

```
☐ Code implemented for new spec
☐ Tests updated
☐ package.json → veronaSpec updated
☐ package.json → keywords updated
☐ npm version major executed
☐ CHANGELOG.md written
☐ MIGRATION.md created (if needed)
☐ README.md updated
☐ Built and tested
☐ Committed & tagged
☐ Pushed
☐ GitHub release created
☐ npm published
```

---

## Compatibility Matrix in the README

Add to each package README:

```markdown
## Compatibility

| Library Version | Spec Version | Status | Release Date |
|----------------|--------------|--------|--------------|
| 2.x.x | 6.2.0 | ✅ Current | 2024-03-15 |
| 1.x.x | 6.1.1 | ⚠️ Legacy | 2024-01-10 |
| 0.x.x | 6.0.0 | ❌ Deprecated | 2023-11-01 |
```