export type Weighted<T> = readonly (readonly [T, number])[]

export function createRandom(seed: number) {
  let state = seed >>> 0

  const next = () => {
    state = (state + 0x6d2b79f5) >>> 0
    let t = state
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }

  const int = (min: number, max: number) => min + Math.floor(next() * (max - min + 1))

  const pick = <T>(items: readonly T[]): T => items[Math.floor(next() * items.length)]

  const chance = (probability: number) => next() < probability

  const weighted = <T>(entries: Weighted<T>): T => {
    const total = entries.reduce((sum, [, weight]) => sum + weight, 0)
    let roll = next() * total
    for (const [value, weight] of entries) {
      roll -= weight
      if (roll < 0) return value
    }
    return entries[entries.length - 1][0]
  }

  const digits = (length: number) => {
    let result = ''
    for (let i = 0; i < length; i++) result += int(0, 9)
    return result
  }

  const sample = <T>(items: readonly T[], count: number): T[] => {
    const pool = [...items]
    const result: T[] = []
    while (result.length < count && pool.length) {
      result.push(pool.splice(Math.floor(next() * pool.length), 1)[0])
    }
    return result
  }

  return { next, int, pick, chance, weighted, digits, sample }
}

export type Random = ReturnType<typeof createRandom>

export const hashSeed = (id: number, salt = 0) => Math.imul(id ^ 0x5bd1e995, 2654435761) + salt
