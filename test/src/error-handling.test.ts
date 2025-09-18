import { Test } from 'tape'
import { Buff, Stream } from '@src/buff'
import { Assert } from '@src/buff/util'
import * as Lib from '@src/buff/lib'

export default function errorHandlingTest(t: Test) {
  t.test('Error Handling Test Suite', t => {

    // Phase 1: Assert Module Error Testing
    t.test('Assert.within_size error handling', t => {
      t.plan(1)

      const data = new Uint8Array(10)
      const size = 5

      t.throws(
        () => Assert.within_size(data, size),
        /Data is larger than array size/,
        'Should throw when data exceeds specified size'
      )
    })

    t.test('Assert.is_hex error handling', t => {
      t.plan(3)

      // Test invalid characters
      t.throws(
        () => Assert.is_hex('xyz123'),
        /Invalid characters in hex string/,
        'Should throw on invalid hex characters'
      )

      // Test odd length
      t.throws(
        () => Assert.is_hex('abcde'),
        /Length of hex string is invalid/,
        'Should throw on odd-length hex string'
      )

      // Test mixed invalid characters and length
      t.throws(
        () => Assert.is_hex('xyza'),
        /Invalid characters in hex string/,
        'Should throw on invalid characters even with valid length'
      )
    })

    t.test('Assert.is_bytes error handling', t => {
      t.plan(3)

      // Test invalid hex string
      t.throws(
        () => Assert.is_bytes('not-hex'),
        /Bytes contains invalid elements/,
        'Should throw on invalid hex string'
      )

      // Test non-string, non-Uint8Array input
      t.throws(
        () => Assert.is_bytes(123 as any),
        /Bytes contains invalid elements/,
        'Should throw on number input'
      )

      // Test null input
      t.throws(
        () => Assert.is_bytes(null as any),
        /Bytes contains invalid elements/,
        'Should throw on null input'
      )
    })

    t.test('Assert.is_json error handling', t => {
      t.plan(3)

      // Test malformed JSON
      t.throws(
        () => Assert.is_json('{invalid json}'),
        /JSON string is invalid/,
        'Should throw on malformed JSON object'
      )

      // Test incomplete JSON
      t.throws(
        () => Assert.is_json('{"key": "value"'),
        /JSON string is invalid/,
        'Should throw on incomplete JSON'
      )

      // Test undefined as string
      t.throws(
        () => Assert.is_json('undefined'),
        /JSON string is invalid/,
        'Should throw on "undefined" string'
      )
    })

    t.test('Assert.is_safe_int error handling', t => {
      t.plan(2)

      // Test number exceeding MAX_SAFE_INTEGER
      t.throws(
        () => Assert.is_safe_int(Number.MAX_SAFE_INTEGER + 1),
        /Number exceeds safe bounds/,
        'Should throw when number exceeds MAX_SAFE_INTEGER'
      )

      // Test very large number
      t.throws(
        () => Assert.is_safe_int(Number.MAX_VALUE),
        /Number exceeds safe bounds/,
        'Should throw on MAX_VALUE'
      )
    })

    // Phase 2: Buff Class Error Testing
    t.test('Buff constructor error handling', t => {
      t.plan(3)

      // Test null input
      t.throws(
        () => new Buff(null as any),
        /Input type not supported/,
        'Should throw on null input'
      )

      // Test undefined input
      t.throws(
        () => new Buff(undefined as any),
        /Input type not supported/,
        'Should throw on undefined input'
      )

      // Test Symbol input
      t.throws(
        () => new Buff(Symbol('test') as any),
        /Input type not supported/,
        'Should throw on Symbol input'
      )
    })

    t.test('Buff.hex static method error handling', t => {
      t.plan(2)

      // Test invalid hex characters
      t.throws(
        () => Buff.hex('invalid'),
        /Invalid characters in hex string/,
        'Should throw on invalid hex input'
      )

      // Test odd-length hex string
      t.throws(
        () => Buff.hex('abc'),
        /Length of hex string is invalid/,
        'Should throw on odd-length hex string'
      )
    })

    t.test('Buff.varint static method error handling', t => {
      t.plan(1)

      // Test oversized values (greater than 2^64)
      // Since JS numbers can't represent values >= 2^64 accurately,
      // we use Number.MAX_VALUE which when converted to BigInt exceeds the limit
      t.throws(
        () => Buff.varint(Number.MAX_VALUE),
        /Value is too large/,
        'Should throw on oversized varint values'
      )
    })

    t.test('Buff.blob static method error handling', t => {
      t.plan(3)

      // Test zero chunk size
      t.throws(
        () => Buff.blob('abcd', 0, 4),
        /Invalid parameters/,
        'Should throw on zero chunk size'
      )

      // Test mismatched sizes
      t.throws(
        () => Buff.blob('abcd', 3, 4),
        /Invalid parameters.*% .* !== 0/,
        'Should throw when total_size % chunk_size !== 0'
      )

      // Test data length mismatch
      t.throws(
        () => Buff.blob('ab', 2, 4),
        /Invalid data stream/,
        'Should throw when data length != total_size'
      )
    })

    t.test('Buff instance method error handling', t => {
      t.plan(1)

      // Test prefix_varint on empty buffer
      const empty = new Buff('')
      t.throws(
        () => empty.prefix_varint(),
        /buffer is empty/,
        'Should throw when calling prefix_varint on empty buffer'
      )
    })

    t.test('Buff endianness edge cases', t => {
      t.plan(4)

      // Test that large buffers handle endianness without throwing
      const large = Buff.random(32)

      t.doesNotThrow(
        () => large.to_big('be'),
        'Should handle big-endian conversion for large buffers'
      )

      t.doesNotThrow(
        () => large.to_big('le'),
        'Should handle little-endian conversion for large buffers'
      )

      t.doesNotThrow(
        () => large.to_hex('be'),
        'Should handle big-endian hex conversion for large buffers'
      )

      t.doesNotThrow(
        () => large.to_hex('le'),
        'Should handle little-endian hex conversion for large buffers'
      )
    })

    // Phase 3: Stream Class Error Testing
    t.test('Stream.peek boundary condition error handling', t => {
      t.plan(2)

      // Test oversized peek on small stream (abcd hex = 2 bytes)
      const stream = new Stream('abcd')
      t.throws(
        () => stream.peek(10),
        /Size greater than stream/,
        'Should throw when peek size exceeds stream size'
      )

      // Test peek size equal to stream size (should not throw)
      t.doesNotThrow(
        () => stream.peek(2),
        'Should not throw when peek size equals stream size'
      )
    })

    t.test('Stream.read boundary condition error handling', t => {
      t.plan(2)

      // Test oversized read on small stream (abcd hex = 2 bytes)
      const stream = new Stream('abcd')
      t.throws(
        () => stream.read(10),
        /Size greater than stream/,
        'Should throw when read size exceeds stream size'
      )

      // Test reading exactly the stream size (should not throw)
      const stream2 = new Stream('abcd')
      t.doesNotThrow(
        () => stream2.read(2),
        'Should not throw when reading exactly the stream size'
      )
    })

    t.test('Stream.varint error handling', t => {
      t.plan(1)

      // Test stream too short for varint payload
      const shortStream = new Stream(Buff.of(0xFD)) // Requires 2 more bytes but stream is empty
      t.throws(
        () => shortStream.varint(),
        /Size greater than stream/,
        'Should throw when stream is too short for varint payload'
      )
    })

    t.test('Stream state consistency after errors', t => {
      t.plan(2)

      // Test that stream state is preserved after failed operations
      const stream = new Stream('abcd')
      const originalSize = stream.size

      try {
        stream.peek(10)
      } catch (e) {
        // Error expected
      }

      t.equal(
        stream.size,
        originalSize,
        'Stream size should be unchanged after failed peek'
      )

      try {
        stream.read(10)
      } catch (e) {
        // Error expected
      }

      t.equal(
        stream.size,
        originalSize,
        'Stream size should be unchanged after failed read'
      )
    })

    // Phase 4: Library Function Error Testing
    t.test('hex_to_bytes error handling', t => {
      t.plan(1)

      // Test hex string larger than specified size
      t.throws(
        () => Lib.hex_to_bytes('abcdef', 2),
        /Hex string is larger than array size/,
        'Should throw when hex string exceeds specified size'
      )
    })

    t.test('num_to_bytes error handling', t => {
      t.plan(1)

      // Test oversized numbers without explicit size
      t.throws(
        () => Lib.num_to_bytes(Number.MAX_SAFE_INTEGER + 1),
        /Numbers larger than 4 bytes must specify a fixed size/,
        'Should throw on oversized numbers without size'
      )
    })

    t.test('bytes_to_num error handling', t => {
      t.plan(1)

      // Test conversion that would exceed safe integer bounds
      const largeBytes = new Uint8Array(8).fill(255)
      t.throws(
        () => Lib.bytes_to_num(largeBytes),
        /Number exceeds safe bounds/,
        'Should throw when result exceeds safe integer bounds'
      )
    })

    t.test('bin_to_bytes error handling', t => {
      t.plan(1)

      // Test invalid binary string length (not multiple of 8)
      t.throws(
        () => Lib.bin_to_bytes('1010101'),
        /Binary array is invalid length/,
        'Should throw when binary string length is not multiple of 8'
      )
    })

    t.test('bytes_to_bin error handling', t => {
      t.plan(1)

      // Test invalid byte values (> 255)
      // Note: In practice, Uint8Array prevents values > 255, but we test the validation
      const mockArray = { length: 1, [Symbol.iterator]: function* () { yield 256; } }
      t.throws(
        () => Lib.bytes_to_bin(mockArray as any),
        /Invalid byte value/,
        'Should throw on invalid byte values'
      )
    })

    t.test('split_bytes error handling', t => {
      t.plan(2)

      // Test invalid chunk/total size ratio (total_size % chunk_size !== 0)
      const data1 = new Uint8Array(9)
      t.throws(
        () => Lib.split_bytes(data1, 4, 9),
        /Invalid parameters.*% .* !== 0/,
        'Should throw when total_size % chunk_size !== 0'
      )

      // Test data length mismatch with total_size
      const data2 = new Uint8Array(10)
      t.throws(
        () => Lib.split_bytes(data2, 5, 15),
        /Invalid data stream.*!== /,
        'Should throw when data length != total_size'
      )

      // Note: The third condition (len % chunk_size !== 0) is logically unreachable
      // because if len === total_size and total_size % chunk_size === 0,
      // then len % chunk_size === 0 as well. This is redundant defensive code.
    })

    t.test('create_bytes error handling', t => {
      t.plan(1)

      // Test data larger than specified size
      const data = new Uint8Array(10)
      t.throws(
        () => Lib.create_bytes(data, 5),
        /Data is larger than array size/,
        'Should throw when data exceeds specified size'
      )
    })

    // Phase 5: Crypto Fallback Testing
    t.test('get_random_bytes basic functionality', t => {
      t.plan(2)

      // Test normal operation
      const result = Lib.get_random_bytes(32)
      t.equal(result.length, 32, 'Should return buffer of correct size')
      t.ok(result instanceof Uint8Array, 'Should return Uint8Array')

      // Note: Testing crypto availability fallbacks requires complex mocking
      // that would interfere with the global crypto object. In a real-world scenario,
      // you would use dependency injection or mocking frameworks like Jest
      // to properly test these conditions.
    })
  })
}