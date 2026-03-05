# Verona Interface Libraries Monorepo

**It's a Beta-Version!**

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

#### Install pnpm

```bash
npm install -g pnpm
```

#### Install dependencies

```bash
pnpm install
```

### Building procedure

**All packages:**

```bash
pnpm build
```

**Specific package:**

```bash
pnpm --filter @verona/player build
pnpm --filter @verona/editor build
```
Or change in package folder and run:

```bash
pnpm build
```

Every package uses the **shared** package. If you encounter problems creating a package with the message "...module '@verona/shared' not found," please create the shared package first.


```bash
pnpm --filter @verona/shared build
```

### Use packages in your verona-module

1. Build the package. You can use automatic or manual creation for this.

2. Navigate to the directory of the package you want to include in a Verona module and run:

```bash
npm link
```
3. Run in your Verona-Modul:

```bash
npm link @verona/<package-name>
```

**If you want more then one packages in your verona-modul:**

If you try to include individual packages one after the other, the last package included will be overwritten! Therefore, the packages must be included in a single command.

```bash
npm link @verona/shared @verona/player @verona/editor @verona/widget
```

When automatic building is used, the changes are directly visible into the Verona module via a link.

#### Automatic watch-mode

Use automatic watch-mode `tsup --watch`. This has the advantage that changes to the local package are watched. A build is automatically generated and the link is updated. The change is then immediately visible in the included package of the Verona module. 

Before you change something in your code, put in your cli:

```bash
cd verona-monorepo
pnpm dev
```

## Documentation

### Prerequisites

Before generating documentation, run the build process! The documentation requires the **dist** folder, which is created by the build process.

### Create documentation

**for all packages:**

```bash
pnpm docs
```
**for a specific package:**

```bash
pnpm --filter @verona/<package-name> docs
```

**For detailed documentation setup, see [here](./DOCUMENTATION.md)**

### Clean Build Artifacts

```bash
pnpm clean
```

## Publishing

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

## Versioning

Detailed information can be found [here](./VERSIONING.md).

## Links

- [Verona Specification](https://verona-interfaces.github.io/)

## License

MIT