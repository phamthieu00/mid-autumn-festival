import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { I18nProvider, useT } from './index'
import { interpolate } from './interpolate'

function Probe() {
  const { t, lang, toggleLang } = useT()
  return (
    <div>
      <span data-testid="lang">{lang}</span>
      <span data-testid="text">{t('nav.games')}</span>
      <span data-testid="interp">{t('home.hero.eyebrow', { year: 2026 })}</span>
      <button onClick={toggleLang}>toggle</button>
    </div>
  )
}

describe('i18n', () => {
  it('interpolates params and leaves unknown placeholders', () => {
    expect(interpolate('Hi {{name}} {{x}}', { name: 'A' })).toBe('Hi A {{x}}')
  })

  it('defaults to vi, toggles to en and persists', async () => {
    render(
      <I18nProvider>
        <Probe />
      </I18nProvider>,
    )
    expect(screen.getByTestId('lang')).toHaveTextContent('vi')
    expect(screen.getByTestId('text')).toHaveTextContent('Trò chơi')
    expect(screen.getByTestId('interp')).toHaveTextContent('2026')
    await userEvent.click(screen.getByRole('button'))
    expect(screen.getByTestId('text')).toHaveTextContent('Games')
    expect(document.documentElement.lang).toBe('en')
    expect(localStorage.getItem('maf:lang')).toBe('"en"')
  })
})
