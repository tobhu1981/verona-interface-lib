# @verona/widget

TypeScript library for implementing the [Verona Widget Interface (Spec 1.0.0)](https://verona-interfaces.github.io/widget/).

A widget is an interactive element requested by a player — for example a calculator or a periodic table — that runs inside an `<iframe>` and communicates with the host application via `postMessage`.

## Installation

```bash
pnpm add @verona/widget
```

## Workflow

```
Host                          Widget
 │                              │
 │  (loads widget in iframe)    │
 │                              │── init JS ──▶ new VeronaWidgetApiService()
 │                              │── onStartCommand() registered
 │◀─── vosReadyNotification ───│── sendReady()
 │                              │
 │──── vowStartCommand ────────▶│── onStartCommand callback fired
 │                              │       restoreState / apply widgetConfig
 │                              │
 │◀─── vowStateChangedNotification (optional, repeating)
 │                              │
 │◀─── vowReturnRequested ─────│── user closes widget
```

## Usage

### 1. Instantiate

```typescript
import { VeronaWidgetApiService } from '@verona/widget';

const widget = new VeronaWidgetApiService({ debug: true });
```

### 2. Register `onStartCommand` handler

Register **before** calling `sendReady()`. The host responds to the ready notification immediately, so the handler must be in place first.

Not all widgets require a start command (e.g. a static display). In that case this step can be skipped.

```typescript
widget.onStartCommand((cmd) => {
  // cmd.sessionId     – session identifier (optional per spec)
  // cmd.widgetConfig  – key/value config pairs (e.g. { key: 'MODE', value: 'SCIENTIFIC' })
  // cmd.state         – serialised state from a previous session
  // cmd.sharedParameters

  if (cmd.state) restoreState(cmd.state);
  if (cmd.widgetConfig) applyConfig(cmd.widgetConfig);
});
```

### 3. Send ready notification

```typescript
import metadata from './metadata.json';

widget.sendReady({
  metadata: JSON.stringify(metadata)  // stringified JSON-LD from the html header
});
```

### 4. Send state changes (optional)

Useful for intermediate save-points (e.g. logging). The host uses `timeStamp` to order asynchronous messages correctly.

```typescript
// Called whenever the user changes something in the widget
widget.sendStateChanged(
  serialisedState,     // string – format is widget-specific
  sharedParameters     // optional
);
```

### 5. Request closing the widget

When the user finishes (or cancels), send a return request. `saveState: false` means "cancel / discard changes".

```typescript
// Save & close
widget.sendReturnRequested(serialisedState, sharedParameters, true);

// Cancel (discard changes)
widget.sendReturnRequested(undefined, undefined, false);
```

### 6. Cleanup

```typescript
// e.g. in Angular ngOnDestroy or a cleanup function
widget.destroy();
```

## API Reference

### `VeronaWidgetApiService`

#### Constructor

```typescript
new VeronaWidgetApiService(options?: VeronaWidgetOptions)
```

| Option | Type | Default | Description |
|---|---|---|---|
| `debug` | `boolean` | `false` | Enables console logging of sent/received messages |
| `allowedOrigin` | `string` | `'*'` | Restricts which origins are accepted via postMessage |

#### Methods

| Method | Description |
|---|---|
| `sendReady(data)` | Sends `vowReadyNotification` to the host |
| `sendStateChanged(state?, sharedParameters?)` | Sends `vowStateChangedNotification` |
| `sendReturnRequested(state?, sharedParameters?, saveState?)` | Sends `vowReturnRequested` |
| `onStartCommand(callback)` | Registers a handler for `vowStartCommand` |
| `destroy()` | Removes event listeners and clears all handlers |

## Types

All types are available as both flat exports and via their namespaces:

```typescript
// Flat (convenience)
import type { SharedParameter, WidgetConfig, StartCommand } from '@verona/widget';

// Namespaced
import { MainSchema, PayloadInterfacesProperties } from '@verona/widget';
type Config = MainSchema.WidgetConfig;
```

## Spec

Verona Widget Specification: <https://verona-interfaces.github.io/widget/>