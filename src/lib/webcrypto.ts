export function getCrypto(): Crypto {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    return window.crypto as unknown as Crypto
  }
  // Fallback for environments with SubtleCrypto via Node (Electron)
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { webcrypto } = require('node:crypto')
  return webcrypto as unknown as Crypto
}


