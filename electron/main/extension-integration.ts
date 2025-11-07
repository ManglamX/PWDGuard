/**
 * Extension Integration Module for PwdGuard Desktop App
 * Monitors extension activity and displays notifications
 */

import { BrowserWindow, Notification, ipcMain } from 'electron'
import fs from 'fs'
import path from 'path'
import os from 'os'

interface ExtensionLog {
  timestamp: string
  event: string
  data: Record<string, any>
}

interface SavedCredential {
  domain: string
  username: string
  timestamp: number
}

class ExtensionIntegration {
  private mainWindow: BrowserWindow | null = null
  private logFilePath: string
  private credentialsDir: string
  private logWatcher: fs.FSWatcher | null = null

  constructor() {
    const appDataDir = process.env.APPDATA || path.join(os.homedir(), '.config')
    const pwdGuardDir = path.join(appDataDir, 'PwdGuard')
    
    this.logFilePath = path.join(pwdGuardDir, 'extension.log')
    this.credentialsDir = path.join(pwdGuardDir, 'credentials')
    
    // Ensure directories exist
    if (!fs.existsSync(pwdGuardDir)) {
      fs.mkdirSync(pwdGuardDir, { recursive: true })
    }
    if (!fs.existsSync(this.credentialsDir)) {
      fs.mkdirSync(this.credentialsDir, { recursive: true })
    }
  }

  /**
   * Initialize extension integration
   */
  public initialize(mainWindow: BrowserWindow) {
    this.mainWindow = mainWindow
    this.startLogWatcher()
    this.setupIpcHandlers()
    console.log('Extension integration initialized')
  }

  /**
   * Start watching the extension log file
   */
  private startLogWatcher() {
    // Create log file if it doesn't exist
    if (!fs.existsSync(this.logFilePath)) {
      fs.writeFileSync(this.logFilePath, '')
    }

    // Watch for changes
    this.logWatcher = fs.watch(this.logFilePath, (eventType: string) => {
      if (eventType === 'change') {
        this.processLogFile()
      }
    })
  }

  /**
   * Process the log file and handle events
   */
  private processLogFile() {
    try {
      const content = fs.readFileSync(this.logFilePath, 'utf8')
      const lines = content.trim().split('\n').filter((line: string) => line.length > 0)
      
      if (lines.length === 0) return

      // Process only the last line (most recent event)
      const lastLine = lines[lines.length - 1]
      const log: ExtensionLog = JSON.parse(lastLine)

      this.handleExtensionEvent(log)
    } catch (error) {
      console.error('Error processing extension log:', error)
    }
  }

  /**
   * Handle extension events
   */
  private handleExtensionEvent(log: ExtensionLog) {
    switch (log.event) {
      case 'credential-saved':
        this.handleCredentialSaved(log.data)
        break
      case 'native-host-started':
        this.handleNativeHostStarted(log.data)
        break
      default:
        console.log('Extension event:', log.event, log.data)
    }
  }

  /**
   * Handle credential saved event
   */
  private handleCredentialSaved(data: Record<string, any>) {
    // Show notification
    const notification = new Notification({
      title: 'Password Saved',
      body: `Credentials for ${data.domain} (${data.username}) have been saved securely.`,
      icon: path.join(process.env.VITE_PUBLIC || '', 'pwdapplogo.png')
    })
    notification.show()

    // Send to renderer process
    if (this.mainWindow) {
      this.mainWindow.webContents.send('extension-credential-saved', data)
    }
  }

  /**
   * Handle native host started event
   */
  private handleNativeHostStarted(data: Record<string, any>) {
    console.log('Native messaging host started with PID:', data.pid)
    
    // Send to renderer process
    if (this.mainWindow) {
      this.mainWindow.webContents.send('extension-connected', { pid: data.pid })
    }
  }

  /**
   * Get all saved credentials
   */
  public getSavedCredentials(): SavedCredential[] {
    const credentials: SavedCredential[] = []

    try {
      const files = fs.readdirSync(this.credentialsDir)
      
      files.forEach((file: string) => {
        if (file.endsWith('.json')) {
          const domain = file.replace('.json', '')
          const filePath = path.join(this.credentialsDir, file)
          const content = fs.readFileSync(filePath, 'utf8')
          const domainCredentials = JSON.parse(content)

          domainCredentials.forEach((cred: Record<string, any>) => {
            credentials.push({
              domain: domain,
              username: cred.username as string,
              timestamp: (cred.timestamp as number) || Date.now()
            })
          })
        }
      })
    } catch (error) {
      console.error('Error reading credentials:', error)
    }

    return credentials.sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Get credential count
   */
  public getCredentialCount(): number {
    return this.getSavedCredentials().length
  }

  /**
   * Get credentials for a specific domain
   */
  public getCredentialsForDomain(domain: string): Record<string, any>[] {
    try {
      const filePath = path.join(this.credentialsDir, `${domain}.json`)
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')
        return JSON.parse(content)
      }
    } catch (error) {
      console.error('Error reading domain credentials:', error)
    }

    return []
  }

  /**
   * Delete credential
   */
  public deleteCredential(domain: string, credentialId: string): boolean {
    try {
      const filePath = path.join(this.credentialsDir, `${domain}.json`)
      
      if (fs.existsSync(filePath)) {
        const content = fs.readFileSync(filePath, 'utf8')
        let credentials = JSON.parse(content)
        
        credentials = credentials.filter((cred: Record<string, any>) => cred.id !== credentialId)
        
        if (credentials.length > 0) {
          fs.writeFileSync(filePath, JSON.stringify(credentials, null, 2))
        } else {
          fs.unlinkSync(filePath)
        }
        
        return true
      }
    } catch (error) {
      console.error('Error deleting credential:', error)
    }

    return false
  }

  /**
   * Setup IPC handlers for renderer process
   */
  private setupIpcHandlers() {
    ipcMain.handle('extension:get-credentials', () => {
      return this.getSavedCredentials()
    })

    ipcMain.handle('extension:get-credential-count', () => {
      return this.getCredentialCount()
    })

    ipcMain.handle('extension:get-domain-credentials', (_event: any, domain: string) => {
      return this.getCredentialsForDomain(domain)
    })

    ipcMain.handle('extension:delete-credential', (_event: any, domain: string, credentialId: string) => {
      return this.deleteCredential(domain, credentialId)
    })
  }

  /**
   * Cleanup resources
   */
  public cleanup() {
    if (this.logWatcher) {
      this.logWatcher.close()
      this.logWatcher = null
    }
  }
}

export default ExtensionIntegration
