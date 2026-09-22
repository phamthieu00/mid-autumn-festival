/** D pentatonic (điệu Bắc): D E F# A B */
export const PENTATONIC = [0, 2, 4, 7, 9] as const
export const ROOT_MIDI = 62 // D4
export const SCALE_SIZE = PENTATONIC.length
/** Chord voicings as scale-degree indexes: [root, fifth, second] style stacks that stay inside the mode. */
export const CHORDS: readonly (readonly number[])[] = [
  [0, 3, 1], // D A E
  [3, 1, 0], // A E D
  [1, 3, 2], // E A F#
  [4, 1, 3], // B E A
]

const mod = (n: number, m: number) => ((n % m) + m) % m

/** degree may exceed the scale size; every 5 degrees is one octave. */
export function degreeToMidi(degree: number, octaveOffset = 0): number {
  const oct = Math.floor(degree / SCALE_SIZE)
  const d = mod(degree, SCALE_SIZE)
  return ROOT_MIDI + PENTATONIC[d] + 12 * (oct + octaveOffset)
}

export const midiToFreq = (midi: number) => 440 * 2 ** ((midi - 69) / 12)

export const degreeToFreq = (degree: number, octaveOffset = 0) =>
  midiToFreq(degreeToMidi(degree, octaveOffset))

export function isChordTone(degree: number, chordIdx: number): boolean {
  return CHORDS[chordIdx].includes(mod(degree, SCALE_SIZE))
}

export function chordFreqs(chordIdx: number): number[] {
  const [root, a, b] = CHORDS[chordIdx]
  return [degreeToFreq(root, -2), degreeToFreq(a, -1), degreeToFreq(b, -1)]
}
