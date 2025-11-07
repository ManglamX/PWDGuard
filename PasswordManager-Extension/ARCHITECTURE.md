# PwdGuard Extension - Architecture Documentation

## System Architecture

### High-Level Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         User's Browser                           │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                    Chrome Extension                         │ │
│  │                                                             │ │
│  │  ┌──────────────┐  ┌──────────────┐  ┌─────────────────┐ │ │
│  │  │   Content    │  │  Background  │  │  Popup/Settings │ │ │
│  │  │   Script     │◄─┤   Service    │◄─┤      UI         │ │ │
│  │  │  (content.js)│  │   Worker     │  │                 │ │ │
│  │  └──────┬───────┘  └──────┬───────┘  └─────────────────┘ │ │
│  │         │                  │                               │ │
│  │         │ Detects Forms    │ Native Messaging              │ │
│  │         │ Captures Creds   │ (stdio)                       │ │
│  │         │                  │                               │ │
│  └─────────┼──────────────────┼───────────────────────────────┘ │
│            │                  │                                 │
│            │                  ▼                                 │
│            │         ┌─────────────────┐                        │
│            │         │  Native Host    │                        │
│            │         │  (native-host.js)│                       │
│            │         └────────┬────────┘                        │
│            │                  │                                 │
└────────────┼──────────────────┼─────────────────────────────────┘
             │                  │
             │                  │ Encrypted Storage
             │                  ▼
             │         ┌─────────────────┐
             │         │  File System    │
             │         │  (JSON files)   │
             │         └────────┬────────┘
             │                  │
             │                  │ Reads/Writes
             │                  ▼
             │         ┌─────────────────┐
             │         │  Desktop App    │
             └────────►│   (Electron)    │
                       └─────────────────┘
```

---

## Component Architecture

### 1. Content Script Layer

```
┌─────────────────────────────────────────────────────────┐
│                    content.js                            │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │    Form      │  │  Credential  │  │   Auto-fill  │ │
│  │  Detection   │─►│   Capture    │  │   Manager    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                  │                  │         │
│         ▼                  ▼                  ▼         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Mutation   │  │    Save      │  │  Credential  │ │
│  │   Observer   │  │   Prompt     │  │   Selector   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Responsibilities:**
- Detect login forms on web pages
- Analyze form fields (username, password)
- Capture credentials on form submission
- Display save prompts
- Show auto-fill banners
- Fill form fields with saved credentials
- Handle multiple accounts per site

---

### 2. Background Service Worker

```
┌─────────────────────────────────────────────────────────┐
│                   background.js                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Native     │  │   Message    │  │   Context    │ │
│  │  Messaging   │◄─┤   Router     │─►│    Menu      │ │
│  │  Connection  │  │              │  │   Manager    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                  │                  │         │
│         ▼                  ▼                  ▼         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Connection  │  │   Command    │  │    Icon      │ │
│  │   Status     │  │   Handler    │  │   Manager    │ │
│  │   Monitor    │  │  (Shortcuts) │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Responsibilities:**
- Establish and maintain Native Messaging connection
- Route messages between content scripts and native host
- Handle keyboard shortcuts
- Manage context menus
- Update extension icon based on connection status
- Store and retrieve settings

---

### 3. User Interface Layer

```
┌─────────────────────────────────────────────────────────┐
│                  Popup Interface                         │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Connection  │  │    Site      │  │    Quick     │ │
│  │   Status     │  │    Info      │  │   Actions    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Settings   │  │   Password   │  │   Desktop    │ │
│  │   Toggles    │  │  Generator   │  │  App Link    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│                 Settings Interface                       │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   General    │  │   Security   │  │  Never-Save  │ │
│  │  Settings    │  │   Settings   │  │     List     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Connection  │  │    Theme     │  │    About     │ │
│  │    Test      │  │  Selection   │  │     Info     │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

### 4. Native Messaging Host

