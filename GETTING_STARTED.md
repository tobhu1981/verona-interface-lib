# Getting Started with Verona Monorepo

## Prerequisites

- **Node.js**: >= 18.0.0
- **pnpm**: >= 8.0.0

## Install pnpm

```bash
npm install -g pnpm
```

## Initial Setup

```bash
# Clone repository
git clone <your-repo-url>
cd verona-monorepo

# Install all dependencies
pnpm install

# Build all packages
pnpm build
```

## Development Workflow

### Build Commands

```bash
# Build all packages
pnpm build

# Build specific package
pnpm --filter @verona/player build
pnpm --filter @verona/editor build

# Build in watch mode
pnpm dev
pnpm --filter @verona/player dev
```

### Type Checking

```bash
# Check all packages
pnpm typecheck

# Check specific package
pnpm --filter @verona/player typecheck
```

### Clean Build Artifacts

```bash
# Clean all
pnpm clean

# Clean specific package
pnpm --filter @verona/player clean
```

## Working with Packages

### Adding a Dependency

```bash
# Add to specific package
pnpm --filter @verona/player add lodash

# Add dev dependency
pnpm --filter @verona/player add -D @types/lodash

# Add workspace dependency
# In package.json: "@verona/shared": "workspace:*"
```

### Creating a New Package

1. Create directory: `packages/new-package/`
2. Add `package.json` with workspace dependency
3. Add to `pnpm-workspace.yaml` (if needed)
4. Run `pnpm install`

### Testing Locally

```bash
# Link package globally
cd packages/player
pnpm link --global

# In your test project
pnpm link --global @verona/player

# Or use pnpm link directly
cd your-test-project
pnpm link ../verona-monorepo/packages/player
```

## Publishing

### Publish All Packages

```bash
# Build first
pnpm build

# Publish
pnpm publish:all
```

### Publish Specific Package

```bash
cd packages/player
npm version patch  # or minor, major
pnpm build
pnpm publish
```

### Version Management

Each package has independent versions:

```bash
# Player Spec updates: 4.0.0 → 4.1.0
cd packages/player
npm version major
pnpm build
pnpm publish

# Editor remains at 3.5.0 (unchanged)
```

## Documentation

### Generate Docs

```bash
# All packages
pnpm docs

# Specific package
pnpm --filter @verona/player docs
```

### Serve Docs Locally

```bash
cd packages/player
pnpm docs:serve
# Opens http://localhost:3000
```

## Common Issues

### pnpm Not Found

```bash
npm install -g pnpm
```

### Workspace Dependencies Not Resolving

```bash
# Remove node_modules and reinstall
rm -rf node_modules packages/*/node_modules
pnpm install
```

### Build Errors

```bash
# Clean and rebuild
pnpm clean
pnpm build
```

### TypeScript Errors

```bash
# Rebuild shared package first
pnpm --filter @verona/shared build
pnpm build
```

## Project Structure

```
verona-monorepo/
├── packages/
│   ├── shared/          # @verona/shared (utilities)
│   ├── player/          # @verona/player (Spec 4.0.0)
│   ├── editor/          # @verona/editor (Spec 3.5.0)
│   ├── schemer/         # @verona/schemer (Spec 2.0.0)
│   └── widget/          # @verona/widget (Spec 1.0.0)
├── package.json         # Root config
├── pnpm-workspace.yaml  # Workspace definition
└── tsconfig.base.json   # Shared TypeScript config
```

## Next Steps

1. **Implement Editor, Schemer, Widget** (currently placeholders)
2. **Add Tests** (setup test infrastructure)
3. **Add CI/CD** (GitHub Actions)
4. **Setup GitHub Pages** (documentation hosting)
5. **Configure Publishing** (npm automation)

## Resources

- [pnpm Workspace](https://pnpm.io/workspaces)
- [Verona Specification](https://verona-interfaces.github.io/)
- [TypeScript](https://www.typescriptlang.org/)
