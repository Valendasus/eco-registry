import type {
  Appeal,
  AppealChannel,
  AppealStatus,
  AppealTopic,
  CitizenFilters,
  CitizenSummary,
  SocialCategory,
  SortState,
} from '../entities/citizen/types'

export interface DistrictStats {
  districtId: string
  citizens: number
  debtors: number
  debt: number
  openAppeals: number
}

export interface MonthStats {
  month: string
  received: number
  resolved: number
  overdue: number
}

export interface RecentAppeal extends Appeal {
  citizenName: string
}

export interface DashboardStats {
  generatedAt: string
  citizens: {
    total: number
    active: number
    newLast30: number
    newPrev30: number
    debtors: number
    debtTotal: number
    withBenefits: number
    byCategory: Record<SocialCategory, number>
    ageGender: { group: string; male: number; female: number }[]
    registrations: { month: string; count: number }[]
  }
  appeals: {
    total: number
    open: number
    overdue: number
    last30: number
    prev30: number
    onTimeRate: number
    avgResolutionDays: number
    avgRating: number
    daily: { date: string; count: number }[]
    byMonth: MonthStats[]
    byChannel: Record<AppealChannel, number>
    byTopic: Record<AppealTopic, number>
    byStatus: Record<AppealStatus, number>
    executors: { name: string; open: number; resolved: number; overdue: number }[]
    recent: RecentAppeal[]
  }
  districts: DistrictStats[]
}

export interface QueryResult {
  ids: Int32Array
  total: number
  elapsed: number
}

export type WorkerRequest =
  | { type: 'init'; records: { summary: CitizenSummary; appeals: Appeal[] }[] }
  | { type: 'query'; filters: CitizenFilters; sort: SortState }
  | { type: 'stats' }
  | { type: 'upsert'; summary: CitizenSummary; appeals: Appeal[] }

export type WorkerResponse =
  | { requestId: number; ok: true; payload: unknown }
  | { requestId: number; ok: false; error: string }
