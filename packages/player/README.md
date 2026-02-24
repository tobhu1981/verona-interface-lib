# Alter Text aus Player-Lib

**Es handelt sich um eine Beta-Version!**

## Installation als lokales npm-package

**In der Library**

```bash
npm run build
```

**Im Player**

Zuvor in `package.json` Pfad zur Lib angegeben.
Hier ein Beispiel:

 `"@verona-interfaces/player": "file:../verona-interfaces-player-lib"`


```bash
npm install @verona-interfaces/player
```

## Erprobung der Lib

[**Hier**](./PLAYER-INTEGRATION.md) ist eine Zusammenfassung zur Erprobung mit dem Speedtest-Player zu finden.


## Documentation

#### API Doku erzeugen: 

```bash
npm run docs
```

Die so erzeugte API-Doku wird auch auf GitHub-Pages via GitHub-Action angezeigt. 

#### Arbeitsweise der Bibliothek

[**Hier**](./LIB_WORKING.md)

## Versionierung


## Lizenz

MIT

## Links

- [Verona Specification](https://verona-interfaces.github.io/player/)



# Neuer Text von AI für Player im Monorepo

Verona Player Interface Library (Spec 4.0.0)

## Installation

```bash
npm install @verona/player
```

## Quick Start

```typescript
import { VeronaPlayer, VERONA_PLAYER_SPEC_VERSION } from '@verona/player';

console.log('Spec Version:', VERONA_PLAYER_SPEC_VERSION); // '4.0.0'

const player = new VeronaPlayer({
  debug: true,
  allowedOrigin: '*'
});

// Register handlers
player.onStartCommand((command) => {
  console.log('Start command received:', command.sessionId);
  
  if (command.unitDefinition) {
    // Load unit
  }
  
  if (command.unitState) {
    // Restore state
  }
});

// Send ready
player.sendReady({
  metadata: JSON.stringify({
    '@context': 'https://w3id.org/iqb/metadata',
    type: 'player',
    version: '1.0.0'
  })
});

// Send state
player.sendStateChanged({
  dataParts: {
    'response': 'encoded-data'
  },
  responseProgress: 'complete'
});

// Cleanup
player.destroy();
```

## API Reference

### `VeronaPlayer`

Main player class for communication with host.

#### Constructor

```typescript
new VeronaPlayer(options?: VeronaPlayerOptions)
```

#### Methods

- `sendReady(data: { metadata: string }): void`
- `sendStateChanged(unitState?, playerState?, log?): void`
- `onStartCommand(callback): void`
- `destroy(): void`

### Types

- `VeronaPlayerOptions`
- `UnitState`
- `PlayerConfig`
- `StartCommandData`
- `LogEntry`

### Constants

- `VERONA_PLAYER_SPEC_VERSION = '4.0.0'`

## Specification

This library implements the [Verona Player Specification 4.0.0](https://verona-interfaces.github.io/).

## License

MIT