```
┌─────────────────────────────────────────────────────────┐
│                  native-host.js                          │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Message    │  │  Encryption  │  │    File      │ │
│  │   Reader     │─►│   Manager    │─►│   Storage    │ │
│  │   (stdio)    │  │  (AES-256)   │  │   Manager    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                  │                  │         │
│         ▼                  ▼                  ▼         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Message    │  │  Decryption  │  │    Logger    │ │
│  │   Writer     │◄─┤   Manager    │◄─┤              │ │
│  │   (stdio)    │  │              │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Responsibilities:**
- Read messages from Chrome via stdio
- Write responses back via stdio
- Encrypt passwords using AES-256-CBC
- Decrypt passwords when requested
- Store credentials in JSON files
- Manage credential CRUD operations
- Log activity for desktop app

---

### 5. Desktop App Integration

```
┌─────────────────────────────────────────────────────────┐
│              extension-integration.ts                    │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │     Log      │  │    Event     │  │ Notification │ │
│  │   Watcher    │─►│   Handler    │─►│   Manager    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│         │                  │                  │         │
│         ▼                  ▼                  ▼         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │     IPC      │  │  Credential  │  │   Renderer   │ │
│  │   Handlers   │  │   Manager    │  │   Updates    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│                                                          │
└─────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────┐
│           ExtensionCredentials.tsx (React)               │
├─────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  Credential  │  │    Search    │  │   Domain     │ │
│  │     List     │  │    Filter    │  │   Grouping   │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │    Copy      │  │    Delete    │  │   Real-time  │ │
│  │   Actions    │  │   Actions    │  │   Updates    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Data Flow Diagrams

### Save Password Flow

```
┌─────────┐
│  User   │
│ Submits │
│  Form   │
└────┬────┘
     │
     ▼
┌─────────────────┐
│  content.js     │
│  Captures       │
│  Credentials    │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Shows Save     │
│  Prompt         │
└────┬────────────┘
     │ User clicks "Save"
     ▼
┌─────────────────┐
│  background.js  │
│  Receives       │
│  Request        │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Native         │
│  Messaging      │
│  (stdio)        │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  native-host.js │
│  Encrypts       │
│  Password       │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Stores in      │
│  JSON File      │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Sends          │
│  Confirmation   │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Desktop App    │
│  Shows          │
│  Notification   │
└─────────────────┘
```

### Auto-fill Password Flow

```
┌─────────┐
│  User   │
│ Visits  │
│  Site   │
└────┬────┘
     │
     ▼
┌─────────────────┐
│  content.js     │
│  Detects Login  │
│  Form           │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Requests       │
│  Credentials    │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  background.js  │
│  Routes         │
│  Request        │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  native-host.js │
│  Decrypts       │
│  Password       │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Returns        │
│  Credentials    │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  content.js     │
│  Shows Banner   │
└────┬────────────┘
     │ User clicks "Auto-fill"
     ▼
┌─────────────────┐
│  Fills Form     │
│  Fields         │
└─────────────────┘
```

---

## Security Architecture

### Encryption Flow

```
┌──────────────┐
│   Password   │
│  (plaintext) │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  Generate Random IV  │
│     (16 bytes)       │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   AES-256-CBC        │
│   Encryption         │
│   Key: 32 bytes      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Encrypted Password  │
│  Format: IV:Cipher   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Store in JSON File  │
│  %APPDATA%/PwdGuard/ │
└──────────────────────┘
```

### Storage Structure

```
%APPDATA%/PwdGuard/
├── encryption.key          (32 bytes, generated once)
├── extension.log           (activity log)
└── credentials/
    ├── example.com.json    (encrypted credentials)
    ├── github.com.json
    └── google.com.json

Each JSON file structure:
[
  {
    "domain": "example.com",
    "username": "user@example.com",
    "password": "IV:EncryptedPassword",
    "formType": "login",
    "timestamp": 1234567890,
    "lastUsed": 1234567890,
    "id": "unique-id"
  }
]
```

---

## Communication Protocols

### Native Messaging Protocol

