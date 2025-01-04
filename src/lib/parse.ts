import { big_to_bytes }  from './big.js'
import { num_to_bytes }  from './num.js'
import { hex_to_bytes }  from './hex.js'
import { create_buffer } from './util.js'

import type { Bytes, Endian } from '../types.js'

export function parse_bytes (
  bytes   : Bytes | ArrayBuffer,
  size   ?: number,
  endian ?: Endian
) : Uint8Array {
  if (bytes instanceof ArrayBuffer) {
    return new Uint8Array(bytes)
  } else if (bytes instanceof Uint8Array) {
    return create_buffer(bytes, size, endian)
  } else if (typeof bytes === 'string') {
    return hex_to_bytes(bytes, size, endian)
  } else if (typeof bytes === 'bigint') {
    return big_to_bytes(bytes, size, endian)
  } else if (typeof bytes === 'number') {
    return num_to_bytes(bytes, size, endian)
  }
  throw new TypeError('Input type not supported:' + typeof bytes)
}
