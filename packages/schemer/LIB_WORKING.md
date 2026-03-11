# @verona/schemer

TypeScript library for implementing the [Verona Schemer Interface (Spec 3.2.0)](https://verona-interfaces.github.io/schemer/).

A schemer is an interactive tool for developing a coding scheme — a set of rules describing how variable values from assessment responses are to be coded, either automatically or manually. It runs inside an `<iframe>` and communicates with the host application via `postMessage`.

## Workflow

```
Host                              Schemer
 │                                  │
 │  (loads schemer in iframe)       │
 │                                  │── init JS ──▶ new VeronaSchemeApiService()
 │                                  │── onStartCommand() registered
 │◀─── vosReadyNotification ───────│── sendReady()
 │                                  │
 │──── vosStartCommand ────────────▶│── onStartCommand callback fired
 │       variables (required)       │       init UI from variables
 │       codingScheme? (optional)   │       load existing scheme if present
 │       schemerConfig?             │       configure directDownloadUrl etc.
 │                                  │
 │◀─── vosSchemeChangedNotification (repeating, on every user edit)
 │       codingScheme
 │       dependenciesToCode?
```

## Usage

### 1. Instantiate

```typescript
import { VeronaSchemeApiService } from '@verona/schemer';

const schemer = new VeronaSchemeApiService({ debug: true });
```

### 2. Register `onStartCommand` handler

Register **before** calling `sendReady()`. The host responds to the ready notification immediately, so the handler must be in place first.

Unlike the Widget, the StartCommand is **mandatory** for the Schemer — the `variables` list is the foundation the UI is built upon. Per spec, messages without a `sessionId` are silently discarded.

```typescript
schemer.onStartCommand((cmd) => {
  // cmd.sessionId          – required, echoed back in every subsequent message
  // cmd.variables          – base variables from the unit definition (required to work)
  // cmd.codingScheme       – existing scheme to continue editing (optional)
  // cmd.codingSchemeType   – format/version identifier of the scheme (optional)
  // cmd.schemerConfig      – runtime configuration (optional)
  //   .directDownloadUrl   – base URL for lazy-loading additional resources
  //   .sharedParameters    – shared cross-module parameters

  initUiFromVariables(cmd.variables);

  if (cmd.codingScheme) {
    loadScheme(cmd.codingScheme, cmd.codingSchemeType);
  }

  if (cmd.schemerConfig?.directDownloadUrl) {
    configureDownloadUrl(cmd.schemerConfig.directDownloadUrl);
  }
});
```

### 3. Send ready notification

```typescript
import metadata from './metadata.json';

schemer.sendReady({
  metadata: JSON.stringify(metadata)  // stringified JSON-LD from the html header
});
```

### 4. Send scheme changes

Called whenever the user edits the coding scheme. The **complete, updated scheme** is always sent — not a diff. The host stores it for later use by a coder.

`dependenciesToCode` must list all external files or services that a coder will need at runtime (e.g. a supercoder service URL). The host ensures these remain accessible during coding.

```typescript
schemer.sendSchemeChanged(
  serialisedScheme,      // string – complete coding scheme
  schemeType,            // string – format/version identifier (optional)
  [                      // dependenciesToCode (optional)
    { id: 'https://supercoder.example.com', type: 'service' },
    { id: 'rules-v2.json', type: 'file' }
  ],
  sharedParameters       // optional
);
```

### 5. Cleanup

```typescript
// e.g. in Angular ngOnDestroy or a cleanup function
schemer.destroy();
```

## API Reference

### `VeronaSchemeApiService`

#### Constructor

```typescript
new VeronaSchemeApiService(options?: VeronaSchemeOptions)
```

| Option | Type | Default | Description |
|---|---|---|---|
| `debug` | `boolean` | `false` | Enables console logging of sent/received messages |
| `allowedOrigin` | `string` | `'*'` | Restricts which origins are accepted via postMessage |

#### Methods

| Method | Description |
|---|---|
| `sendReady(data)` | Sends `vosReadyNotification` to the host |
| `sendSchemeChanged(scheme?, schemeType?, dependencies?, sharedParameters?)` | Sends `vosSchemeChangedNotification` |
| `onStartCommand(callback)` | Registers a handler for `vosStartCommand` |
| `destroy()` | Removes event listeners and clears all handlers |

#### Getters

| Getter | Type | Description |
|---|---|---|
| `currentSessionId` | `string \| null` | The active session ID, or `null` before `vosStartCommand` is received |

## Types

All types are available as both flat exports and via their namespaces:

```typescript
// Flat (convenience)
import type {
  VariableInfo,
  VariableType,
  VariableFormat,
  Dependency,
  SchemerConfig,
  SharedParameter
} from '@verona/schemer';

// Namespaced
import { MainSchema, PayloadInterfacesProperties } from '@verona/schemer';
type Variable = MainSchema.VariableInfo;
```

### `VariableInfo`

Variables describe the states of controls during assessment and form the basis of all coding rules.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✓ | Identifier, must match `^[0-9a-zA-Z_]+$` |
| `alias` | `string` | | Alternative identifier |
| `type` | `VariableType` | ✓ | `'string' \| 'integer' \| 'number' \| 'boolean' \| 'attachment' \| 'json' \| 'no-value' \| 'coded'` |
| `format` | `VariableFormat` | | e.g. `'text-selection'`, `'image'`, `'audio'`, `'latex'`, … |
| `multiple` | `boolean` | | Value can be an array. Default: `false` |
| `nullable` | `boolean` | | Value can be `null`. Default: `false` |
| `values` | `VariableValue[]` | | List of possible values |
| `valuesComplete` | `boolean` | | Whether `values` is exhaustive. Default: `false` |
| `page` | `string` | | Page of the unit where the variable is located |

### `Dependency`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✓ | Resource identifier (URL or filename) |
| `type` | `'file' \| 'service'` | ✓ | Whether it is a downloadable file or an online service |

## Spec

Verona Schemer Specification: <https://verona-interfaces.github.io/schemer/>