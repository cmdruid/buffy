import { Assert } from '../util/assert.js'

import type { Endian } from '../types.js'

export function get_hex_size (
  hexstr  : string,
  size   ?: number
) : number {
  Assert.is_hex(hexstr)
  const len = hexstr.length / 2
  if (size === undefined) size = len
  if (len > size) {
     throw new TypeError(`Hex string is larger than array size: ${len} > ${size}`)
  }
  return size
}

export function hex_to_bytes (
  hexstr : string,
  size  ?: number,
  endian : Endian = 'be'
) : Uint8Array {
  size = get_hex_size(hexstr, size)
  const use_be   = (endian === 'be')
  const buffer   = new ArrayBuffer(size)
  const dataView = new DataView(buffer)
    let offset   = (use_be) ? 0 : size - 1
  for (let i = 0; i < hexstr.length; i += 2) {
    const char = hexstr.substring(i, i + 2)
    const num  = parseInt(char, 16)
    if (use_be) {
      dataView.setUint8(offset++, num)
    } else {
      dataView.setUint8(offset--, num)
    }
  }
  return new Uint8Array(buffer)
}

export function bytes_to_hex (
  bytes : Uint8Array
) : string {
  let chars = ''
  for (let i = 0; i < bytes.length; i++) {
    chars += bytes[i].toString(16).padStart(2, '0')
  }
  return chars
}
