# @verona/player

TypeScript library for implementing the [Verona Player Interface (Spec 6.1.0)](https://verona-interfaces.github.io/player/).

A player presents ("plays") a unit — displaying its content and collecting responses during an assessment. It runs inside an `<iframe>` and communicates with the host application via `postMessage`.

Use cases include: test execution, review, print preview, manual coding, example publishing.

## Workflow

```
Host                                    Player
 │                                        │
 │  (loads player in iframe)              │
 │                                        │── init JS ──▶ new VeronaPlayerApiService()
 │                                        │── register all handlers
 │◀─── vopReadyNotification ─────────────│── sendReady()
 │                                        │
 │──── vopStartCommand ──────────────────▶│── onStartCommand callback
 │       sessionId (required)             │       load unitDefinition
 │       unitDefinition?                  │       restore unitState
 │       unitState? (restore)             │       apply playerConfig
 │       playerConfig?                    │
 │                                        │
 │         ╔══════ interaction loop ══════╗
 │         ║                             ║
 │◀─── vopStateChangedNotification ──────║── user interaction
 │         ║   unitState (partial ok)    ║       sendStateChanged()
 │         ║   playerState              ║
 │         ║   log?                     ║
 │         ║                            ║
 │──── vopPageNavigationCommand ─────────║▶ onPageNavigationCommand
 │         ║   target: pageId           ║       navigate to page
 │         ║                            ║
 │◀─── vopUnitNavigationRequestedNotification
 │         ║   target: next|previous…   ║── user clicks "Next"
 │         ║                            ║
 │──── vopNavigationDeniedNotification ──║▶ onNavigationDenied
 │         ║   reason[]                 ║       highlight invalid inputs
 │         ║                            ║
 │──── vopPlayerConfigChangedNotification║▶ onPlayerConfigChanged
 │         ║   playerConfig             ║       update navigation buttons etc.
 │         ║                            ║
 │◀─── vopWidgetCall ─────────────────── ║── sendWidgetCall()
 │──── vopWidgetReturn ──────────────────║▶ onWidgetReturn
 │         ║                            ║
 │◀─── vopRuntimeErrorNotification ──────║── error during playback
 │◀─── vopWindowFocusChangedNotification ║── focus gained/lost (auto)
 │         ╚════════════════════════════╝
```

## Usage

### 1. Instantiate

```typescript
import { VeronaPlayerApiService } from '@verona/player';

const player = new VeronaPlayerApiService({ debug: true });
```

### 2. Register handlers

Register **all** handlers **before** calling `sendReady()`.

```typescript
// Required: start command
player.onStartCommand((cmd) => {
  // cmd.sessionId          – required, echoed in every subsequent message
  // cmd.unitDefinition     – unit content to render
  // cmd.unitDefinitionType – format/version identifier
  // cmd.unitState          – previous state to restore (dataParts, progress flags)
  // cmd.playerConfig       – paging mode, navigation targets, log policy, etc.

  loadUnit(cmd.unitDefinition, cmd.unitDefinitionType);
  if (cmd.unitState) restoreState(cmd.unitState);
  if (cmd.playerConfig) applyConfig(cmd.playerConfig);
});

// Optional: page navigation from host
player.onPageNavigationCommand((cmd) => {
  navigateToPage(cmd.target);
});

// Optional: navigation denied – highlight missing/invalid inputs
player.onNavigationDenied((msg) => {
  // msg.reason: ('presentationIncomplete' | 'responsesIncomplete')[]
  markAllInputsAsTouched(msg.reason);
});

// Optional: config update at runtime
player.onPlayerConfigChanged((msg) => {
  updateNavigationButtons(msg.playerConfig.enabledNavigationTargets);
});

// Optional: widget result
player.onWidgetReturn((msg) => {
  // msg.callId matches the callId from sendWidgetCall
  // msg.state  is the widget's final state
  applyWidgetResult(msg.callId, msg.state);
});
```

### 3. Send ready notification

```typescript
import metadata from './metadata.json';

player.sendReady({
  metadata: JSON.stringify(metadata)  // stringified JSON-LD from the html header
});
```

### 4. Report state changes

Send whenever the user interacts. Only include **changed** `dataParts` – the host merges them. Always update `presentationProgress` and `responseProgress` as the host uses these to gate navigation.

```typescript
player.sendStateChanged({
  unitState: {
    dataParts: { page1: JSON.stringify(responseData) },  // only changed parts
    presentationProgress: 'complete',
    responseProgress: 'some',
    unitStateDataType: 'iqb-standard@1.2'
  },
  playerState: {
    validPages: [
      { id: 'p1', label: 'Page 1' },
      { id: 'p2', label: 'Page 2' }
    ],
    currentPage: 'p2'
  },
  log: [
    { timeStamp: new Date().toISOString(), key: 'PAGE_CHANGED', content: 'p2' }
  ]
});
```

### 5. Request unit navigation

```typescript
// User clicks "Next" button
player.sendUnitNavigationRequested('next');
// Other targets: 'previous' | 'first' | 'last' | 'end'
```

### 6. Open a widget

```typescript
player.sendWidgetCall(
  'calc-1',           // callId – unique per call point in the unit
  'CALC',             // widgetType
  [{ key: 'MODE', value: 'SCIENTIFIC' }],  // optional config
  previousState       // optional – restores last widget state
);
```

### 7. Report a runtime error

```typescript
player.sendRuntimeError('AUDIO_CORRUPT', "Element 'audio_4' failed to play");
```

### 8. Cleanup

```typescript
// e.g. in Angular ngOnDestroy or a cleanup function
player.destroy();
```

> **Note:** `vopWindowFocusChangedNotification` is sent **automatically** via `focus`/`blur` window events. No manual call is needed.

## API Reference

### `VeronaPlayerApiService`

#### Constructor

```typescript
new VeronaPlayerApiService(options?: VeronaPlayerOptions)
```

| Option | Type | Default | Description |
|---|---|---|---|
| `debug` | `boolean` | `false` | Enables console logging of sent/received messages |
| `allowedOrigin` | `string` | `'*'` | Restricts which origins are accepted via postMessage |

#### Send methods

| Method | Sends | Description |
|---|---|---|
| `sendReady(data)` | `vopReadyNotification` | Announces readiness to the host |
| `sendStateChanged(data)` | `vopStateChangedNotification` | Reports unit/player state changes |
| `sendUnitNavigationRequested(target)` | `vopUnitNavigationRequestedNotification` | Requests navigation to another unit |
| `sendRuntimeError(code, message?)` | `vopRuntimeErrorNotification` | Reports a runtime error |
| `sendWidgetCall(callId, widgetType, parameters?, state?)` | `vopWidgetCall` | Requests a widget |
| `sendWindowFocusChanged(hasFocus)` | `vopWindowFocusChangedNotification` | Reports focus change *(called automatically)* |

#### Receive handlers

| Method | Receives | Description |
|---|---|---|
| `onStartCommand(callback)` | `vopStartCommand` | Unit definition and config |
| `onPageNavigationCommand(callback)` | `vopPageNavigationCommand` | Navigate to a specific page |
| `onNavigationDenied(callback)` | `vopNavigationDeniedNotification` | Navigation was denied; highlight invalid inputs |
| `onPlayerConfigChanged(callback)` | `vopPlayerConfigChangedNotification` | Updated player config at runtime |
| `onWidgetReturn(callback)` | `vopWidgetReturn` | Widget closed with result |

#### Getters

| Getter | Type | Description |
|---|---|---|
| `currentSessionId` | `string \| null` | Active session ID, or `null` before `vopStartCommand` |

## Types

All types are available as both flat exports and via their namespaces:

```typescript
// Flat (convenience)
import type {
  UnitState,
  PlayerState,
  PlayerConfig,
  PagingMode,
  NavigationTarget,
  LogEntry
} from '@verona/player';

// Namespaced
import { MainSchema } from '@verona/player';
type State = MainSchema.UnitState;
```

### `UnitState`

| Field | Type | Description |
|---|---|---|
| `dataParts` | `Record<string, string>` | Serialised response data. Only changed parts need to be sent. |
| `presentationProgress` | `'none' \| 'some' \| 'complete'` | Whether all unit content has been presented |
| `responseProgress` | `'none' \| 'some' \| 'complete'` | Whether all REQUIRED responses are given and valid |
| `unitStateDataType` | `string` | Format identifier for `dataParts` values |

### `PlayerConfig`

| Field | Type | Description |
|---|---|---|
| `pagingMode` | `PagingMode` | `'separate'`, `'buttons'`, `'concat-scroll'`, `'concat-scroll-snap'` |
| `printMode` | `PrintMode` | `'off'`, `'on'`, `'on-with-ids'` |
| `logPolicy` | `LogPolicy` | `'disabled'`, `'lean'`, `'rich'`, `'debug'` |
| `enabledNavigationTargets` | `NavigationTarget[]` | Which navigation buttons to show/enable |
| `startPage` | `string` | Page to navigate to immediately after loading |
| `directDownloadUrl` | `string` | Base URL for lazy-loading resources (e.g. GeoGebra) |
| `unitNumber` | `number` | Display unit number (>= 1) |
| `unitTitle` | `string` | Display unit title (max 50 chars) |
| `unitId` | `string` | Internal unit ID for logs (max 20 chars) |

## Spec

Verona Player Specification: <https://verona-interfaces.github.io/player/>