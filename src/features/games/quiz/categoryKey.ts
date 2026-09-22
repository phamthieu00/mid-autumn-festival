import type { TranslationKey } from '@/i18n'
import type { QuizCategory } from './types'

const KEYS: Record<QuizCategory, TranslationKey> = {
  legends: 'games.quiz.categories.legends',
  customs: 'games.quiz.categories.customs',
  food: 'games.quiz.categories.food',
  lanterns: 'games.quiz.categories.lanterns',
  'music-arts': 'games.quiz.categories.musicArts',
  asia: 'games.quiz.categories.asia',
  'moon-astronomy': 'games.quiz.categories.moonAstronomy',
  'dates-numbers': 'games.quiz.categories.datesNumbers',
  literature: 'games.quiz.categories.literature',
  modern: 'games.quiz.categories.modern',
  'gen-dates': 'games.quiz.categories.genDates',
  'gen-vocab': 'games.quiz.categories.genVocab',
  'gen-sets': 'games.quiz.categories.genSets',
  'gen-match': 'games.quiz.categories.genMatch',
  'gen-lunar': 'games.quiz.categories.genLunar',
  'gen-moon': 'games.quiz.categories.genMoon',
}

export const categoryKey = (c: QuizCategory): TranslationKey => KEYS[c]
