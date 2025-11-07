import { getCrypto } from './webcrypto'

export type GenerateOptions = {
  length: number
  lowercase: boolean
  uppercase: boolean
  numbers: boolean
  symbols: boolean
  excludeAmbiguous: boolean
  excludeSimilar: boolean
  customChars: string
}

const SYMBOLS = "!@#$%^&*()_+{}[]|:;\"'<>,.?/~`-="
const AMBIGUOUS = new Set(['0','O','o','1','l','I'])
const SIMILAR = new Set(['0','O','o','1','l','I','S','5','B','8','2','Z'])

export function generatePassword(options: GenerateOptions): string {
  let pool = ''
  if (options.lowercase) pool += 'abcdefghijklmnopqrstuvwxyz'
  if (options.uppercase) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (options.numbers) pool += '0123456789'
  if (options.symbols) pool += SYMBOLS
  if (options.customChars) pool += options.customChars
  if (!pool) pool = 'abcdefghijklmnopqrstuvwxyz0123456789'

  const filtered = [...pool].filter(c => {
    if (options.excludeAmbiguous && AMBIGUOUS.has(c)) return false
    if (options.excludeSimilar && SIMILAR.has(c)) return false
    return true
  })
  const arr = new Uint32Array(options.length)
  getCrypto().getRandomValues(arr)
  return Array.from(arr, n => filtered[n % filtered.length]).join('')
}

// Minimal EFF-like short word list subset for local generation (can be extended)
const WORDS = [
  'able','baker','cable','delta','eagle','fable','gamer','hazel','icing','joker',
  'koala','lemon','mango','navy','ocean','panda','quark','raven','solar','tango',
  'ultra','vivid','whale','xenon','yak','zeal','alpha','bravo','charm','dizzy',
  'ember','frost','globe','harbor','ionic','jolly','kayak','lunar','meadow','nylon',
  'onyx','pearl','quota','rumor','salsa','tempo','urban','vapor','woven','yodel'
]

export function generatePassphrases({ count, words = 4, separator = '-' }: { count: number; words?: number; separator?: string }): string[] {
  const out: string[] = []
  const crypto = getCrypto()
  for (let i = 0; i < Math.min(10, Math.max(1, count)); i++) {
    const arr = new Uint32Array(words)
    crypto.getRandomValues(arr)
    const pick = Array.from(arr, n => WORDS[n % WORDS.length]).join(separator)
    out.push(pick)
  }
  return out
}


