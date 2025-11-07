#!/usr/bin/env node

/**
 * PwdGuard Native Messaging Host
 * Handles communication between Chrome extension and Electron desktop app
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Configuration
const STORAGE_DIR = path.join(process.env.APPDATA || process.env.HOME, 'PwdGuard', 'credentials');
const ENCRYPTION_KEY_FILE = path.join(process.env.APPDATA || process.env.HOME, 'PwdGuard', 'encryption.key');

// Ensure storage directory exists
if (!fs.existsSync(STORAGE_DIR)) {
  fs.mkdirSync(STORAGE_DIR, { recursive: true });
}

// Get or create encryption key
function getEncryptionKey() {
  if (fs.existsSync(ENCRYPTION_KEY_FILE)) {
    return fs.readFileSync(ENCRYPTION_KEY_FILE);
  } else {
    const key = crypto.randomBytes(32);
    fs.writeFileSync(ENCRYPTION_KEY_FILE, key);
    return key;
  }
}

const ENCRYPTION_KEY = getEncryptionKey();

// Encryption functions
function encrypt(text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text) {
  const parts = text.split(':');
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

// Native messaging functions
function sendMessage(message) {
  const buffer = Buffer.from(JSON.stringify(message));
  const header = Buffer.alloc(4);
  header.writeUInt32LE(buffer.length, 0);
  
  process.stdout.write(header);
  process.stdout.write(buffer);
}

function readMessage(callback) {
  const chunks = [];
  let totalLength = 0;
  let headerRead = false;
  let messageLength = 0;

  process.stdin.on('readable', () => {
    let chunk;
    
    while ((chunk = process.stdin.read()) !== null) {
      chunks.push(chunk);
      totalLength += chunk.length;
      
      if (!headerRead && totalLength >= 4) {
        const header = Buffer.concat(chunks, totalLength);
        messageLength = header.readUInt32LE(0);
        headerRead = true;
        
        // Remove header from chunks
        const remaining = header.slice(4);
        chunks.length = 0;
        totalLength = 0;
        
        if (remaining.length > 0) {
          chunks.push(remaining);
          totalLength = remaining.length;
        }
      }
      
      if (headerRead && totalLength >= messageLength) {
        const messageBuffer = Buffer.concat(chunks, messageLength);
        const message = JSON.parse(messageBuffer.toString('utf8'));
        
        // Reset for next message
        chunks.length = 0;
        totalLength = 0;
        headerRead = false;
        messageLength = 0;
        
        callback(message);
      }
    }
  });
}

// Message handlers
function handleSaveCredentials(message) {
  try {
    const { domain, username, password, formType, timestamp } = message;
    
    // Encrypt password
    const encryptedPassword = encrypt(password);
    
    // Create credential object
    const credential = {
      domain,
      username,
      password: encryptedPassword,
      formType,
      timestamp,
      lastUsed: timestamp,
      id: crypto.randomBytes(16).toString('hex')
    };
    
    // Load existing credentials for domain
    const domainFile = path.join(STORAGE_DIR, `${domain}.json`);
    let credentials = [];
    
    if (fs.existsSync(domainFile)) {
      const data = fs.readFileSync(domainFile, 'utf8');
      credentials = JSON.parse(data);
    }
    
    // Check if credential already exists (update instead of duplicate)
    const existingIndex = credentials.findIndex(c => c.username === username);
    
    if (existingIndex >= 0) {
      credentials[existingIndex] = credential;
    } else {
      credentials.push(credential);
    }
    
    // Save to file
    fs.writeFileSync(domainFile, JSON.stringify(credentials, null, 2));
    
    // Send success response
    sendMessage({
      type: 'save-response',
      success: true,
      domain: domain,
      timestamp: Date.now()
    });
    
    // Log to main app (if running)
    logToApp('credential-saved', { domain, username });
    
  } catch (error) {
    sendMessage({
      type: 'save-response',
      success: false,
      error: error.message
    });
  }
}

function handleGetCredentials(message) {
  try {
    const { domain, messageId } = message;
    
    const domainFile = path.join(STORAGE_DIR, `${domain}.json`);
    let credentials = [];
    
    if (fs.existsSync(domainFile)) {
      const data = fs.readFileSync(domainFile, 'utf8');
      const encryptedCredentials = JSON.parse(data);
      
      // Decrypt passwords
      credentials = encryptedCredentials.map(cred => ({
        username: cred.username,
        password: decrypt(cred.password),
        lastUsed: cred.lastUsed,
        id: cred.id
      }));
      
      // Update last used timestamp
      encryptedCredentials.forEach(cred => {
        cred.lastUsed = Date.now();
      });
      fs.writeFileSync(domainFile, JSON.stringify(encryptedCredentials, null, 2));
    }
    
    sendMessage({
      type: 'credentials-response',
      credentials: credentials,
      domain: domain,
      messageId: messageId,
      timestamp: Date.now()
    });
    
  } catch (error) {
    sendMessage({
      type: 'credentials-response',
      credentials: [],
      error: error.message,
      messageId: message.messageId
    });
  }
}

function handleConnectionTest(message) {
  sendMessage({
    type: 'connection-test',
    success: true,
    version: '1.0.0',
    timestamp: Date.now()
  });
}

function handleDeleteCredential(message) {
  try {
    const { domain, credentialId } = message;
    
    const domainFile = path.join(STORAGE_DIR, `${domain}.json`);
    
    if (fs.existsSync(domainFile)) {
      const data = fs.readFileSync(domainFile, 'utf8');
      let credentials = JSON.parse(data);
      
      credentials = credentials.filter(cred => cred.id !== credentialId);
      
      if (credentials.length > 0) {
        fs.writeFileSync(domainFile, JSON.stringify(credentials, null, 2));
      } else {
        fs.unlinkSync(domainFile);
      }
    }
    
    sendMessage({
      type: 'delete-response',
      success: true,
      timestamp: Date.now()
    });
    
  } catch (error) {
    sendMessage({
      type: 'delete-response',
      success: false,
      error: error.message
    });
  }
}

function handleGetAllCredentials(message) {
  try {
    const allCredentials = [];
    
    const files = fs.readdirSync(STORAGE_DIR);
    
    files.forEach(file => {
      if (file.endsWith('.json')) {
        const domain = file.replace('.json', '');
        const filePath = path.join(STORAGE_DIR, file);
        const data = fs.readFileSync(filePath, 'utf8');
        const credentials = JSON.parse(data);
        
        credentials.forEach(cred => {
          allCredentials.push({
            domain: domain,
            username: cred.username,
            lastUsed: cred.lastUsed,
            id: cred.id
          });
        });
      }
    });
    
    sendMessage({
      type: 'all-credentials-response',
      credentials: allCredentials,
      timestamp: Date.now()
    });
    
  } catch (error) {
    sendMessage({
      type: 'all-credentials-response',
      credentials: [],
      error: error.message
    });
  }
}

// Log to main Electron app (if available)
function logToApp(event, data) {
  const logFile = path.join(process.env.APPDATA || process.env.HOME, 'PwdGuard', 'extension.log');
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: event,
    data: data
  };
  
  try {
    fs.appendFileSync(logFile, JSON.stringify(logEntry) + '\n');
  } catch (error) {
    // Ignore logging errors
  }
}

// Main message handler
function handleMessage(message) {
  switch (message.type) {
    case 'save-credentials':
      handleSaveCredentials(message);
      break;
      
    case 'get-credentials':
      handleGetCredentials(message);
      break;
      
    case 'connection-test':
      handleConnectionTest(message);
      break;
      
    case 'delete-credential':
      handleDeleteCredential(message);
      break;
      
    case 'get-all-credentials':
      handleGetAllCredentials(message);
      break;
      
    default:
      sendMessage({
        type: 'error',
        error: 'Unknown message type: ' + message.type
      });
  }
}

// Start listening for messages
readMessage(handleMessage);

// Handle process termination
process.on('SIGTERM', () => {
  process.exit(0);
});

process.on('SIGINT', () => {
  process.exit(0);
});

// Log startup
logToApp('native-host-started', { pid: process.pid });
