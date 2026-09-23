/** Stereo exponentially-decaying noise impulse response for a convolver reverb. */
export function generateImpulseData(
  sampleRate: number,
  seconds = 3,
  decay = 2.4,
  rng: () => number = Math.random,
): [Float32Array, Float32Array] {
  const len = Math.max(1, Math.floor(sampleRate * seconds))
  const left = new Float32Array(len)
  const right = new Float32Array(len)
  for (let i = 0; i < len; i++) {
    const env = (1 - i / len) ** decay
    left[i] = (rng() * 2 - 1) * env
    right[i] = (rng() * 2 - 1) * env
  }
  return [left, right]
}
