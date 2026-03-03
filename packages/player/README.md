# Verona Player Interface Library

**It's a Beta-Version!**

## Specification

This library implements the [Verona Player Specification](https://verona-interfaces.github.io/player/).

**The currently used specification version is hard-coded in packages/package.json!**

```bash
# Check used version
npm pkg get veronaSpec
```

## Getting Started

### Prerequisites

Read and install all requirements in the **README.md** file of this MonoRepos in the root directory.

### Install Dependencies

If necessary:

```bash
pnpm install
```

### Development

Include this Packages in your Verona-Module

1. Build package

```bash
pnpm build
```

2. Navigate to the directory of the package you want to include in a Verona module and run:

```bash
npm link
```
3. Run in your Verona-Modul:

```bash
npm link @verona/<package-name>
```
Now you can find your verona-lib in node_modules named: @verona

## Include in a verona module

[**Here**](./PLAYER-INTEGRATION.md) is an example of how the player package is integrated into and used in the Verona module: Speedtest Player.

## Documentation

#### API Doku erzeugen: 

```bash
cd packages/player
pnpm docs
```

#### How it works

[**Here**](./LIB_WORKING.md)

## Versioning

Find more information about this [here](../../README.md) in the monorepo root documentation.

## License

MIT