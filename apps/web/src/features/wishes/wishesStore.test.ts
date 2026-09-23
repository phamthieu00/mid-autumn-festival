import { beforeEach, describe, expect, it } from 'vitest'
import { wishesStore } from './wishesStore'
import { WISHES_CAP } from './types'

describe('wishesStore', () => {
  beforeEach(() => {
    localStorage.clear()
    wishesStore.__clearCache()
  })

  it('rejects empty and too long wishes', () => {
    expect(wishesStore.add({ text: '   ', color: 'red' })).toEqual({ ok: false, reason: 'empty' })
    expect(wishesStore.add({ text: 'a'.repeat(121), color: 'red' })).toEqual({
      ok: false,
      reason: 'tooLong',
    })
  })

  it('adds, trims and persists', () => {
    const res = wishesStore.add({ text: '  Trăng   tròn  ', name: '  Thiều ', color: 'gold' })
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.wish.text).toBe('Trăng tròn')
      expect(res.wish.name).toBe('Thiều')
    }
    wishesStore.__clearCache()
    expect(wishesStore.getAll()).toHaveLength(1)
  })

  it('caps at WISHES_CAP keeping newest', () => {
    for (let i = 0; i < WISHES_CAP + 5; i++) wishesStore.add({ text: `w${i}`, color: 'red' })
    const all = wishesStore.getAll()
    expect(all).toHaveLength(WISHES_CAP)
    expect(all[all.length - 1].text).toBe(`w${WISHES_CAP + 4}`)
    expect(all[0].text).toBe('w5')
  })

  it('removes by id', () => {
    const res = wishesStore.add({ text: 'x', color: 'red' })
    if (res.ok) wishesStore.remove(res.wish.id)
    expect(wishesStore.getAll()).toHaveLength(0)
  })
})
