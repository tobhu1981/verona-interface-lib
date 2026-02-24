# 🚀 Verona Monorepo - Quick Setup

## ✅ Was ist fertig?

### Packages:
- ✅ **@verona/shared** - Utilities (encodeBase64, decodeBase64, validation)
- ✅ **@verona/player** - Player Interface (Spec 4.0.0) - **Vollständig implementiert**
- 🚧 **@verona/editor** - Editor Interface (Spec 3.5.0) - Platzhalter
- 🚧 **@verona/schemer** - Schemer Interface (Spec 2.0.0) - Platzhalter
- 🚧 **@verona/widget** - Widget Interface (Spec 1.0.0) - Platzhalter

### Struktur:
```
verona-monorepo/
├── packages/
│   ├── shared/          ✅ Fertig
│   ├── player/          ✅ Fertig (vereinfachte Version)
│   ├── editor/          🚧 Platzhalter
│   ├── schemer/         🚧 Platzhalter
│   └── widget/          🚧 Platzhalter
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
├── README.md
├── GETTING_STARTED.md
└── VERSIONING.md
```

## 🎯 Erste Schritte

### 1. pnpm installieren

```bash
npm install -g pnpm
```

### 2. Dependencies installieren

```bash
cd verona-monorepo
pnpm install
```

### 3. Alles bauen

```bash
pnpm build
```

### 4. Testen

```bash
# Player testen
cd packages/player
pnpm build
node -e "const {VeronaPlayer, VERONA_PLAYER_SPEC_VERSION} = require('./dist/index.js'); console.log('Spec:', VERONA_PLAYER_SPEC_VERSION);"
```

## 📦 Packages verwenden

### Installation (nach Publishing)

```bash
# Nur Player
npm install @verona/player

# Mehrere Packages
npm install @verona/player @verona/editor
```

### Verwendung

```typescript
// Player
import { VeronaPlayer, VERONA_PLAYER_SPEC_VERSION } from '@verona/player';

console.log('Player Spec:', VERONA_PLAYER_SPEC_VERSION); // '4.0.0'

const player = new VeronaPlayer({ debug: true });

player.onStartCommand((command) => {
  console.log('Start:', command.sessionId);
});

player.sendReady({ metadata: '...' });
```

```typescript
// Editor (Platzhalter)
import { VeronaEditor, VERONA_EDITOR_SPEC_VERSION } from '@verona/editor';

console.log('Editor Spec:', VERONA_EDITOR_SPEC_VERSION); // '3.5.0'

const editor = new VeronaEditor({ debug: true });
```

## 🔧 Entwicklung

### Watch Mode

```bash
# Alle Packages
pnpm dev

# Nur Player
pnpm --filter @verona/player dev
```

### Build einzelnes Package

```bash
pnpm --filter @verona/player build
```

### Type Check

```bash
pnpm typecheck
```

## 📚 Dokumentation

### Player Docs generieren

```bash
cd packages/player
pnpm docs
pnpm docs:serve  # Öffnet http://localhost:3000
```

## 🚀 Publishing

### NPM Login

```bash
npm login
```

### Publish einzelnes Package

```bash
cd packages/player
npm version patch  # oder minor, major
pnpm build
pnpm publish
```

### Publish alle Packages

```bash
pnpm publish:all
```

## 📝 Nächste Schritte

### 1. Player vervollständigen

Die aktuelle Player-Implementation ist vereinfacht. Erweitere sie mit:
- Alle Message-Handler (onPageNavigationCommand, onPlayerConfigChanged, etc.)
- Alle Send-Methoden (sendUnitNavigationRequest, sendRuntimeError, etc.)
- Vollständige Types aus der Verona Spec

Kopiere Code aus deiner bestehenden `verona-interfaces` Library.

### 2. Editor implementieren

```bash
cd packages/editor
# Implementiere VeronaEditor analog zu VeronaPlayer
```

### 3. Schemer & Widget implementieren

Analog zu Player und Editor.

### 4. Tests hinzufügen

```bash
# Füge Vitest hinzu
pnpm add -Dw vitest

# Erstelle tests/
mkdir packages/player/tests
```

### 5. CI/CD Setup

Erstelle `.github/workflows/ci.yml`:
```yaml
name: CI
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
      - run: pnpm install
      - run: pnpm build
      - run: pnpm test
```

## 🎨 Struktur-Empfehlungen

### Shared Package erweitern

```
packages/shared/src/
├── utils/
│   ├── encoding.ts    ✅ Vorhanden
│   ├── validation.ts  ✅ Vorhanden
│   ├── factory.ts     📝 Hinzufügen (createLogEntry, etc.)
│   └── helpers.ts     📝 Hinzufügen
└── types/
    └── common.ts      📝 Hinzufügen (gemeinsame Types)
```

### Player Package vervollständigen

```
packages/player/src/
├── constants.ts       ✅ Vorhanden
├── types/
│   ├── index.ts      ✅ Basis vorhanden
│   ├── operations.ts 📝 Alle Operation-IDs
│   ├── payloads.ts   📝 Alle Payload-Interfaces
│   └── schemas.ts    📝 Alle Schema-Types
├── services/
│   └── VeronaPlayerApiService.ts  ✅ Basis vorhanden
└── index.ts          ✅ Vorhanden
```

## ⚙️ Konfiguration anpassen

### Deine Organisation

In allen `package.json`:
```json
{
  "name": "@deine-org/player",
  "author": "Dein Name",
  "repository": "https://github.com/deine-org/verona-monorepo"
}
```

### NPM Scope

Wenn du keinen NPM-Scope hast:
```json
{
  "name": "verona-player",  // Ohne @org/
}
```

## 🔗 Wichtige Links

- **Verona Spec:** https://verona-interfaces.github.io/
- **pnpm Docs:** https://pnpm.io/
- **TypeScript:** https://www.typescriptlang.org/
- **tsup:** https://tsup.egoist.dev/

## ❓ Probleme?

### Build-Fehler

```bash
pnpm clean
pnpm install
pnpm build
```

### Type-Fehler

```bash
# Shared zuerst bauen
pnpm --filter @verona/shared build
pnpm build
```

### Workspace-Fehler

```bash
rm -rf node_modules packages/*/node_modules
pnpm install
```

---

**Viel Erfolg mit dem Monorepo! 🎉**

Bei Fragen: Siehe `GETTING_STARTED.md` und `VERSIONING.md`