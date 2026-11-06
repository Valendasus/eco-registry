import type { Appeal, CitizenFilters, CitizenSummary, SortState } from '../entities/citizen/types'
import { DISTRICTS, OPEN_APPEAL_STATUSES } from '../entities/citizen/dictionaries'
import { dayjs, ISO_DATE, today } from '../lib/date'
import { fullName } from '../lib/format'
import { CITIZENS_TOTAL, generateCitizen } from '../mock/generator'
import type { DashboardStats, DistrictStats, QueryResult, RecentAppeal, WorkerRequest, WorkerResponse } from './types'

interface Row {
  summary: CitizenSummary
  appeals: Appeal[]
  name: string
  haystack: string
  birthTime: number
}

const rows: Row[] = []
const indexById = new Map<number, number>()
const collator = new Intl.Collator('ru')
let statsCache: DashboardStats | null = null

function toRow(summary: CitizenSummary, appeals: Appeal[]): Row {
  const name = fullName(summary)
  return {
    summary,
    appeals,
    name,
    haystack: `${name} ${summary.regNumber} ${summary.snils} ${summary.accountNumber} ${summary.phone}`.toLowerCase(),
    birthTime: Date.parse(summary.birthDate),
  }
}

function upsert(summary: CitizenSummary, appeals: Appeal[]) {
  const row = toRow(summary, appeals)
  const index = indexById.get(summary.id)
  if (index === undefined) {
    indexById.set(summary.id, rows.length)
    rows.push(row)
  } else {
    rows[index] = row
  }
  statsCache = null
}

function init(overrides: { summary: CitizenSummary; appeals: Appeal[] }[]) {
  for (let id = 1; id <= CITIZENS_TOTAL; id++) {
    const { summary, appeals } = generateCitizen(id)
    indexById.set(id, rows.length)
    rows.push(toRow(summary, appeals))
  }
  overrides.forEach((record) => upsert(record.summary, record.appeals))
}

function buildPredicate(filters: CitizenFilters) {
  const terms = filters.search.toLowerCase().split(/\s+/).filter(Boolean)
  const districts = filters.districts.length ? new Set(filters.districts) : null
  const statuses = filters.statuses.length ? new Set(filters.statuses) : null
  const now = today()
  const bornBefore = now.subtract(filters.ageFrom, 'year').format(ISO_DATE)
  const bornAfter = now.subtract(filters.ageTo + 1, 'year').format(ISO_DATE)

  return ({ summary, haystack }: Row) => {
    if (districts && !districts.has(summary.districtId)) return false
    if (statuses && !statuses.has(summary.status)) return false
    if (filters.gender && summary.gender !== filters.gender) return false
    if (summary.birthDate > bornBefore || summary.birthDate <= bornAfter) return false
    if (filters.withDebt && summary.debt <= 0) return false
    if (filters.withOpenAppeals && summary.appealsOpen === 0) return false
    if (filters.categories.length && !filters.categories.every((category) => summary.categories.includes(category))) {
      return false
    }
    if (filters.registeredFrom && summary.registeredAt < filters.registeredFrom) return false
    if (filters.registeredTo && summary.registeredAt > filters.registeredTo) return false
    return terms.every((term) => haystack.includes(term))
  }
}

function buildComparator({ field, direction }: SortState) {
  const sign = direction === 'asc' ? 1 : -1
  const compare = (a: Row, b: Row): number => {
    switch (field) {
      case 'fullName':
        return collator.compare(a.name, b.name)
      case 'birthDate':
        return a.birthTime - b.birthTime
      case 'districtId':
        return collator.compare(a.summary.districtId, b.summary.districtId)
      case 'debt':
      case 'appealsTotal':
      case 'familySize':
        return a.summary[field] - b.summary[field]
      default:
        return a.summary[field] < b.summary[field] ? -1 : a.summary[field] > b.summary[field] ? 1 : 0
    }
  }
  return (a: Row, b: Row) => compare(a, b) * sign || a.summary.id - b.summary.id
}

