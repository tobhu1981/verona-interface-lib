

# Verona Editor Interface Library (Spec 3.5.0)

**Es handelt sich um eine Beta-Version!**

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

## Erprobung der Lib

[**Hier**](./EDITOR-INTEGRATION.md) ist eine Zusammenfassung zur Erprobung mit dem Speedtest-Player zu finden.

## Documentation

#### API Doku erzeugen: 

```bash
cd packages/editor
pnpm docs
```

## Versionierung

Find more information about this [here](../../README.md) in the mono-repo documentation.

## Specification

This library implements the [Verona Editor Specification](https://verona-interfaces.github.io/editor/).

**The currently used specification version is hard-coded in packages/package.json!**

## License

MIT