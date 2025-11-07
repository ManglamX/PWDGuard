// Small embedded subset of common passwords; app can load extended lists later.
const COMMON_SAMPLE = [
  '123456','password','123456789','12345','12345678','qwerty','1234567','111111','123123','abc123',
  'password1','iloveyou','admin','welcome','monkey','dragon','football','letmein','login','princess'
]

export type CommonMatch = { found: boolean; rank?: number }

export function checkCommonPassword(pw: string): CommonMatch | null {
  if (!pw) return null
  const index = COMMON_SAMPLE.indexOf(pw.toLowerCase())
  if (index >= 0) return { found: true, rank: index + 1 }
  return null
}


