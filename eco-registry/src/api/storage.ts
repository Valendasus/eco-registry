import type { CitizenDetails } from '../entities/citizen/types'

const STORAGE_KEY = 'eco-registry.citizens.v1'

function read(): Record<number, CitizenDetails> {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}')
  } catch {
    return {}
  }
}

const saved = read()

export const savedCitizens = {
  get: (id: number): CitizenDetails | undefined => saved[id],
  all: () => Object.values(saved),
  put(citizen: CitizenDetails) {
    saved[citizen.id] = citizen
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    } catch {
      return
    }
  },
}
