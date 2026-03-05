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

### Dependencies

#### Install

```bash
pnpm install
```

#### Cleanup

```bash
pnpm clean
```

### Development

#### Build

Find more information about this [here](../../README.md) in the mono-repo documentation.

1. Manual build package

```bash
pnpm build
```
#### Include a package in a verona-modul

1. Navigate to the directory of the package you want to include in a Verona module and run:

```bash
npm link
```
2. Run in your Verona-Modul:

```bash
npm link @verona/player
```
Now you can find your verona-lib in node_modules named: @verona

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