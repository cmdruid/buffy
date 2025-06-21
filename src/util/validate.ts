import type { Bytes } from '../types.js'

export namespace Check {

  export function is_hex (input : string) : boolean {
    return (
      input.match(/[^a-fA-F0-9]/) === null && 
      input.length % 2 === 0
    )
  }

  export function is_bytes (input : any) : input is Bytes {
    if (typeof input === 'string' && is_hex(input)) {
      return true
    } else if (input instanceof Uint8Array) {
      return true
    } else if (
      Array.isArray(input) &&
      input.every(e => typeof e === 'number')
    ) {
      return true
    } else  {
      return false
    }
  }
}
