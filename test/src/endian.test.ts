import { Test } from 'tape'
import { Buff } from '@src/buff'

import * as Lib from '@src/buff/lib'

const number  = 4294901760
const bigint  = BigInt(number)
const hexstr  = 'ffff0000'
const uint_be = new Uint8Array([ 255, 255, 0, 0 ])
const uint_le = new Uint8Array([ 0, 0, 255, 255 ])

export default function endian_test(t : Test) {

  t.test('Endianess test.', t => {

    const num_be_to_uint = Lib.num_to_bytes(number, 4, 'be')
    const num_le_to_uint = Lib.num_to_bytes(number, 4, 'le')

    const big_be_to_uint = Lib.big_to_bytes(bigint, 4, 'be')
    const big_le_to_uint = Lib.big_to_bytes(bigint, 4, 'le')

    const hex_be_to_uint = Lib.hex_to_bytes(hexstr, 4, 'be')
    const hex_le_to_uint = Lib.hex_to_bytes(hexstr, 4, 'le')

    const uint_be_to_num = Buff.uint(uint_be).to_num('be')
    const uint_le_to_num = Buff.uint(uint_le).to_num('le')

    const uint_be_to_big = Buff.uint(uint_be).to_big('be')
    const uint_le_to_big = Buff.uint(uint_le).to_big('le')

    const uint_be_to_hex = Buff.uint(uint_be).to_hex('be')
    const uint_le_to_hex = Buff.uint(uint_le).to_hex('le')

    t.plan(12)

    t.deepEqual(num_be_to_uint, uint_be, 'num_be_to_uint should match target.')
    t.deepEqual(num_le_to_uint, uint_le, 'num_le_to_uint should match target.')

    t.deepEqual(big_be_to_uint, uint_be, 'big_be_to_uint should match target.')
    t.deepEqual(big_le_to_uint, uint_le, 'big_le_to_uint should match target.')

    t.deepEqual(hex_be_to_uint, uint_be, 'hex_be_to_uint should match target.')
    t.deepEqual(hex_le_to_uint, uint_le, 'hex_le_to_uint should match target.')

    t.equal(uint_be_to_num, number, 'uint_be_to_num should match target.')
    t.equal(uint_le_to_num, number, 'uint_le_to_num should match target.')

    t.equal(uint_be_to_big, bigint, 'uint_be_to_big should match target.')
    t.equal(uint_le_to_big, bigint, 'uint_le_to_big should match target.')

    t.equal(uint_be_to_hex, hexstr, 'uint_be_to_hex should match target.')
    t.equal(uint_le_to_hex, hexstr, 'uint_le_to_hex should match target.')
  })
}
