import tape from 'tape'

import endian_test    from './src/endian.test.js'
import integrity_test from './src/integrity.test.js'
import parity_test    from './src/parity.test.js'

tape('Buffy Test Suite', t => {
  endian_test(t)
  integrity_test(t)
  parity_test(t)
})
