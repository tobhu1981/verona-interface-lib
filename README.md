# Verona Interface Libraries Monorepo

Monorepo containing all Verona interface libraries for Player, Editor, Schemer, and Widget.

## 📦 Packages

| Package | Version | Spec Version | Description |
|---------|---------|--------------|-------------|
| [@verona/shared](./packages/shared) | 1.0.0 | - | Shared utilities and helpers |
| [@verona/player](./packages/player) | 4.0.0 | 4.0.0 | Verona Player Interface |
| [@verona/editor](./packages/editor) | 3.5.0 | 3.5.0 | Verona Editor Interface |
| [@verona/schemer](./packages/schemer) | 2.0.0 | 2.0.0 | Verona Schemer Interface |
| [@verona/widget](./packages/widget) | 1.0.0 | 1.0.0 | Verona Widget Interface |

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- pnpm >= 8

### Install pnpm

```bash
npm install -g pnpm
```

### Install Dependencies

```bash
pnpm install
```

### Build All Packages

```bash
pnpm build
```

### Build Specific Package

```bash
pnpm --filter @verona/player build
pnpm --filter @verona/editor build
```

## 📖 Documentation

Generate documentation for all packages:

```bash
pnpm docs
```

**For detailed documentation setup, see [DOCUMENTATION.md](./DOCUMENTATION.md)**

## 🔧 Development

### Watch Mode

```bash
# Watch all packages
pnpm dev

# Watch specific package
pnpm --filter @verona/player dev
```

### Type Checking

```bash
pnpm typecheck
```

### Clean Build Artifacts

```bash
pnpm clean
```

## 📦 Publishing

### Publish All Packages

```bash
pnpm publish:all
```

### Publish Specific Package

```bash
pnpm --filter @verona/player publish
```

## 🏗️ Project Structure

```
verona-monorepo/
├── packages/
│   ├── shared/          # Shared utilities
│   ├── player/          # Player interface (Spec 4.0.0)
│   ├── editor/          # Editor interface (Spec 3.5.0)
│   ├── schemer/         # Schemer interface (Spec 2.0.0)
│   └── widget/          # Widget interface (Spec 1.0.0)
├── package.json         # Root package.json
├── pnpm-workspace.yaml  # Workspace configuration
└── tsconfig.base.json   # Base TypeScript config
```

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `pnpm build` | Build all packages |
| `pnpm dev` | Watch mode for all packages |
| `pnpm clean` | Clean build artifacts |
| `pnpm typecheck` | Type check all packages |
| `pnpm docs` | Generate documentation |
| `pnpm publish:all` | Publish all packages to npm |

## 🔗 Links

- [Verona Specification](https://verona-interfaces.github.io/)
- [Documentation](https://your-org.github.io/verona-monorepo/)

## 📄 License

MIT