# @verona/shared

Shared utilities for Verona interface libraries.

## Installation

```bash
npm install @verona/shared
```

## Features

- **Encoding/Decoding**: UTF-8 safe Base64 encoding and decoding
- **Validation**: Utilities for validating Verona messages and data

## Usage

```typescript
import { encodeBase64, decodeBase64, isVeronaMessage } from '@verona/shared';

// Encoding
const encoded = encodeBase64({ key: 'value' });
console.log(encoded); // "eyJrZXkiOiJ2YWx1ZSJ9"

// Decoding
const decoded = decodeBase64<{ key: string }>(encoded);
console.log(decoded); // { key: 'value' }

// Validation
const isValid = isVeronaMessage({ type: 'vopReadyNotification' });
console.log(isValid); // true
```

## API Reference

### `encodeBase64(data: object | string): string`

Encodes data to Base64 string (UTF-8 safe).

### `decodeBase64<T>(base64: string): T`

Decodes Base64 string to data (UTF-8 safe).

### `isValidISODateTime(value: string): boolean`

Validates ISO 8601 date-time string.

### `isValidOperationId(value: string): boolean`

Validates Verona operation ID format.

### `isVeronaMessage(obj: any): boolean`

Checks if object is a valid Verona message.

## License

MIT