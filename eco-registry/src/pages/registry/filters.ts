import type { CitizenFilters } from '../../entities/citizen/types'
import {
  CITIZEN_STATUSES,
  DISTRICT_LABELS,
  GENDERS,
  SOCIAL_CATEGORIES,
} from '../../entities/citizen/dictionaries'
import { formatDate } from '../../lib/format'

export const AGE_LIMITS = [18, 100] as const

export const DEFAULT_FILTERS: CitizenFilters = {
  search: '',
  districts: [],
  statuses: [],
  categories: [],
  gender: '',
  ageFrom: AGE_LIMITS[0],
  ageTo: AGE_LIMITS[1],
  withDebt: false,
  withOpenAppeals: false,
  registeredFrom: '',
  registeredTo: '',
}

export interface ActiveFilter {
  key: string
  label: string
  reset: (filters: CitizenFilters) => CitizenFilters
}

export function describeFilters(filters: CitizenFilters): ActiveFilter[] {
  const result: ActiveFilter[] = []

  filters.districts.forEach((district) =>
    result.push({
      key: `district-${district}`,
      label: DISTRICT_LABELS[district],
      reset: (current) => ({ ...current, districts: current.districts.filter((item) => item !== district) }),
    }),
  )
  filters.statuses.forEach((status) =>
    result.push({
      key: `status-${status}`,
      label: CITIZEN_STATUSES[status].label,
      reset: (current) => ({ ...current, statuses: current.statuses.filter((item) => item !== status) }),
    }),
  )
  filters.categories.forEach((category) =>
    result.push({
      key: `category-${category}`,
      label: SOCIAL_CATEGORIES[category].label,
      reset: (current) => ({ ...current, categories: current.categories.filter((item) => item !== category) }),
    }),
  )
  if (filters.gender) {
    result.push({ key: 'gender', label: GENDERS[filters.gender], reset: (current) => ({ ...current, gender: '' }) })
  }
  if (filters.ageFrom !== AGE_LIMITS[0] || filters.ageTo !== AGE_LIMITS[1]) {
    result.push({
      key: 'age',
      label: `Возраст ${filters.ageFrom}–${filters.ageTo}`,
      reset: (current) => ({ ...current, ageFrom: AGE_LIMITS[0], ageTo: AGE_LIMITS[1] }),
    })
  }
  if (filters.withDebt) {
    result.push({ key: 'debt', label: 'Есть задолженность', reset: (current) => ({ ...current, withDebt: false }) })
  }
  if (filters.withOpenAppeals) {
    result.push({
      key: 'appeals',
      label: 'Открытые обращения',
      reset: (current) => ({ ...current, withOpenAppeals: false }),
    })
  }
  if (filters.registeredFrom || filters.registeredTo) {
    result.push({
      key: 'registered',
      label: `Учёт ${filters.registeredFrom ? `с ${formatDate(filters.registeredFrom)}` : ''} ${filters.registeredTo ? `по ${formatDate(filters.registeredTo)}` : ''}`.trim(),
      reset: (current) => ({ ...current, registeredFrom: '', registeredTo: '' }),
    })
  }
  return result
}
