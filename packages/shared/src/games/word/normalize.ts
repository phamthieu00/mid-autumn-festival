export const ALPHABET = [
  'A',
  'B',
  'C',
  'D',
  'Đ',
  'E',
  'G',
  'H',
  'I',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'X',
  'Y',
] as const
export type Letter = (typeof ALPHABET)[number]

/** Strip Vietnamese diacritics (NFD combining marks) and upper-case. Đ stays Đ. */
export function baseLetter(ch: string): string {
  return ch.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase()
}

export const isLetterPos = (ch: string) => ch !== ' ' && ch !== '-'

export function toLetter(input: string): Letter | null {
  if (!input) return null
  const b = baseLetter(input[0])
  return (ALPHABET as readonly string[]).includes(b) ? (b as Letter) : null
}
