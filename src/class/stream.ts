import Buff from '@/class/buff.js'

import type { Bytes, Endian } from '@/types.js'

export default class Stream {
  public size : number
  public data : Uint8Array

  constructor (data : Bytes) {
    this.data = Buff.bytes(data)
    this.size = this.data.length
  }

  peek (size : number) : Buff {
    if (size > this.size) {
      throw new Error(`Size greater than stream: ${size} > ${this.size}`)
    }
    return new Buff(this.data.slice(0, size))
  }

  read (size : number) : Buff {
    const chunk = this.peek(size)
    this.data = this.data.slice(size)
    this.size = this.data.length
    return chunk
  }

  varint (endian ?: Endian) : number {
    const num = this.read(1).num
    switch (true) {
      case (num >= 0 && num < 0xFD):
        return num
      case (num === 0xFD):
        return this.read(2).to_num(endian)
      case (num === 0xFE):
        return this.read(4).to_num(endian)
      case (num === 0xFF):
        return this.read(8).to_num(endian)
      default:
        throw new Error(`Varint is out of range: ${num}`)
    }
  }
}
