import { useState, useEffect } from 'react'
import './ExtensionCredentials.css'

interface Credential {
  domain: string
  username: string
  timestamp: number
  id?: string
}

export function ExtensionCredentials() {
  const [credentials, setCredentials] = useState<Credential[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null)

  useEffect(() => {
    loadCredentials()

    // Listen for new credentials from extension
    const handleCredentialSaved = () => {
      loadCredentials()
    }

    window.electron?.ipcRenderer.on('extension-credential-saved', handleCredentialSaved)

    return () => {
      window.electron?.ipcRenderer.removeListener('extension-credential-saved', handleCredentialSaved)
    }
  }, [])

  const loadCredentials = async () => {
    setLoading(true)
    try {
      const creds = await window.electron?.ipcRenderer.invoke('extension:get-credentials')
      setCredentials(creds || [])
    } catch (error) {
      console.error('Error loading credentials:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (domain: string, credentialId: string) => {
    if (confirm(`Delete credentials for ${domain}?`)) {
      try {
        await window.electron?.ipcRenderer.invoke('extension:delete-credential', domain, credentialId)
        loadCredentials()
      } catch (error) {
        console.error('Error deleting credential:', error)
      }
    }
  }

  const filteredCredentials = credentials.filter(cred =>
    cred.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cred.username.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const groupedCredentials = filteredCredentials.reduce((acc, cred) => {
    if (!acc[cred.domain]) {
      acc[cred.domain] = []
    }
    acc[cred.domain].push(cred)
    return acc
  }, {} as Record<string, Credential[]>)

  if (loading) {
    return (
      <div className="extension-credentials">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading credentials...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="extension-credentials">
      <div className="credentials-header">
        <h2>🔐 Browser Extension Credentials</h2>
        <p className="subtitle">
          Passwords saved from Chrome extension ({credentials.length} total)
        </p>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by domain or username..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button onClick={loadCredentials} className="refresh-btn" title="Refresh">
          🔄
        </button>
      </div>

      {Object.keys(groupedCredentials).length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔒</div>
          <h3>No Credentials Saved</h3>
          <p>
            Install the PwdGuard Chrome extension to automatically save and manage
            your passwords across websites.
          </p>
          <button className="install-btn">
            Install Chrome Extension
          </button>
        </div>
      ) : (
        <div className="credentials-list">
          {Object.entries(groupedCredentials).map(([domain, domainCreds]) => (
            <div key={domain} className="domain-group">
              <div
                className="domain-header"
                onClick={() => setSelectedDomain(selectedDomain === domain ? null : domain)}
              >
                <div className="domain-info">
                  <div className="domain-icon">🌐</div>
                  <div>
                    <h3>{domain}</h3>
                    <p className="credential-count">
                      {domainCreds.length} {domainCreds.length === 1 ? 'account' : 'accounts'}
                    </p>
                  </div>
                </div>
                <div className="expand-icon">
                  {selectedDomain === domain ? '▼' : '▶'}
                </div>
              </div>

              {selectedDomain === domain && (
                <div className="credentials-items">
                  {domainCreds.map((cred, index) => (
                    <div key={index} className="credential-item">
                      <div className="credential-info">
                        <div className="username">{cred.username}</div>
                        <div className="timestamp">
                          Last used: {new Date(cred.timestamp).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="credential-actions">
                        <button
                          className="action-btn copy-btn"
                          title="Copy username"
                          onClick={() => {
                            navigator.clipboard.writeText(cred.username)
                            alert('Username copied to clipboard')
                          }}
                        >
                          📋
                        </button>
                        <button
                          className="action-btn delete-btn"
                          title="Delete"
                          onClick={() => handleDelete(domain, cred.id || '')}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="credentials-footer">
        <p>
          💡 <strong>Tip:</strong> Use the Chrome extension to automatically capture
          passwords as you browse. All passwords are encrypted and stored securely.
        </p>
      </div>
    </div>
  )
}
