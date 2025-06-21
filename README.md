# buffy

A compact swiss-army-knife for byte manipulation.

Features:
 * Move between data formats with ease!
 * `Buff` objects are instance of `Uint8Array`.
 * Prepend, append, sort, split, chunk, join, and more!
 * Convert blobs of data into consumable streams.
 * Uses `DataView.setUint8` for ultra-fast performace.
 * Supports endianess for all the things!

## How to Import

This library is designed to support classic and modern ESM imports, both in nodejs and a browser environment.

Example install via package manager:

```bash
npm  install @vbyte/buffy
bun  install @vbyte/buffy
yarn add     @vbyte/buffy
```

Classic import into a nodejs project:

```ts
const { Buff, Bytes } = require('@vbyte/buffy')
```

Modern import into an nodejs project:

```ts
import { Buff, Bytes } from '@vbyte/buffy'
```

Classic import into a browser-based project:

```html
<script src="https://unpkg.com/@vbyte/buffy/dist/script.js"></script>
<script>
  const { Buff, Bytes } = window.buff
</script>
```

Modern import into a browser-based project:

```html
<script type="module">
  import { Buff, Bytes } from "https://unpkg.com/@vbyte/buffy/dist/module.mjs" 
</script>
```

## How to Use

The `Buff` class is an extention of the base `Uint8Array` class. It provides the same default functionality of a Uint8Array, and can be used as a drop-in replacement for Uint8Array. Typescript will treat Buff as a Uint8Array object.

```ts
import { Buff, Bytes } from '@vbyte/buffy'

// Bufferable covers value types that are convertable to Uint8Array.
type Bufferable = string | number | bigint | Uint8Array | Buff
// Bytes covers hex strings and byte arrays.
type Bytes  = string | Uint8Array
// You can optionally specify the endianess of data.
type Endian = 'le' | 'be'

const buffer = new Buff (
  bytes   : Bufferable | ArrayBuffer,  
  size   ?: number, // Specify the size of the array (for padding)
  endian ?: Endian  // Specify the endianess of the array.
)

```
You can convert from many different types and formats into a `Buff` object.

```ts
Buff
  .big     = (data : bigint, size ?: number)     => Buff,
  .bin     = (data : string, size ?: number)     => Buff,
  .bytes   = (data : Bytes,  size ?: number)     => Buff,
  .hex     = (data : string, size ?: number)     => Buff,
  .json    = (data : T,  replacer ?: Replacer)   => Buff,
  .num     = (data : number, size ?: number)     => Buff,
  .str     = (data : string, size ?: number)     => Buff,
  .uint    = (data : Uint8Array, size ?: number) => Buff
```

With `Buff`, you have access to an extensive API for converting between formats.

```ts
const buffer = new Buff(data)

/* Quicky convert into many formats using getters. */

buffer
  .big     => bigint      // Convert to a BigInt.
  .bin     => string      // Convert to a binary string.
  .hex     => string      // Convert to a hex string.
  .num     => number      // Convert to a Number.
  .str     => string      // Convert to a UTF8 string.
  .uint    => Uint8Array  // Convert to a pure Uint8Array.

/* There are a few export methods that support extra params. */

buffer
  .to_big  : (endian ?: Endian)   => bigint
  .to_bin  : ()                   => string
  .to_hex  : (endian ?: Endian)   => string
  .to_json : (reviver ?: Reviver) => T
  .to_num  : (endian ?: Endian)   => number
```

In addition to format conversion, you can perform many other convenient tasks.

```ts
Buff
  // Same as Uint8Array.from(), but returns a Buff object.
  .from   (data : Uint8Array | number[]) => Buff,
  // Same as Uint8Array.of(), but returns a Buff object.
  .of     (...data : number[]) => Buff,
  // Join together multiple arrays of bytes.
  .join   (array : Bytes[]) => Buff,
  // Sort multiple arrays of bytes in lexicographic order.
  .sort   (arr : Bytes[], size ?: number) => Buff[],
  // Return a buffer object with random data (uses webcrypto).
  .random (size : number) => Buff,
  // Converts a number into a 'varint' for byte streams.
  .varint (num : number, endian ?: Endian) => Buff

const buffer = new Buff(data)

buffer
  // Append data to your ubber object
  .append   (data : Bytes) => Buff
  // Prepend data to your buffer object.
  .prepend  (data : Bytes) => Buff
  // Same as Uint8Array.reverse(), but returns a Buff object.
  .reverse  () => Buff
  // Identical to Uint8Array.set() method.
  .set      (array : ArrayLike<number>, offset ?: number) => void
  // Same as Uint8Array.slice(), but returns a Buff object.
  .slice    (start ?: number, end ?: number) => Buff
  // Same as Uint8Array.subarray(), but returns a Buff object.
  .subarray (begin ?: number, end ?: number) => Buff
```

The `Stream` tool will take a blob of data and allow you to consume it byte-per-byte.

```ts
import { Stream } from '@vbyte/buffy'

// Convert data into a stream object.
const stream = new Stream(data)

// You can convert a buff object into a stream.
const stream = new Buff(data).stream

stream
  // Reads x number of bytes, does not consume the stream.
  .peek(size: number) => Buff
  // Reads x number of bytes, consumes the stream.
  .read(size: number) => bytes
  // Reads the next bytes(s) as a varint, returns the number value.
  .varint (endian ?: Endian) => number
```

## Bugs / Issues

Please feel free to post any questions or bug reports on the issues page!

## Development / Testing

This project uses `typescript` for development, `tape` for testing, and `rollup` for release bundles.

```bash
npm test
npm run release
```

## Contributions

All contributions are welcome!

## License

Use this code however you like! No warranty!
