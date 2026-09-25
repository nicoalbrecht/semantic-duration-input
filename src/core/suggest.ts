/** Optimal string alignment distance (Levenshtein plus adjacent transpositions). */
export function editDistance(a: string, b: string): number {
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i])
  for (let j = 1; j <= b.length; j++) d[0][j] = j
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
      }
    }
  }
  return d[a.length][b.length]
}

/**
 * Closest candidate, or `undefined`. Allows one edit for words shorter than 5 characters and two otherwise.
 * Short candidates (< 3 chars) are skipped, since almost anything is close to "h" or "d".
 */
export function suggest(word: string, candidates: Iterable<string>): string | undefined {
  const maxDistance = word.length < 5 ? 1 : 2
  let best: string | undefined
  let bestDistance = maxDistance + 1
  for (const candidate of candidates) {
    if (candidate.length < 3) continue
    const distance = editDistance(word, candidate)
    if (distance < bestDistance) {
      best = candidate
      bestDistance = distance
    }
  }
  return best
}
