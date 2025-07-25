import * as Lib   from '@/lib/index.js'

import { Assert, Check } from '@/util/index.js'

import type {
  Buffable,
  Bytes,
  Endian,
  Replacer,
  Reviver
} from '@/types.js'

export class Buff extends Uint8Array {

  static num = (
    number  : number,
    size   ?: number,
    endian ?: Endian
  ) : Buff => {
    return new Buff(number, size, endian)
  }

  static big = (
    bigint  : bigint,
    size   ?: number,
    endian ?: Endian
  ) : Buff => {
    return new Buff(bigint, size, endian)
  }

  static bin = (
    data    : string,
    size   ?: number,
    endian ?: Endian
  ) : Buff => {
    const uint = Lib.bin_to_bytes(data)
    return new Buff(uint, size, endian)
  }

  static uint = (
    data    : Uint8Array,
    size   ?: number,
    endian ?: Endian
  ) : Buff => {
    return new Buff(data, size, endian)
  }

  static str = (
    data    : string,
    size   ?: number,
    endian ?: Endian
  ) : Buff => {
    const uint = Lib.str_to_bytes(data)
    return new Buff(uint, size, endian)
  }

  static hex = (
    data    : string,
    size   ?: number,
    endian ?: Endian
  ) : Buff => {
    Assert.is_hex(data)
    return new Buff(data, size, endian)
  }

  static bytes = (
    bytes   : Bytes,
    size?   : number,
    endian? : Endian
  ) : Buff => {
    Assert.is_bytes(bytes)
    return new Buff(bytes, size, endian)
  }

  static json = <T>(
    data      : T,
    replacer ?: Replacer
  ) : Buff => {
    replacer   = replacer ?? Lib.bigint_replacer
    const str  = JSON.stringify(data, replacer)
    const uint = Lib.str_to_bytes(str)
    return new Buff(uint)
  }

  static blob = (
    payload    : Bytes,
    chunk_size : number,
    total_size : number
  ) : Buff[] => {
    const bytes  = Lib.buffer(payload)
    const chunks = Lib.split_bytes(bytes, chunk_size, total_size)
    return chunks.map(e => new Buff(e))
  }

  static is_equal = (
    a : Buffable,
    b : Buffable
  ) : boolean => {
    return new Buff(a).hex === new Buff(b).hex
  }

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
    data    : Buffable | ArrayBuffer,
    size   ?: number,
    endian ?: Endian
  ) {
    if (data instanceof Buff && size === undefined) {
      return data
    }
    const buffer = Lib.buffer(data, size, endian)
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

  to_big (endian : Endian = 'be') : bigint {
    const bytes = (endian === 'be')
      ? this.uint.reverse()
      : this.uint
    return Lib.bytes_to_big(bytes)
  }

  to_hex (endian : Endian = 'be') : string {
    const bytes = (endian === 'be')
      ? this.uint
      : this.uint.reverse()
    return Lib.bytes_to_hex(bytes)
  }

  to_json <T = any> (reviver ?: Reviver) : T {
    if (reviver === undefined) {
      reviver = Lib.bigint_reviver
    }
    const str = Lib.bytes_to_str(this)
    return JSON.parse(str, reviver)
  }

  to_num (endian : Endian = 'be') : number {
    const bytes = (endian === 'be')
      ? this.uint.reverse()
      : this.uint
    return Lib.bytes_to_num(bytes)
  }

  to_arr   () : number[]   { return [ ...this ]            }
  to_bin   () : string     { return Lib.bytes_to_bin(this) }
  to_str   () : string     { return Lib.bytes_to_str(this) }
  to_uint  () : Uint8Array { return new Uint8Array(this)   }

  append (data : Buffable) : Buff {
    return Buff.join([ this, new Buff(data) ])
  }

  equals (data : Buffable) : boolean {
    return new Buff(data).hex === this.hex
  }

  prepend (data : Buffable) : Buff {
    return Buff.join([ new Buff(data), this ])
  }

  prefix_varint (endian ?: Endian) : Buff {
    if (this.length === 0) throw new Error('buffer is empty')
    const varint = Buff.varint(this.length, endian)
    return this.prepend(varint)
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

  static join (arr : Buffable[]) : Buff {
    const bytes  = arr.map(e => new Buff(e))
    const joined = Lib.join_bytes(bytes)
    return new Buff(joined)
  }

  static sort (arr : Buffable[], size ?: number) : Buff[] {
    const hex = arr.map(e => new Buff(e, size).hex)
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
