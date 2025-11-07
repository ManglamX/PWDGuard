import { useMemo, useState } from 'react'
import './App.css'

import { AnalyzePassword } from './components/AnalyzePassword'
import { GeneratePassword } from './components/GeneratePassword'
import { PasswordHistory } from './components/PasswordHistory'
import { Settings } from './components/Settings'
import { ExtensionCredentials } from './components/ExtensionCredentials'
import LightRays from './components/LightRays'

type TabKey = 'analyze' | 'generate' | 'history' | 'extension' | 'settings'

function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('analyze')
  const tabs: { key: TabKey; label: string; icon: string }[] = useMemo(
    () => [
      { key: 'analyze', label: 'Analyze Password', icon: '🔍' },
      { key: 'generate', label: 'Generate Password', icon: '⚡' },
      { key: 'history', label: 'History', icon: '📜' },
      { key: 'extension', label: 'Browser Passwords', icon: '🌐' },
      { key: 'settings', label: 'Settings', icon: '⚙️' },
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
        <nav className='tabs' role='tablist' aria-label='Main navigation'>
          {tabs.map(t => (
            <button
              key={t.key}
              className={activeTab === t.key ? 'tab active' : 'tab'}
              onClick={() => setActiveTab(t.key)}
              role='tab'
              aria-selected={activeTab === t.key}
              aria-controls={`${t.key}-panel`}
              title={t.label}
            >
              <span aria-hidden='true'>{t.icon}</span> {t.label}
            </button>
          ))}
        </nav>
        <main className='tab-content' role='tabpanel' id={`${activeTab}-panel`} aria-labelledby={activeTab}>
          {activeTab === 'analyze' && <AnalyzePassword />}
          {activeTab === 'generate' && <GeneratePassword />}
          {activeTab === 'history' && <PasswordHistory />}
          {activeTab === 'extension' && <ExtensionCredentials />}
          {activeTab === 'settings' && <Settings />}
        </main>
      </div>
    </div>
  )
}

export default App