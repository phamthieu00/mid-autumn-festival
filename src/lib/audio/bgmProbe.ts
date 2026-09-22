/** True only when the URL really serves an audio file (dev servers return index.html for misses). */
export async function probeBgmFile(url: string): Promise<boolean> {
  try {
    const res = await fetch(url, { method: 'HEAD' })
    if (!res.ok) return false
    return (res.headers.get('content-type') ?? '').toLowerCase().startsWith('audio/')
  } catch {
    return false
  }
}
