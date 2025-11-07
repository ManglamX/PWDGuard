import { useEffect, useMemo, useState } from 'react'
import { generatePassword, GenerateOptions, generatePassphrases } from '../lib/generator'
import { analyzePassword, strengthLabelFromEntropy } from '../lib/analysis'

export function GeneratePassword() {
  const [method, setMethod] = useState<'random' | 'passphrase'>('random')
  const [count, setCount] = useState(5)
  const [options, setOptions] = useState<GenerateOptions>({
    length: 16,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
    excludeAmbiguous: true,
    excludeSimilar: false,
    customChars: '',
  })

  const [generated, setGenerated] = useState<string[]>([])

  const regenerate = () => {
    if (method === 'random') {
      setGenerated(Array.from({ length: Math.min(10, Math.max(1, count)) }, () => generatePassword(options)))
    } else {
      setGenerated(generatePassphrases({ count, words: 4, separator: '-' }))
    }
  }

  useEffect(() => {
    regenerate()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [method])

  return (
    <div>
      <div className='generation-controls'>
        <div className='segmented'>
          <button className={method === 'random' ? 'active' : ''} onClick={() => setMethod('random')}>Random</button>
          <button className={method === 'passphrase' ? 'active' : ''} onClick={() => setMethod('passphrase')}>Passphrase</button>
        </div>

        {method === 'random' && (
          <div className='panel'>
            <label>Length: {options.length}
              <input type='range' min={8} max={128} value={options.length}
                onChange={(e) => setOptions({ ...options, length: Number(e.target.value) })} />
            </label>
            <div className='grid-2'>
              <label><input type='checkbox' checked={options.lowercase} onChange={e => setOptions({ ...options, lowercase: e.target.checked })} /> lowercase</label>
              <label><input type='checkbox' checked={options.uppercase} onChange={e => setOptions({ ...options, uppercase: e.target.checked })} /> uppercase</label>
              <label><input type='checkbox' checked={options.numbers} onChange={e => setOptions({ ...options, numbers: e.target.checked })} /> numbers</label>
              <label><input type='checkbox' checked={options.symbols} onChange={e => setOptions({ ...options, symbols: e.target.checked })} /> symbols</label>
              <label><input type='checkbox' checked={options.excludeAmbiguous} onChange={e => setOptions({ ...options, excludeAmbiguous: e.target.checked })} /> exclude ambiguous</label>
              <label><input type='checkbox' checked={options.excludeSimilar} onChange={e => setOptions({ ...options, excludeSimilar: e.target.checked })} /> exclude similar</label>
            </div>
            <label>Custom characters
              <input type='text' value={options.customChars}
                onChange={(e) => setOptions({ ...options, customChars: e.target.value })} placeholder='Optional extra chars' />
            </label>
          </div>
        )}

        {method === 'passphrase' && (
          <div className='panel'>
            <p>Using built-in EFF short word list (4 words). Separator "-".</p>
          </div>
        )}

        <div className='panel'>
          <label>How many: {count}
            <input type='range' min={1} max={10} value={count} onChange={(e) => setCount(Number(e.target.value))} />
          </label>
          <div className='actions'>
            <button onClick={regenerate} title='Ctrl/Cmd + G'>Generate</button>
          </div>
        </div>
      </div>

      <div className='generated-list'>
        {generated.map((p, i) => {
          const a = analyzePassword(p)
          const s = strengthLabelFromEntropy(a.entropyBits)
          return (
            <div key={i} className={`generated-item ${s.className}`}>
              <code>{p}</code>
              <span className='meta'>{a.entropyBits.toFixed(1)} bits • {s.label}</span>
              <div className='row'>
                <button onClick={() => navigator.clipboard?.writeText(p)}>Copy</button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}