```
Chrome Extension ←→ Native Host

Message Format:
┌────────────────────────────────┐
│  4 bytes: Message Length (LE)  │
├────────────────────────────────┤
│  N bytes: JSON Message         │
└────────────────────────────────┘

Example Messages:

Save Request:
{
  "type": "save-credentials",
  "domain": "example.com",
  "username": "user@example.com",
  "password": "plaintext",
  "formType": "login",
  "timestamp": 1234567890
}

Save Response:
{
  "type": "save-response",
  "success": true,
  "domain": "example.com",
  "timestamp": 1234567890
}

Get Request:
{
  "type": "get-credentials",
  "domain": "example.com",
  "messageId": 1234567890
}

Get Response:
{
  "type": "credentials-response",
  "credentials": [
    {
      "username": "user@example.com",
      "password": "plaintext",
      "lastUsed": 1234567890,
      "id": "unique-id"
    }
  ],
  "messageId": 1234567890
}
```

---

## Error Handling

### Error Flow

```
┌─────────────────┐
│  Error Occurs   │
└────┬────────────┘
     │
     ▼
┌─────────────────┐
│  Try-Catch      │
│  Block          │
└────┬────────────┘
     │
     ├─► Log Error
     │
     ├─► Show User-Friendly Message
     │
     ├─► Send Error Response
     │
     └─► Graceful Degradation
```

### Error Types

1. **Connection Errors**
   - Native host not found
   - Connection timeout
   - Message format error

2. **Storage Errors**
   - File system access denied
   - Encryption key missing
   - JSON parse error

3. **Form Detection Errors**
   - No login form found
   - Field identification failed
   - Form submission not detected

4. **User Errors**
   - Invalid domain format
   - Empty credentials
   - Duplicate entry

---

## Performance Considerations

### Optimization Strategies

1. **Content Script**
   - Debounced form detection
   - Efficient DOM queries
   - Minimal memory footprint

2. **Background Script**
   - Connection pooling
   - Message queuing
   - Async operations

3. **Native Host**
   - Streaming JSON parsing
   - Cached encryption keys
   - Efficient file I/O

4. **Desktop Integration**
   - File system watching
   - Debounced updates
   - Lazy loading

---

## Scalability

### Handling Large Datasets

```
Number of Credentials: 1,000+
├── Indexed by domain
├── Lazy loading in UI
├── Search optimization
└── Pagination support

File Size Management:
├── One file per domain
├── Compressed JSON
├── Periodic cleanup
└── Archive old entries
```

---

## Testing Architecture

### Test Layers

```
┌─────────────────────────────────┐
│      Unit Tests                  │
│  - Individual functions          │
│  - Encryption/Decryption         │
│  - Form detection logic          │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│   Integration Tests              │
│  - Extension ↔ Native Host       │
│  - Native Host ↔ File System     │
│  - Desktop App ↔ Extension       │
└─────────────────────────────────┘
┌─────────────────────────────────┐
│      E2E Tests                   │
│  - Full save/auto-fill flow      │
│  - Multi-account scenarios       │
│  - Error handling                │
└─────────────────────────────────┘
```

---

## Deployment Architecture

### Installation Flow

```
1. User downloads extension
   ↓
2. Loads unpacked in Chrome
   ↓
3. Gets Extension ID
   ↓
4. Runs installation script
   ↓
5. Script installs native host
   ↓
6. Registers with Chrome
   ↓
7. Extension connects
   ↓
8. Ready to use
```

---

## Future Architecture Enhancements

### Planned Improvements

1. **WebAssembly Encryption**
   - Faster encryption
   - Better security
   - Cross-platform

2. **IndexedDB Caching**
   - Offline support
   - Faster lookups
   - Better performance

3. **Service Worker Optimization**
   - Persistent connections
   - Background sync
   - Better reliability

4. **Cloud Sync (Optional)**
   - End-to-end encryption
   - Multi-device support
   - Backup/restore

---

## Conclusion

The PwdGuard extension architecture is designed for:
- **Security**: AES-256 encryption, local-only storage
- **Performance**: Efficient algorithms, minimal overhead
- **Reliability**: Error handling, graceful degradation
- **Scalability**: Handles thousands of credentials
- **Maintainability**: Modular design, clear separation

**Status: Production Ready** ✅
