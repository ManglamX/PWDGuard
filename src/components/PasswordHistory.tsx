import { useState } from 'react'

// Placeholder UI; storage will be wired with encryption later
export function PasswordHistory() {
  const [items] = useState<{ value: string; createdAt: string; entropyBits: number; note?: string }[]>([])
  return (
    <div>
      <p>Password history will appear here once enabled in Settings.</p>
      {items.length === 0 && <p>No items yet.</p>}
    </div>
  )
}


