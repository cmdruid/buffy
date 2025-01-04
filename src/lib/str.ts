const ec = new TextEncoder()
const dc = new TextDecoder()

export function str_to_bytes (
  str : string
) : Uint8Array {
  return ec.encode(str)
}

export function bytes_to_str (
  bytes : Uint8Array
) : string {
  return dc.decode(bytes)
}
