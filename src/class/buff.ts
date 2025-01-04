import * as Lib from '../lib/index.js'

import { Assert, Check } from '../util/index.js'

import type { Bytes, Endian, Replacer, Reviver } from '../types.js'

export default class Buff extends Uint8Array {

  static num      = num_to_buff
  static big      = big_to_buff
  static bin      = bin_to_buff
  static uint     = uint_to_buff
  static str      = str_to_buff
  static hex      = hex_to_buff
  static bytes    = bytes_to_buff
  static json     = json_to_buff
  static blob     = blob_to_buff
  static is_equal = is_equal_buff

  static is_bytes = Check.is_bytes
  static is_hex   = Check.is_hex

  static random (size = 32) : Buff {
    const uint = Lib.get_random_bytes(size)
    return new Buff(uint, size)
  }

  static now () : Buff {
    const stamp = Math.floor(Date.now() / 1000)
    return new Buff(stamp, 4)
  }

  constructor (
    data    : Bytes | ArrayBuffer,
    size   ?: number,
    endian ?: Endian
  ) {
    if (data instanceof Buff && size === undefined) {
      return data
    }

    const buffer = Lib.parse_bytes(data, size, endian)
    super(buffer)
  }

  get arr () : number[] {
    return this.to_arr()
  }

  get big () : bigint {
    return this.to_big()
  }

  get bin () : string {
    return this.to_bin()
  }

  get hex () : string {
    return this.to_hex()
  }

  get num () : number {
    return this.to_num()
  }

  get str () : string {
    return this.to_str()
  }

  get uint () : Uint8Array {
    return this.to_uint()
  }

  to_big () : bigint {
    const bytes = this.uint.reverse()
    return Lib.bytes_to_big(bytes)
  }

  to_json <T = any> (reviver ?: Reviver) : T {
    if (reviver === undefined) {
      reviver = Lib.bigint_reviver
    }
    const str = Lib.bytes_to_str(this)
    return JSON.parse(str, reviver)
  }

  to_num () : number {
    const bytes = this.uint.reverse()
    return Lib.bytes_to_num(bytes)
  }

  to_arr   () : number[]   { return [ ...this ]            }
  to_bin   () : string     { return Lib.bytes_to_bin(this) }
  to_hex   () : string     { return Lib.bytes_to_hex(this) }
  to_str   () : string     { return Lib.bytes_to_str(this) }
  to_uint  () : Uint8Array { return new Uint8Array(this)   }

  append (data : Bytes) : Buff {
    return Buff.join([ this, Buff.bytes(data) ])
  }

  equals (data : Bytes) : boolean {
    return bytes_to_buff(data).hex === this.hex
  }

  prepend (data : Bytes) : Buff {
    return Buff.join([ Buff.bytes(data), this ])
  }

  reverse () : this {
    super.reverse()
    return this
  }

  set (array : ArrayLike<number>, offset ?: number) : void {
    this.set(array, offset)
  }

  slice (start ?: number, end ?: number) : Buff {
    const arr = new Uint8Array(this).slice(start, end)
    return new Buff(arr)
  }

  subarray (begin ?: number, end ?: number) : Buff {
    const arr = new Uint8Array(this).subarray(begin, end)
    return new Buff(arr)
  }

  toJSON () {
    return this.hex
  }

  toString () {
    return this.hex
  }

  static from (data : Uint8Array | number[]) : Buff {
    return new Buff(Uint8Array.from(data))
  }

  static of (...args : number[]) : Buff {
    return new Buff(Uint8Array.of(...args))
  }

  static join (arr : Bytes[]) : Buff {
    const bytes  = arr.map(e => Buff.bytes(e))
    const joined = Lib.join_array(bytes)
    return new Buff(joined)
  }

  static sort (arr : Bytes[], size ?: number) : Buff[] {
    const hex = arr.map(e => bytes_to_buff(e, size).hex)
    hex.sort()
    return hex.map(e => Buff.hex(e, size))
  }

  static varint (num : number, endian ?: Endian) : Buff {
    if (num < 0xFD) {
      return Buff.num(num, 1)
    } else if (num < 0x10000) {
      return Buff.of(0xFD, ...Buff.num(num, 2, endian))
    } else if (num < 0x100000000) {
      return Buff.of(0xFE, ...Buff.num(num, 4, endian))
    } else if (BigInt(num) < 0x10000000000000000n) {
      return Buff.of(0xFF, ...Buff.num(num, 8, endian))
    } else {
      throw new Error(`Value is too large: ${num}`)
    }
  }
}

function num_to_buff (
  number  : number,
  size   ?: number,
  endian ?: Endian
) : Buff {
  return new Buff(number, size, endian)
}

function bin_to_buff (
  data    : string,
  size   ?: number,
  endian ?: Endian
) : Buff {
  const uint = Lib.bin_to_bytes(data)
  return new Buff(uint, size, endian)
}

function big_to_buff (
  bigint  : bigint,
  size   ?: number,
  endian ?: Endian
) : Buff {
  return new Buff(bigint, size, endian)
}

function uint_to_buff (
  data    : Uint8Array,
  size   ?: number,
  endian ?: Endian
) : Buff {
  return new Buff(data, size, endian)
}

function str_to_buff (
  data    : string,
  size   ?: number,
  endian ?: Endian
) : Buff {
  const uint = Lib.str_to_bytes(data)
  return new Buff(uint, size, endian)
}

function hex_to_buff (
  data    : string,
  size   ?: number,
  endian ?: Endian
) : Buff {
  Assert.is_hex(data)
  return new Buff(data, size, endian)
}

function json_to_buff <T> (
  data      : T,
  replacer ?: Replacer
) : Buff {
  replacer   = replacer ?? Lib.bigint_replacer
  const str  = JSON.stringify(data, replacer)
  const uint = Lib.str_to_bytes(str)
  return new Buff(uint)
}

function bytes_to_buff (
  bytes   : Bytes,
  size?   : number,
  endian? : Endian
) : Buff {
  // Assert.is_bytes()
  return new Buff(bytes, size, endian)
}

function blob_to_buff (
  payload    : Bytes,
  chunk_size : number,
  total_size : number
) : Buff[] {
  const bytes  = Lib.parse_bytes(payload)
  const chunks = Lib.chunk_data(bytes, chunk_size, total_size)
  return chunks.map(e => new Buff(e))
}

function is_equal_buff (
  a : Bytes,
  b : Bytes
) : boolean {
  return new Buff(a).hex === new Buff(b).hex
}
