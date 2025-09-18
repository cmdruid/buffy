interface CryptoPolyfill extends Crypto {
  randomBytes : (length: number) => Uint8Array
}

export function get_random_bytes (length = 32) : Uint8Array {
  if (
    crypto && 
    typeof crypto.getRandomValues === 'function'
  ) {
    return crypto.getRandomValues(new Uint8Array(length))
  }
  // Legacy Node Polyfill
  const pcrypto = crypto as CryptoPolyfill
  if (
    pcrypto                           && 
    pcrypto.randomBytes !== undefined && 
    typeof pcrypto.randomBytes === 'function'
  ) {
    return pcrypto.randomBytes(length)
  }
  throw new Error('getRandomValues from crypto library is undefined');
}
