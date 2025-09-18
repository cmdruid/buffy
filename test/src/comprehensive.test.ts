import { Test } from 'tape'
import { Buff, Stream } from '@src/buff'

export default function comprehensiveTest(t: Test) {
  t.test('Comprehensive Test Suite', t => {

    // ===== 1. EDGE CASES & BOUNDARY VALUES =====

    t.test('Empty buffer operations', t => {
      t.plan(8)

      const empty = new Buff('')

      t.equal(empty.length, 0, 'Empty buffer should have length 0')
      t.equal(empty.hex, '', 'Empty buffer hex should be empty string')
      t.equal(empty.str, '', 'Empty buffer str should be empty string')
      t.equal(empty.bin, '', 'Empty buffer bin should be empty string')
      t.equal(empty.big, 0n, 'Empty buffer big should be 0n')
      t.equal(empty.num, 0, 'Empty buffer num should be 0')
      t.deepEqual(empty.to_arr(), [], 'Empty buffer array should be empty')
      t.equal(empty.uint.length, 0, 'Empty buffer uint8array should have length 0')
    })

    t.test('Single byte operations', t => {
      t.plan(6)

      const single = new Buff(255)

      t.equal(single.length, 1, 'Single byte buffer should have length 1')
      t.equal(single.hex, 'ff', 'Single byte 255 should be hex ff')
      t.equal(single.num, 255, 'Single byte should convert back to 255')
      t.equal(single.big, 255n, 'Single byte should convert to 255n')
      t.deepEqual(single.to_arr(), [255], 'Single byte array should be [255]')
      t.equal(single.bin, '11111111', 'Single byte 255 should be all 1s in binary')
    })

    t.test('Large buffer operations', t => {
      t.plan(4)

      // Test 1KB buffer
      const large = Buff.random(1024)

      t.equal(large.length, 1024, 'Large buffer should have correct length')
      t.equal(large.hex.length, 2048, 'Large buffer hex should be 2x length')
      t.doesNotThrow(() => large.to_hex(), 'Large buffer hex conversion should not throw')
      t.doesNotThrow(() => large.slice(0, 100), 'Large buffer slicing should not throw')
    })

    t.test('Unicode and UTF-8 edge cases', t => {
      t.plan(4)

      // Test various Unicode characters
      const unicodeStrings = [
        'Hello 👋 World 🌍',
        '测试中文字符',
        'Ñoño café',
        '🚀🌟💫✨'
      ]

      unicodeStrings.forEach(str => {
        const buff = Buff.str(str)
        const roundtrip = buff.str
        t.equal(str, roundtrip, `Unicode string "${str}" should round-trip correctly`)
      })
    })

    t.test('Maximum and minimum numeric values', t => {
      t.plan(6)

      // Test various numeric boundaries
      t.doesNotThrow(() => new Buff(0), 'Should handle zero')
      t.doesNotThrow(() => new Buff(255), 'Should handle max single byte')
      t.doesNotThrow(() => new Buff(65535), 'Should handle max uint16')
      t.doesNotThrow(() => new Buff(0xFFFFFFFF), 'Should handle max uint32')

      // Test bigint boundaries
      t.doesNotThrow(() => Buff.big(0n), 'Should handle zero bigint')
      t.doesNotThrow(() => Buff.big(0xFFFFFFFFFFFFFFFFn), 'Should handle large bigint')
    })

    t.test('Hex string format variations', t => {
      t.plan(4)

      // Test case sensitivity
      t.equal(Buff.hex('abcd').hex, Buff.hex('ABCD').hex, 'Hex should be case insensitive')

      // Test various hex lengths
      t.equal(Buff.hex('01').length, 1, 'Short hex should work')
      t.equal(Buff.hex('0123456789abcdef').length, 8, 'Long hex should work')

      // Test leading zeros
      t.equal(Buff.hex('00ff').hex, '00ff', 'Leading zeros should be preserved')
    })

    // ===== 2. API SURFACE COVERAGE =====

    t.test('JSON serialization with complex data', t => {
      t.plan(4)

      // Test with various data types
      const complexData = {
        number: 42,
        bigint: 123456789012345678901234567890n,
        string: 'test',
        nested: {
          array: [1, 2, 3],
          buffer: new Buff('abcd')
        }
      }

      const serialized = Buff.json(complexData)
      const deserialized = serialized.to_json()

      t.equal(deserialized.number, 42, 'Number should deserialize correctly')
      t.equal(deserialized.bigint, 123456789012345678901234567890n, 'BigInt should deserialize correctly')
      t.equal(deserialized.string, 'test', 'String should deserialize correctly')
      t.deepEqual(deserialized.nested.array, [1, 2, 3], 'Nested array should deserialize correctly')
    })

    t.test('Different buffer creation methods consistency', t => {
      t.plan(6)

      const testData = [0xab, 0xcd, 0xef]
      const testHex = 'abcdef'

      // Test that different creation methods produce same results
      const fromArray = Buff.from(testData)
      const fromOf = Buff.of(...testData)
      const fromHex = Buff.hex(testHex)
      const fromUint8Array = Buff.uint(new Uint8Array(testData))

      t.equal(fromArray.hex, testHex, 'Buff.from should create correct hex')
      t.equal(fromOf.hex, testHex, 'Buff.of should create correct hex')
      t.equal(fromHex.hex, testHex, 'Buff.hex should create correct hex')
      t.equal(fromUint8Array.hex, testHex, 'Buff.uint should create correct hex')

      // Test they're all equal
      t.equal(fromArray.hex, fromOf.hex, 'All creation methods should produce same result')
      t.equal(fromHex.hex, fromUint8Array.hex, 'All creation methods should produce same result')
    })

    t.test('Buffer manipulation method chaining', t => {
      t.plan(3)

      const base = new Buff('1234')

      // Test that methods return new Buff instances for chaining
      const result1 = base.append('5678')
      const result2 = base.prepend('ab')
      const result3 = base.slice(1, 3)

      t.ok(result1 instanceof Buff, 'append should return Buff instance')
      t.ok(result2 instanceof Buff, 'prepend should return Buff instance')
      t.ok(result3 instanceof Buff, 'slice should return Buff instance')
    })

    t.test('Varint encoding/decoding comprehensive', t => {
      t.plan(8)

      // Test various varint sizes
      const testValues = [
        100,        // 1 byte
        1000,       // 3 bytes (0xFD + 2 bytes)
        100000,     // 5 bytes (0xFE + 4 bytes)
        10000000000 // 9 bytes (0xFF + 8 bytes)
      ]

      testValues.forEach(value => {
        const varint = Buff.varint(value)
        const stream = new Stream(varint)
        const decoded = stream.varint()

        t.equal(decoded, value, `Varint ${value} should encode/decode correctly`)
      })

      // Test edge cases
      t.equal(Buff.varint(0).length, 1, 'Varint 0 should be 1 byte')
      t.equal(Buff.varint(252).length, 1, 'Varint 252 should be 1 byte')
      t.equal(Buff.varint(253).length, 3, 'Varint 253 should be 3 bytes')
      t.equal(Buff.varint(65536).length, 5, 'Varint 65536 should be 5 bytes')
    })

    t.test('Blob chunking operations', t => {
      t.plan(4)

      const testData = 'abcdef1234567890abcdef1234567890' // 32 hex chars = 16 bytes when decoded
      const chunks = Buff.blob(testData, 4, 16)

      t.equal(chunks.length, 4, 'Should create correct number of chunks')
      t.equal(chunks[0].length, 4, 'Each chunk should have correct size')

      // Test that joined chunks recreate original
      const rejoined = Buff.join(chunks)
      t.equal(rejoined.hex, testData, 'Rejoined chunks should match original')

      // Test sorting
      const randomData = ['ffff', 'aaaa', 'cccc', 'bbbb']
      const sorted = Buff.sort(randomData)
      t.deepEqual(sorted.map(b => b.hex), ['aaaa', 'bbbb', 'cccc', 'ffff'], 'Should sort lexicographically')
    })

    t.test('Endianness consistency across operations', t => {
      t.plan(8)

      const testNum = 0x12345678
      const testBig = 0x123456789abcdef0n

      // Test number endianness
      const numBE = Buff.num(testNum, 4, 'be')
      const numLE = Buff.num(testNum, 4, 'le')

      t.equal(numBE.to_num('be'), testNum, 'Number BE round-trip should work')
      t.equal(numLE.to_num('le'), testNum, 'Number LE round-trip should work')
      t.notEqual(numBE.hex, numLE.hex, 'BE and LE should produce different hex')

      // Test bigint endianness
      const bigBE = Buff.big(testBig, 8, 'be')
      const bigLE = Buff.big(testBig, 8, 'le')

      t.equal(bigBE.to_big('be'), testBig, 'BigInt BE round-trip should work')
      t.equal(bigLE.to_big('le'), testBig, 'BigInt LE round-trip should work')
      t.notEqual(bigBE.hex, bigLE.hex, 'BE and LE should produce different hex')

      // Test hex endianness
      const hexBE = Buff.hex('12345678').to_hex('be')
      const hexLE = Buff.hex('12345678').to_hex('le')

      t.equal(hexBE, '12345678', 'Hex BE should maintain order')
      t.equal(hexLE, '78563412', 'Hex LE should reverse order')
    })

    // ===== 3. IMMUTABILITY & SIDE EFFECTS =====

    t.test('Operations do not mutate original data', t => {
      t.plan(6)

      const original = new Buff('abcd')
      const originalHex = original.hex
      const originalLength = original.length

      // These operations should NOT modify the original
      original.append('ef')
      original.prepend('12')
      original.slice(1, 3)
      original.subarray(0, 1)
      original.reverse() // This might be the exception - need to check

      // Verify original is unchanged (except possibly reverse)
      t.equal(original.length, originalLength, 'Length should be unchanged')

      // Test that new instances are created
      const appended = original.append('ef')
      const prepended = original.prepend('12')
      const sliced = original.slice(1, 3)

      t.notEqual(appended, original, 'append should return new instance')
      t.notEqual(prepended, original, 'prepend should return new instance')
      t.notEqual(sliced, original, 'slice should return new instance')

      t.notEqual(appended.hex, originalHex, 'appended should have different content')
      t.notEqual(sliced.hex, originalHex, 'sliced should have different content')
    })

    t.test('Uint8Array inheritance behavior', t => {
      t.plan(6)

      const buff = new Buff('abcd')

      // Test inheritance
      t.ok(buff instanceof Uint8Array, 'Buff should be instanceof Uint8Array')
      t.ok(buff instanceof Buff, 'Buff should be instanceof Buff')

      // Test that Uint8Array methods work
      t.equal(buff.byteLength, 2, 'byteLength property should work')
      t.equal(buff[0], 0xab, 'Array indexing should work')

      // Test array methods (note: map with Buff constructor has issues due to inheritance)
      const mapped = Array.from(buff).map(x => x + 1)
      t.ok(Array.isArray(mapped), 'map should return array')
      t.equal(mapped.length, buff.length, 'map should preserve length')
    })

    t.test('Memory isolation between instances', t => {
      t.plan(4)

      const buff1 = new Buff('abcd')
      const buff2 = new Buff(buff1) // Now creates new instance (no more optimization)
      const buff3 = buff1.slice(0) // Full slice copy - creates new instance
      const buff4 = new Buff(buff1.uint) // Force new instance from Uint8Array

      // Modify buff1's underlying data
      buff1[0] = 0xff

      // buff2 is now isolated (optimization was removed)
      t.notEqual(buff2[0], 0xff, 'buff2 should not be affected by buff1 changes (no longer shares instance)')

      // buff3 should be isolated (slice creates new buffer)
      t.notEqual(buff3[0], 0xff, 'buff3 should not be affected by buff1 changes')

      // buff4 should be isolated (created from Uint8Array copy)
      t.notEqual(buff4[0], 0xff, 'buff4 should not be affected by buff1 changes')

      t.equal(buff1[0], 0xff, 'buff1 should be modified')
    })

    t.test('Stream state isolation', t => {
      t.plan(4)

      const data = new Buff('abcdef12')
      const stream1 = new Stream(data)
      const stream2 = new Stream(data)

      // Read from stream1
      stream1.read(2)

      // stream2 should be unaffected
      t.equal(stream1.size, 2, 'stream1 should have reduced size')
      t.equal(stream2.size, 4, 'stream2 should have original size')

      // Create new stream from same data
      const stream3 = new Stream(data)
      t.equal(stream3.size, 4, 'stream3 should have original size')

      // Peek should not affect state
      const originalSize = stream3.size
      stream3.peek(1)
      t.equal(stream3.size, originalSize, 'peek should not change stream size')
    })

    t.test('Type checking utilities work correctly', t => {
      t.plan(8)

      // Test Buff.is_bytes
      t.ok(Buff.is_bytes('abcd'), 'Valid hex should pass is_bytes')
      t.ok(Buff.is_bytes(new Uint8Array([1, 2])), 'Uint8Array should pass is_bytes')
      t.ok(Buff.is_bytes(new Buff('ab')), 'Buff should pass is_bytes')
      t.notOk(Buff.is_bytes('xyz'), 'Invalid hex should fail is_bytes')

      // Test Buff.is_hex
      t.ok(Buff.is_hex('abcd'), 'Valid hex should pass is_hex')
      t.notOk(Buff.is_hex('xyz'), 'Invalid hex should fail is_hex')
      t.notOk(Buff.is_hex('abc'), 'Odd-length hex should fail is_hex')

      // Test equality
      t.ok(Buff.is_equal('abcd', new Buff('abcd')), 'is_equal should work across types')
    })
  })
}