import { Check } from '@/util/validate.js'

import type { Bytes } from '@/types.js'

export namespace Assert {

  export function within_size (
    data : number[] | Uint8Array,
    size : number
  ) : void {
    if (data.length > size) {
      throw new TypeError(`Data is larger than array size: ${data.length} > ${size}`)
    }
  }

  export function is_hex (hex : string) : void {
    if (hex.match(/[^a-fA-f0-9]/) !== null) {
      throw new TypeError('Invalid characters in hex string: ' + hex)
    }
    if (hex.length % 2 !== 0) {
      throw new Error(`Length of hex string is invalid: ${hex.length}`)
    }
  }

  export function is_bytes (
    bytes : Bytes
  ) : asserts bytes is Bytes {
    if (!Check.is_bytes(bytes)) {
      throw new Error('Bytes contains invalid elements: ' + String(bytes))
    }
  }

  export function is_json (str : string) : void {
    try {
      JSON.parse(str)
    } catch {
      throw new TypeError('JSON string is invalid!')
    }
  }

  export function is_safe_int (num : number) : void {
    if (num > Number.MAX_SAFE_INTEGER) {
      throw new TypeError('Number exceeds safe bounds!')
    }
  }
}
