import { useEffect, useMemo, useState } from 'react'
import { analyzePassword, strengthLabelFromEntropy, StrengthBucket, estimateBruteForceTime } from '../lib/analysis'
import { checkCommonPassword } from '../lib/commonDb'
import { hibpCheckPassword } from '../lib/hibp'

export function AnalyzePassword() {
  const [password, setPassword] = useState('')
  const [hibpCount, setHibpCount] = useState<number | null>(null)
  const [hibpStatus, setHibpStatus] = useState<'idle' | 'checking' | 'error'>('idle')

  const analysis = useMemo(() => analyzePassword(password), [password])

  const common = useMemo(() => (password ? checkCommonPassword(password) : null), [password])

  const onCheckHIBP = async () => {
    if (!password) return
    try {
      setHibpStatus('checking')
      const count = await hibpCheckPassword(password)
      setHibpCount(count)
      setHibpStatus('idle')
    } catch (e) {
      setHibpStatus('error')
    }
  }

  const bucket: StrengthBucket = strengthLabelFromEntropy(analysis.entropyBits)

  useEffect(() => {
    setHibpCount(null)
  }, [password])

  const crackTime = estimateBruteForceTime(analysis.entropyBits)

  return (
    <div>
      <label className='field-label'>Password</label>
      <div className='password-input'>
        <input
          type='password'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder='Type or paste a password to analyze…'
        />
        <button onClick={() => navigator.clipboard?.writeText(password || '')}>Copy</button>
        <button onClick={() => setPassword('')}>Clear</button>
      </div>

      <div className={`strength-meter ${bucket.className}`}>
        <div className='bar' style={{ width: `${Math.min(100, (analysis.entropyBits / 120) * 100)}%` }} />
        <span className='label'>
          {bucket.label} • {analysis.entropyBits.toFixed(1)} bits
        </span>
      </div>

      <section className='grid-2'>
        <div>
          <h3>Details</h3>
          <ul className='kv'>
            <li><b>Length</b><span>{analysis.length}</span></li>
            <li><b>Character sets</b><span>{analysis.charsets.join(', ') || 'None'}</span></li>
            <li><b>Entropy</b><span>{analysis.entropyBits.toFixed(2)} bits</span></li>
            <li><b>Estimated crack time</b><span>{crackTime}</span></li>
          </ul>
        </div>
        <div>
          <h3>Findings</h3>
          <ul>
            {analysis.findings.length === 0 && <li>No obvious risky patterns found.</li>}
            {analysis.findings.map((f, i) => (
              <li key={i}>{f}</li>
            ))}
            {common && (
              <li>
                ⚠️ Very common password{common.rank ? ` (#${common.rank})` : ''}
              </li>
            )}
          </ul>
        </div>
      </section>

      <section>
        <h3>Recommendations</h3>
        <ul>
          {analysis.recommendations.map((r, i) => (
            <li key={i}>{r}</li>
          ))}
        </ul>
      </section>

      <section>
        <button onClick={onCheckHIBP} disabled={!password || hibpStatus === 'checking'}>
          {hibpStatus === 'checking' ? 'Checking…' : 'Check Breaches (HIBP)'}
        </button>
        {hibpCount !== null && (
          <p className='hibp-result'>
            {hibpCount > 0
              ? `⚠️ Appears in ${hibpCount} breach${hibpCount > 1 ? 'es' : ''}. Change it immediately.`
              : '✅ Not found in known breaches.'}
          </p>
        )}
        {hibpStatus === 'error' && <p className='error'>Could not check HIBP. Are you offline?</p>}
      </section>
    </div>
  )
}


