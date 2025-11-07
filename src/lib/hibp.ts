// HIBP password range API using k-anonymity
// Docs: https://haveibeenpwned.com/API/v3#PwnedPasswords

export async function hibpCheckPassword(password: string): Promise<number> {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const cryptoObj: SubtleCrypto = (globalThis.crypto || (require('node:crypto').webcrypto as Crypto)).subtle
  const hashBuf = await cryptoObj.digest('SHA-1', data)
  const hashHex = [...new Uint8Array(hashBuf)].map(b => b.toString(16).padStart(2, '0')).join('').toUpperCase()
  const prefix = hashHex.slice(0, 5)
  const suffix = hashHex.slice(5)
  const resp = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`)
  if (!resp.ok) throw new Error('HIBP error')
  const text = await resp.text()
  const lines = text.split('\n')
  for (const line of lines) {
    const [hash, countStr] = line.trim().split(':')
    if (hash === suffix) return Number(countStr)
  }
  return 0
}


