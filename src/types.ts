import type Buff   from './class/buff.js'
import type Stream from './class/stream.js'

export type Bytes   = string | number | bigint | Uint8Array | Buff | Stream
export type Endian  = 'le' | 'be'

export type Replacer = (this : any, key : string, value : any) => any
export type Reviver  = (this : any, key : string, value : any) => any
