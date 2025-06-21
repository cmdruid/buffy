import { Assert } from '@/util/assert.js'

import type { Endian } from '@/types.js'

export function get_num_size (
  num : number
) : number {
  // 1 byte.
  if (num <= 0xFF) return 1
  // 2 bytes.
  if (num <= 0xFFFF) return 2
  // 4 bytes.
  if (num <= 0xFFFFFFFF) return 4
  throw new TypeError('Numbers larger than 4 bytes must specify a fixed size!')
}

export function num_to_bytes (
  num    : number,
  size  ?: number,
  endian : Endian = 'be'
) : Uint8Array {
  if (size === undefined) size = get_num_size(num)
  const use_le   = (endian === 'le')
  const buffer   = new ArrayBuffer(size)
  const dataView = new DataView(buffer)
    let offset   = (use_le) ? 0 : size - 1
  while (num > 0) {
    const byte = num & 255
    if (use_le) {
      dataView.setUint8(offset++, num)
    } else {
      dataView.setUint8(offset--, num)
    }
    num = (num - byte) / 256
  }
  return new Uint8Array(buffer)
}

export function bytes_to_num (
  bytes : Uint8Array
) : number {
  let num = 0
  for (let i = bytes.length - 1; i >= 0; i--) {
    num = (num * 256) + bytes[i]
    Assert.is_safe_int(num)
  }
  return num
}
