# Verona Interface Libraries Monorepo

**Es handelt sich um eine Beta-Version!**

Monorepo containing all Verona interface libraries for Player, Editor, Schemer, and Widget.

## Packages

| Package | Version | Spec Version | Description |
|---------|---------|--------------|-------------|
| [@verona/shared](./packages/shared) | 1.0.0 | - | Shared utilities and Player Interface |
| [@verona/editor](./packages/editor) | 1.0.0-beta | 3.5.0 | Verona Editor Interface |
| [@verona/player](./packages/player) | 1.0.0-beta | 6.1.1 | Verona 

## Getting Started

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
Or change in package and run:

```bash
pnpm build
```

### Development: Include this Packages in your Verona-Module

1. Build the package

2. Navigate to the directory of the package you want to include in a Verona module and run:

```bash
npm link
```
3. Run in your Verona-Modul:

```bash
npm link @verona/<package-name>
```
Now you can find your verona-lib in node_modules with the name: @verona

## Documentation

Generate documentation for all packages:

```bash
pnpm docs
```
Or generate documentation for a specific package:

```bash
pnpm --filter @verona/<package-name> docs
```

**For detailed documentation setup, see [DOCUMENTATION.md](./DOCUMENTATION.md)**

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

## Project Structure

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

## Scripts

| Script | Description |
|--------|-------------|
| `pnpm build` | Build all packages |
| `pnpm dev` | Watch mode for all packages |
| `pnpm clean` | Clean build artifacts |
| `pnpm typecheck` | Type check all packages |
| `pnpm docs` | Generate documentation |
| `pnpm publish:all` | Publish all packages to npm |

## Links

- [Verona Specification](https://verona-interfaces.github.io/)
- [Documentation](https://your-org.github.io/verona-monorepo/)

## License

MIT