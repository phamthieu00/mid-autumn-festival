import type { QuizQuestion } from '../../types'
import { legends } from './legends'
import { customs } from './customs'
import { food } from './food'
import { lanterns } from './lanterns'
import { musicArts } from './music-arts'
import { asia } from './asia'
import { moonAstronomy } from './moon-astronomy'
import { datesNumbers } from './dates-numbers'
import { literature } from './literature'
import { modern } from './modern'

export const CURATED: QuizQuestion[] = [
  ...legends,
  ...customs,
  ...food,
  ...lanterns,
  ...musicArts,
  ...asia,
  ...moonAstronomy,
  ...datesNumbers,
  ...literature,
  ...modern,
]