function query(filters: CitizenFilters, sort: SortState): QueryResult {
  const started = performance.now()
  const matches = rows.filter(buildPredicate(filters))
  matches.sort(buildComparator(sort))
  const ids = new Int32Array(matches.length)
  matches.forEach((row, index) => {
    ids[index] = row.summary.id
  })
  return { ids, total: rows.length, elapsed: Math.round(performance.now() - started) }
}

const AGE_GROUPS: [string, number, number][] = [
  ['18–24', 18, 24],
  ['25–34', 25, 34],
  ['35–44', 35, 44],
  ['45–54', 45, 54],
  ['55–64', 55, 64],
  ['65–74', 65, 74],
  ['75+', 75, 200],
]

const countBy = <K extends string>(keys: readonly K[]) =>
  Object.fromEntries(keys.map((key) => [key, 0])) as Record<K, number>

function collectStats(): DashboardStats {
  const now = today()
  const nowIso = now.format(ISO_DATE)
  const days30 = now.subtract(30, 'day').format(ISO_DATE)
  const days60 = now.subtract(60, 'day').format(ISO_DATE)
  const firstMonth = now.subtract(11, 'month').startOf('month')
  const monthKeys = Array.from({ length: 12 }, (_, index) => firstMonth.add(index, 'month').format('YYYY-MM'))
  const dayKeys = Array.from({ length: 30 }, (_, index) => now.subtract(29 - index, 'day').format(ISO_DATE))

  const byMonth = new Map(monthKeys.map((month) => [month, { month, received: 0, resolved: 0, overdue: 0 }]))
  const registrations = new Map(monthKeys.map((month) => [month, 0]))
  const daily = new Map(dayKeys.map((date) => [date, 0]))
  const districts = new Map<string, DistrictStats>(
    DISTRICTS.map((district) => [
      district.value,
      { districtId: district.value, citizens: 0, debtors: 0, debt: 0, openAppeals: 0 },
    ]),
  )
  const executors = new Map<string, { name: string; open: number; resolved: number; overdue: number }>()

  const stats: DashboardStats = {
    generatedAt: new Date().toISOString(),
    citizens: {
      total: rows.length,
      active: 0,
      newLast30: 0,
      newPrev30: 0,
      debtors: 0,
      debtTotal: 0,
      withBenefits: 0,
      byCategory: countBy(['pensioner', 'disabled', 'largeFamily', 'lowIncome', 'veteran', 'svo', 'orphan', 'student']),
      ageGender: AGE_GROUPS.map(([group]) => ({ group, male: 0, female: 0 })),
      registrations: [],
    },
    appeals: {
      total: 0,
      open: 0,
      overdue: 0,
      last30: 0,
      prev30: 0,
      onTimeRate: 0,
      avgResolutionDays: 0,
      avgRating: 0,
      daily: [],
      byMonth: [],
      byChannel: countBy(['radar', 'phone', 'email', 'portal', 'office', 'mail']),
      byTopic: countBy(['schedule', 'container', 'billing', 'contract', 'dump', 'bulky', 'separate', 'other']),
      byStatus: countBy(['new', 'inProgress', 'waiting', 'resolved', 'rejected']),
      executors: [],
      recent: [],
    },
    districts: [],
  }

  let closedCount = 0
  let closedOnTime = 0
  let resolutionDays = 0
  let ratingSum = 0
  let ratingCount = 0
  let recent: RecentAppeal[] = []
  const nowYear = now.year()

  for (const { summary, appeals, name } of rows) {
    const citizens = stats.citizens
    const district = districts.get(summary.districtId)
    if (summary.status === 'active') citizens.active++
    if (summary.registeredAt >= days30) citizens.newLast30++
    else if (summary.registeredAt >= days60) citizens.newPrev30++
    if (summary.debt > 0) {
      citizens.debtors++
      citizens.debtTotal += summary.debt
    }
    if (summary.categories.length) citizens.withBenefits++
    summary.categories.forEach((category) => citizens.byCategory[category]++)

    const registeredMonth = summary.registeredAt.slice(0, 7)
    const registered = registrations.get(registeredMonth)
    if (registered !== undefined) registrations.set(registeredMonth, registered + 1)

    const age = nowYear - Number(summary.birthDate.slice(0, 4))
    const group = AGE_GROUPS.findIndex(([, from, to]) => age >= from && age <= to)
    if (group >= 0) citizens.ageGender[group][summary.gender]++

    if (district) {
      district.citizens++
      district.openAppeals += summary.appealsOpen
      if (summary.debt > 0) {
        district.debtors++
        district.debt += summary.debt
      }
    }

    for (const appeal of appeals) {
      const appealsStats = stats.appeals
      const created = appeal.createdAt.slice(0, 10)
      const open = OPEN_APPEAL_STATUSES.includes(appeal.status)
      const overdue = open ? appeal.dueDate < nowIso : !!appeal.closedAt && appeal.closedAt > appeal.dueDate

      appealsStats.total++
      appealsStats.byStatus[appeal.status]++
      appealsStats.byChannel[appeal.channel]++
      appealsStats.byTopic[appeal.topic]++
      if (open) appealsStats.open++
      if (open && overdue) appealsStats.overdue++
      if (created >= days30) appealsStats.last30++
      else if (created >= days60) appealsStats.prev30++

      const dayCount = daily.get(created)
      if (dayCount !== undefined) daily.set(created, dayCount + 1)

      const month = byMonth.get(created.slice(0, 7))
      if (month) {
        month.received++
        if (appeal.status === 'resolved') month.resolved++
        if (overdue) month.overdue++
      }

      if (appeal.closedAt) {
        closedCount++
        if (!overdue) closedOnTime++
        resolutionDays += dayjs(appeal.closedAt).diff(created, 'day')
      }
      if (appeal.rating) {
        ratingSum += appeal.rating
        ratingCount++
      }

      const executor = executors.get(appeal.executor) ?? { name: appeal.executor, open: 0, resolved: 0, overdue: 0 }
      if (open) executor.open++
      if (appeal.status === 'resolved' && created >= days30) executor.resolved++
      if (open && overdue) executor.overdue++
      executors.set(appeal.executor, executor)

      if (created >= days30 && (recent.length < 8 || appeal.createdAt > recent[recent.length - 1].createdAt)) {
        recent.push({ ...appeal, citizenName: name })
        recent.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        recent = recent.slice(0, 8)
      }
    }
  }

  stats.appeals.onTimeRate = closedCount ? closedOnTime / closedCount : 0
  stats.appeals.avgResolutionDays = closedCount ? resolutionDays / closedCount : 0
  stats.appeals.avgRating = ratingCount ? ratingSum / ratingCount : 0
  stats.appeals.byMonth = [...byMonth.values()]
  stats.appeals.daily = [...daily].map(([date, count]) => ({ date, count }))
  stats.appeals.executors = [...executors.values()].sort((a, b) => b.open - a.open)
  stats.appeals.recent = recent
  stats.citizens.registrations = [...registrations].map(([month, count]) => ({ month, count }))
  stats.districts = [...districts.values()].sort((a, b) => b.citizens - a.citizens)
  return stats
}

function handle(request: WorkerRequest): unknown {
  switch (request.type) {
    case 'init':
      init(request.records)
      return rows.length
    case 'query':
      return query(request.filters, request.sort)
    case 'stats':
      statsCache ??= collectStats()
      return statsCache
    case 'upsert':
      upsert(request.summary, request.appeals)
      return true
  }
}

self.onmessage = (event: MessageEvent<WorkerRequest & { requestId: number }>) => {
  const { requestId, ...request } = event.data
  try {
    const payload = handle(request as WorkerRequest)
    const transfer = request.type === 'query' ? [(payload as QueryResult).ids.buffer] : []
    self.postMessage({ requestId, ok: true, payload } satisfies WorkerResponse, { transfer })
  } catch (error) {
    self.postMessage({ requestId, ok: false, error: String(error) } satisfies WorkerResponse)
  }
}
