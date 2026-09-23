import { describe, expect, it } from 'vitest'
import { normalizeForMatch, screenText } from './index'

describe('moderation', () => {
  it('normalises diacritics, đ and separators', () => {
    expect(normalizeForMatch('Đ.ị.T mẹ')).toBe('ditme')
    expect(normalizeForMatch('fuuuuck')).toBe('fuuck')
  })
  it('screens hard, soft, links and clean text', () => {
    expect(screenText('Mong cả nhà luôn khoẻ mạnh, trăng tròn mãi mãi 🌕')).toBe('ok')
    expect(screenText('Đ.ị.t mẹ tụi bây')).toBe('hard')
    expect(screenText('you are a fuuuucker')).toBe('hard')
    expect(screenText('Đồ ngu, chúc mừng trung thu')).toBe('soft')
    expect(screenText('Vào ngay www.casino-x.com nhận quà')).toBe('link')
  })
})
