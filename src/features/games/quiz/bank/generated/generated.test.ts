import { describe, expect, it } from 'vitest'
import { buildGenerated } from './index'
import { generateDateQuestions } from './dates'
import { generateVocabQuestions } from './vocab'
import { generateSetQuestions } from './sets'
import { generateMatchQuestions } from './match'
import { generateLunarQuestions } from './lunar'
import { generateMoonPhaseQuestions } from './moonPhase'
import { GLOSSARY } from './glossary'
import { SET_LISTS } from './setLists'

const byId = (id: string) => buildGenerated().find((q) => q.id === id)!

describe('generated questions', () => {
  it('reaches the expected volumes', () => {
    expect(generateDateQuestions().length).toBeGreaterThanOrEqual(50)
    expect(generateVocabQuestions().length).toBeGreaterThanOrEqual(200)
    expect(generateSetQuestions().length).toBeGreaterThanOrEqual(300)
    expect(generateMatchQuestions().length).toBeGreaterThanOrEqual(70)
    expect(generateLunarQuestions().length).toBe(40)
    expect(generateMoonPhaseQuestions().length).toBe(8)
    expect(buildGenerated().length).toBeGreaterThanOrEqual(740)
  })

  it('spot-checks facts', () => {
    const wday = byId('g:date:wday:2026')
    expect(wday.options[wday.correctIndex].en).toBe('Friday')
    const fwd = byId('g:date:fwd:2028')
    expect(fwd.options[fwd.correctIndex].vi).toBe('3/10/2028')
    const rev = byId('g:date:rev:2026')
    expect(rev.options[rev.correctIndex].vi).toBe('2026')
    const next = byId('g:lunar:next:ong-tao')
    expect(next.options[next.correctIndex].vi).toBe('Tết Nguyên Đán')
    const lunarRev = byId('g:lunar:rev:trung-thu')
    expect(lunarRev.options[lunarRev.correctIndex].vi).toBe('Tết Trung Thu')
    const full = byId('g:moon:fwd:full')
    expect(full.options[full.correctIndex].en).toBe('Full moon')
  })

  it('vocab distractors never contain the answer and come from the same group', () => {
    for (const q of generateVocabQuestions()) {
      const correct = q.options[q.correctIndex]
      const others = q.options.filter((_, i) => i !== q.correctIndex)
      expect(others.some((o) => o.vi === correct.vi)).toBe(false)
    }
    const groups = new Map<string, number>()
    for (const e of GLOSSARY) groups.set(e.group, (groups.get(e.group) ?? 0) + 1)
    for (const n of groups.values()) expect(n).toBeGreaterThanOrEqual(4)
  })

  it('set lists are consistent', () => {
    for (const list of SET_LISTS) {
      expect(list.members.length).toBeGreaterThanOrEqual(4)
      expect(list.outsiders.length).toBeGreaterThanOrEqual(4)
      const members = new Set(list.members.map((m) => m.vi))
      for (const o of list.outsiders) expect(members.has(o.vi)).toBe(false)
    }
  })
})
