import { useState } from 'react'

export function Settings() {
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>('system')
  const [autoClear, setAutoClear] = useState(20)

  return (
    <div className='settings'>
      <div className='panel'>
        <h3>Appearance</h3>
        <div className='segmented'>
          <button className={theme === 'system' ? 'active' : ''} onClick={() => setTheme('system')}>System</button>
          <button className={theme === 'light' ? 'active' : ''} onClick={() => setTheme('light')}>Light</button>
          <button className={theme === 'dark' ? 'active' : ''} onClick={() => setTheme('dark')}>Dark</button>
        </div>
      </div>

      <div className='panel'>
        <h3>Clipboard</h3>
        <label>Auto-clear clipboard: {autoClear}s
          <input type='range' min={0} max={120} value={autoClear} onChange={(e) => setAutoClear(Number(e.target.value))} />
        </label>
      </div>

      <div className='panel'>
        <h3>Databases</h3>
        <p>Top 10K common passwords are bundled. You can load extended lists in future updates.</p>
      </div>
    </div>
  )
}


