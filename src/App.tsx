import { useMemo, useState } from 'react'
import './App.css'

import { AnalyzePassword } from './components/AnalyzePassword'
import { GeneratePassword } from './components/GeneratePassword'
import { PasswordHistory } from './components/PasswordHistory'
import { Settings } from './components/Settings'
import LightRays from './components/LightRays'

type TabKey = 'analyze' | 'generate' | 'history' | 'settings'

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('analyze')
  const tabs: { key: TabKey; label: string }[] = useMemo(
    () => [
      { key: 'analyze', label: 'Analyze Password' },
      { key: 'generate', label: 'Generate Password' },
      { key: 'history', label: 'History' },
      { key: 'settings', label: 'Settings' },
    ],
    []
  )

  return (
    <div className='App'>
      <div className='light-rays-background'>
        <LightRays
          raysOrigin="top-center"
          raysColor="#00ffff"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
          className="custom-rays"
        />
      </div>
      <div className='app-content'>
        <div className='app-header'>
          <img src='/pwdapplogo.png' alt='PwdGuard Logo' className='app-logo' />
          <h1>PwdGuard</h1>
        </div>
        <nav className='tabs'>
          {tabs.map(t => (
            <button
              key={t.key}
              className={activeTab === t.key ? 'tab active' : 'tab'}
              onClick={() => setActiveTab(t.key)}
            >
              {t.label}
            </button>
          ))}
        </nav>
        <main className='tab-content'>
          {activeTab === 'analyze' && <AnalyzePassword />}
          {activeTab === 'generate' && <GeneratePassword />}
          {activeTab === 'history' && <PasswordHistory />}
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  )
}

export default App