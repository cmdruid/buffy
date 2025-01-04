import { Assert } from '../util/assert.js'

import type { Endian } from '../types.js'

export function create_buffer (
  data   : number[] | Uint8Array,
  size  ?: number,
  endian : Endian = 'le'
) : Uint8Array {
  if (size === undefined) size = data.length
  Assert.within_size(data, size)
  const buffer = new Uint8Array(size).fill(0)
  const offset = (endian === 'be') ? 0 : size - data.length
  buffer.set(data, offset)
  return buffer
}

export function join_array (
  arr : Array<Uint8Array | number[]>
) : Uint8Array {
  let i, offset = 0
  const size = arr.reduce((len, arr) => len + arr.length, 0)
  const buff = new Uint8Array(size)
  for (i = 0; i < arr.length; i++) {
    const a = arr[i]
    buff.set(a, offset)
    offset += a.length
  }
  return buff
}

export function chunk_data (
  data_blob  : Uint8Array,
  chunk_size : number,
  total_size : number
) : Uint8Array[] {
  const len   = data_blob.length,
        count = total_size / chunk_size
  if (total_size % chunk_size !== 0) {
    throw new TypeError(`Invalid parameters: ${total_size} % ${chunk_size} !== 0`)
  }
  if (len !== total_size) {
    throw new TypeError(`Invalid data stream: ${len} !== ${total_size}`)
  }
  if (len % chunk_size !== 0) {
    throw new TypeError(`Invalid data stream: ${len} % ${chunk_size} !== 0`)
  }
  const chunks = new Array(count)
  for (let i = 0; i < count; i++) {
    const idx = i * chunk_size
    chunks[i] = data_blob.subarray(idx, idx + chunk_size)
  }
  return chunks
}
