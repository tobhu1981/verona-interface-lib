# @verona/editor

TypeScript library for implementing the [Verona Editor Interface (Spec 4.6.0)](https://verona-interfaces.github.io/editor/).

An editor is an interactive tool for developing a unit — defining its visual appearance and interaction elements. It runs inside an `<iframe>` and communicates with the host application via `postMessage`.

## Workflow

```
Host                                  Editor
 │                                      │
 │  (loads editor in iframe)            │
 │                                      │── init JS ──▶ new VeronaEditorApiService()
 │                                      │── onStartCommand() registered
 │◀─── voeReadyNotification ───────────│── sendReady()
 │                                      │
 │──── voeStartCommand ────────────────▶│── onStartCommand callback fired
 │       sessionId (required)           │       load unitDefinition into UI
 │       unitDefinition? (optional)     │       apply role / directDownloadUrl
 │       editorConfig?                  │
 │                                      │
 │◀─── voeDefinitionChangedNotification (repeating, on every user edit)
 │       unitDefinition
 │       variables (always current)
 │       dependenciesToPlay?
 │       dependenciesToEdit?
```

## Usage

### 1. Instantiate

```typescript
import { VeronaEditorApiService } from '@verona/editor';

const editor = new VeronaEditorApiService({ debug: true });
```

### 2. Register `onStartCommand` handler

Register **before** calling `sendReady()`. The host responds to the ready notification immediately, so the handler must be in place first.

The StartCommand is **mandatory** for the Editor — it carries the unit definition and configuration needed to initialise the UI. Per spec, messages without a `sessionId` are silently discarded.

```typescript
editor.onStartCommand((cmd) => {
  // cmd.sessionId              – required, echoed in every subsequent message
  // cmd.unitDefinition         – existing definition to continue editing (optional)
  // cmd.unitDefinitionType     – format/version identifier (optional)
  // cmd.editorConfig
  //   .role                    – access level: 'guest' | 'commentator' | 'developer' | 'maintainer' | 'super'
  //   .directDownloadUrl       – base URL for lazy-loading resources (e.g. GeoGebra)
  //   .sharedParameters        – shared cross-module parameters

  if (cmd.unitDefinition) {
    loadDefinition(cmd.unitDefinition, cmd.unitDefinitionType);
  }

  if (cmd.editorConfig?.role) {
    applyRole(cmd.editorConfig.role);
  }

  if (cmd.editorConfig?.directDownloadUrl) {
    configureDownloadUrl(cmd.editorConfig.directDownloadUrl);
  }
});
```

### 3. Send ready notification

```typescript
import metadata from './metadata.json';

editor.sendReady({
  metadata: JSON.stringify(metadata)  // stringified JSON-LD from the html header
});
```

### 4. Send definition changes

Called whenever the user edits the unit. The **complete, updated definition** is always sent — not a diff. The `variables` list must always be current, as it is used by the schemer to prepare the coding scheme.

`dependenciesToPlay` and `dependenciesToEdit` should list all external files or services required at runtime so the host can check availability and warn if something is missing.

```typescript
editor.sendDefinitionChanged(
  serialisedDefinition,    // string – complete unit definition
  definitionType,          // string – format/version identifier (optional)
  variables,               // VariableInfo[] – current variable list
  [                        // dependenciesToPlay (optional)
    { id: 'GeoGebra.itcr.zip', type: 'file' }
  ],
  [                        // dependenciesToEdit (optional)
    { id: 'GeoGebra.itcr.zip', type: 'file' }
  ],
  sharedParameters         // optional
);
```

### 5. Cleanup

```typescript
// e.g. in Angular ngOnDestroy or a cleanup function
editor.destroy();
```

## API Reference

### `VeronaEditorApiService`

#### Constructor

```typescript
new VeronaEditorApiService(options?: VeronaEditorOptions)
```

| Option | Type | Default | Description |
|---|---|---|---|
| `debug` | `boolean` | `false` | Enables console logging of sent/received messages |
| `allowedOrigin` | `string` | `'*'` | Restricts which origins are accepted via postMessage |

#### Methods

| Method | Description |
|---|---|
| `sendReady(data)` | Sends `voeReadyNotification` to the host |
| `sendDefinitionChanged(definition?, definitionType?, variables?, dependenciesToPlay?, dependenciesToEdit?, sharedParameters?)` | Sends `voeDefinitionChangedNotification` |
| `onStartCommand(callback)` | Registers a handler for `voeStartCommand` |
| `destroy()` | Removes event listeners and clears all handlers |

#### Getters

| Getter | Type | Description |
|---|---|---|
| `currentSessionId` | `string \| null` | The active session ID, or `null` before `voeStartCommand` is received |

## Types

All types are available as both flat exports and via their namespaces:

```typescript
// Flat (convenience)
import type {
  VariableInfo,
  VariableType,
  VariableFormat,
  Dependency,
  EditorConfig,
  EditorRole,
  SharedParameter
} from '@verona/editor';

// Namespaced
import { MainSchema, PayloadInterfacesProperties } from '@verona/editor';
type Variable = MainSchema.VariableInfo;
```

### `EditorRole`

Controls which features of the editor UI are available to the editing person.

| Value | Description |
|---|---|
| `'guest'` | Maximum restrictions |
| `'commentator'` | Can view and comment |
| `'developer'` | Can edit most elements |
| `'maintainer'` | Extended editing rights |
| `'super'` | Maximum access, no restrictions |

### `VariableInfo`

Variables describe the states of controls during assessment. The editor always sends a current list alongside the unit definition so the schemer can build the coding scheme.

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✓ | Identifier, must match `^[0-9a-zA-Z_]+$` |
| `alias` | `string` | | User-assignable alternative ID. Once set, `id` stays constant across versions. |
| `type` | `VariableType` | ✓ | `'string' \| 'integer' \| 'number' \| 'boolean' \| 'attachment' \| 'json' \| 'no-value' \| 'coded'` |
| `format` | `VariableFormat` | | e.g. `'text-selection'`, `'image'`, `'audio'`, `'latex'`, `'ggb-file'`, … |
| `multiple` | `boolean` | | Value can be an array. Default: `false` |
| `nullable` | `boolean` | | Value can be `null`. Default: `false` |
| `values` | `VariableValue[]` | | List of possible values |
| `valuesComplete` | `boolean` | | Whether `values` is exhaustive (enables automatic coding). Default: `false` |
| `page` | `string` | | Page of the unit where the variable is located |

### `Dependency`

| Field | Type | Required | Description |
|---|---|---|---|
| `id` | `string` | ✓ | Resource identifier (URL or filename) |
| `type` | `'file' \| 'service'` | ✓ | Whether it is a downloadable file or an online service |

## Spec

Verona Editor Specification: <https://verona-interfaces.github.io/editor/>