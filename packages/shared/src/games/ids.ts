export const GAME_IDS = ['catch', 'match', 'quiz', 'runner', 'rhythm', 'puzzle', 'word'] as const
export type GameId = (typeof GAME_IDS)[number]

/** Whether a larger score value ranks higher for the game. */
export const HIGHER_IS_BETTER: Record<GameId, boolean> = {
  catch: true,
  match: false,
  quiz: true,
  runner: true,
  rhythm: true,
  puzzle: false,
  word: true,
}
