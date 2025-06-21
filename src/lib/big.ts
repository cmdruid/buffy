import type { Endian } from '@/types.js'

const _0n   = BigInt(0)
const _255n = BigInt(255)
const _256n = BigInt(256)

export function get_big_size (
  big : bigint) : number {
  // 1 byte.
  if (big <= 0xFFn) return 1
  // 2 bytes.
  if (big <= 0xFFFFn) return 2
  // 4 bytes.
  if (big <= 0xFFFFFFFFn) return 4
  // 8 bytes.
  if (big <= 0xFFFFFFFFFFFFFFFFn) return 8
  // 16 bytes.
  if (big <= 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn) return 16
  // 32 bytes.
  if (big <= 0xFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFFn) {
    return 32
  }
  throw new TypeError('Must specify a fixed buffer size for bigints greater than 32 bytes.')
}

export function big_to_bytes (
  big    : bigint,
  size  ?: number,
  endian : Endian = 'be'
) : Uint8Array {
  if (size === undefined) size = get_big_size(big)
  const use_le   = (endian === 'le')
  const buffer   = new ArrayBuffer(size)
  const dataView = new DataView(buffer)
    let offset   = (use_le) ? 0 : size - 1
  while (big > _0n) {
    const byte = big & _255n
    const num  = Number(byte)
    if (use_le) {
      dataView.setUint8(offset++, num)
    } else {
      dataView.setUint8(offset--, num)
    }
    big = (big - byte) / _256n
  }
  return new Uint8Array(buffer)
}

export function bytes_to_big (
  bytes : Uint8Array
) : bigint {
  let num = BigInt(0)
  for (let i = bytes.length - 1; i >= 0; i--) {
    num = (num * _256n) + BigInt(bytes[i])
  }
  return BigInt(num)
}

export function bigint_replacer (_ : any, v : any) : any {
  return typeof v === 'bigint'
    ? `${v}n`
    : v
}

export function bigint_reviver (_ : any, v : any) : any {
  return typeof v === 'string' && /^[0-9]+n$/.test(v)
    ? BigInt(v.slice(0, -1))
    : v
}
