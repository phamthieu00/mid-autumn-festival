const PREFIX = 'maf:'

const memory = new Map<string, string>()

function available(): boolean {
  try {
    const probe = `${PREFIX}__probe`
    localStorage.setItem(probe, '1')
    localStorage.removeItem(probe)
    return true
  } catch {
    return false
  }
}

export function safeGet<T>(key: string, fallback: T): T {
  const full = PREFIX + key
  try {
    const raw = available() ? localStorage.getItem(full) : (memory.get(full) ?? null)
    if (raw == null) return fallback
    return JSON.parse(raw) as T
  } catch {
    return fallback
  }
}

export function safeSet<T>(key: string, value: T): boolean {
  const full = PREFIX + key
  const raw = JSON.stringify(value)
  try {
    if (available()) {
      localStorage.setItem(full, raw)
      return true
    }
  } catch {
    // quota exceeded or blocked, fall through to memory
  }
  memory.set(full, raw)
  return false
}

export function safeRemove(key: string) {
  const full = PREFIX + key
  try {
    localStorage.removeItem(full)
  } catch {
    // ignore
  }
  memory.delete(full)
}
