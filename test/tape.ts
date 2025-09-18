import tape from 'tape'

import endian_test        from './src/endian.test.js'
import integrity_test     from './src/integrity.test.js'
import parity_test        from './src/parity.test.js'
import error_handling_test from './src/error-handling.test.js'
import comprehensive_test from './src/comprehensive.test.js'

tape('Buff Test Suite', t => {
  endian_test(t)
  integrity_test(t)
  parity_test(t)
  error_handling_test(t)
  comprehensive_test(t)
})
