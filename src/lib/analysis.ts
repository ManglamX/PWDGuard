export type StrengthBucket = { label: string; className: string }

const AMBIGUOUS = new Set(['0','O','o','1','l','I'])

export function shannonEntropyBits(password: string): number {
  if (!password) return 0
  const freq: Record<string, number> = {}
  for (const ch of password) freq[ch] = (freq[ch] || 0) + 1
  const len = password.length
  let h = 0
  for (const c in freq) {
    const p = freq[c] / len
    h += -p * Math.log2(p)
  }
  // Upper bound with character set size gives more realistic strength
  const charsetSize = estimateCharsetSize(password)
  const combinatoric = Math.log2(Math.pow(charsetSize, len))
  // Combine Shannon character distribution and combinatoric estimate conservatively
  return Math.min(combinatoric, h * 4 + len * Math.log2(Math.max(2, charsetSize / 4)))
}

export function estimateCharsetSize(password: string): number {
  let size = 0
  if (/[a-z]/.test(password)) size += 26
  if (/[A-Z]/.test(password)) size += 26
  if (/[0-9]/.test(password)) size += 10
  if (/[^a-zA-Z0-9]/.test(password)) size += 33 // typical printable symbols
  return size || 1
}

export function analyzePassword(password: string) {
  const length = password.length
  const charsets: string[] = []
  if (/[a-z]/.test(password)) charsets.push('lowercase')
  if (/[A-Z]/.test(password)) charsets.push('uppercase')
  if (/[0-9]/.test(password)) charsets.push('numbers')
  if (/[^a-zA-Z0-9]/.test(password)) charsets.push('symbols')

  const findings: string[] = []
  const recommendations: string[] = []

  // Patterns
  if (/([a-z])\1{2,}/i.test(password)) findings.push('Repeated characters detected')
  if (/12345|23456|34567|45678|56789|01234/.test(password)) findings.push('Sequential numbers detected')
  if (/abcde|bcdef|cdefg|defgh|fghij/i.test(password)) findings.push('Sequential letters detected')
  if (/qwerty|asdfgh|zxcvbn/i.test(password)) findings.push('Keyboard pattern detected')
  if (/\d{2,4}[\-/]?(0?[1-9]|1[0-2])[\-/]?([12]\d{3}|\d{2})/.test(password)) findings.push('Looks like a date')
  if (/p[a@]ss(w|vv)[o0]rd/i.test(password)) findings.push('Common substitution pattern (e.g., p@ssw0rd)')

  const entropyBits = shannonEntropyBits(password)

  if (length < 12) recommendations.push('Increase length to at least 12 characters')
  if (!/[A-Z]/.test(password)) recommendations.push('Add uppercase letters')
  if (!/[a-z]/.test(password)) recommendations.push('Add lowercase letters')
  if (!/[0-9]/.test(password)) recommendations.push('Add numbers')
  if (!/[^a-zA-Z0-9]/.test(password)) recommendations.push('Add symbols')
  if ([...password].some(c => AMBIGUOUS.has(c))) recommendations.push('Avoid ambiguous characters like 0/O/1/l when possible')

  return { length, charsets, entropyBits, findings, recommendations }
}

export function strengthLabelFromEntropy(bits: number): StrengthBucket {
  if (bits <= 40) return { label: 'Weak', className: 'weak' }
  if (bits <= 60) return { label: 'Fair', className: 'fair' }
  if (bits <= 80) return { label: 'Good', className: 'good' }
  if (bits <= 100) return { label: 'Strong', className: 'strong' }
  return { label: 'Very Strong', className: 'very-strong' }
}

export function estimateBruteForceTime(bits: number): string {
  // Assume aggressive offline attack ~ 1e11 guesses/sec
  const guessesPerSec = 1e11
  const guesses = Math.pow(2, bits)
  const seconds = guesses / guessesPerSec
  return humanizeDuration(seconds)
}

function humanizeDuration(seconds: number): string {
  if (seconds < 1) return 'less than 1s'
  const units: [string, number][] = [
    ['year', 31557600],
    ['day', 86400],
    ['hour', 3600],
    ['minute', 60],
    ['second', 1],
  ]
  const parts: string[] = []
  let remaining = seconds
  for (const [name, s] of units) {
    const v = Math.floor(remaining / s)
    if (v > 0) {
      parts.push(`${v} ${name}${v > 1 ? 's' : ''}`)
      remaining -= v * s
    }
    if (parts.length >= 2) break
  }
  return parts.join(' ')
}


