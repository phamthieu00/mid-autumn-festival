import { useContext } from 'react'
import { AudioCtx } from '@/lib/audio/AudioProvider'

export function useAudio() {
  const ctx = useContext(AudioCtx)
  if (!ctx) throw new Error('useAudio must be used within <AudioProvider>')
  return ctx
}
