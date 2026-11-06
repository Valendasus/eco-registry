import type { Appeal, CitizenDetails, CitizenFilters, CitizenSummary, SortState } from '../entities/citizen/types'
import { OPEN_APPEAL_STATUSES } from '../entities/citizen/dictionaries'
import { dayjs, ISO_DATE } from '../lib/date'
import { CITIZENS_TOTAL, generateCitizen, generateDetails } from '../mock/generator'
import { CURRENT_USER } from '../app/currentUser'
import { savedCitizens } from './storage'
import type { DashboardStats, QueryResult, WorkerRequest, WorkerResponse } from './types'

const worker = new Worker(new URL('./registry.worker.ts', import.meta.url), { type: 'module' })
const pending = new Map<number, { resolve: (value: unknown) => void; reject: (error: Error) => void }>()
let lastRequestId = 0

worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
  const response = event.data
  const request = pending.get(response.requestId)
  if (!request) return
  pending.delete(response.requestId)
  if (response.ok) request.resolve(response.payload)
  else request.reject(new Error(response.error))
}

function call<T>(request: WorkerRequest): Promise<T> {
  const requestId = ++lastRequestId
  return new Promise<T>((resolve, reject) => {
    pending.set(requestId, { resolve: resolve as (value: unknown) => void, reject })
    worker.postMessage({ ...request, requestId })
  })
}

const SUMMARY_KEYS = [
  'id', 'regNumber', 'lastName', 'firstName', 'middleName', 'gender', 'birthDate', 'snils', 'phone', 'districtId',
  'locality', 'status', 'categories', 'accountNumber', 'debt', 'appealsTotal', 'appealsOpen', 'familySize',
  'registeredAt', 'updatedAt',
] as const satisfies readonly (keyof CitizenSummary)[]

const toSummary = (citizen: CitizenDetails) =>
  Object.fromEntries(SUMMARY_KEYS.map((key) => [key, citizen[key]])) as unknown as CitizenSummary

const ready = call<number>({
  type: 'init',
  records: savedCitizens.all().map((citizen) => ({ summary: toSummary(citizen), appeals: citizen.appeals })),
})

const summaryCache = new Map<number, CitizenSummary>()
const SUMMARY_CACHE_LIMIT = 3000

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

function normalize(citizen: CitizenDetails): CitizenDetails {
  const primary = citizen.phones.find((phone) => phone.primary) ?? citizen.phones[0]
  return {
    ...citizen,
    phone: primary?.number ?? '',
    actualAddress: citizen.sameAddress ? citizen.registrationAddress : citizen.actualAddress,
    familySize: citizen.family.filter((member) => member.livesTogether).length + 1,
    appealsTotal: citizen.appeals.length,
    appealsOpen: citizen.appeals.filter((appeal) => OPEN_APPEAL_STATUSES.includes(appeal.status)).length,
    updatedAt: dayjs().format(ISO_DATE),
  }
}

async function persist(citizen: CitizenDetails) {
  savedCitizens.put(citizen)
  summaryCache.delete(citizen.id)
  await call({ type: 'upsert', summary: toSummary(citizen), appeals: citizen.appeals })
  return citizen
}

export const citizensApi = {
  ready,

  async query(filters: CitizenFilters, sort: SortState) {
    await ready
    return call<QueryResult>({ type: 'query', filters, sort })
  },

  async stats() {
    await ready
    return call<DashboardStats>({ type: 'stats' })
  },

  getSummary(id: number): CitizenSummary {
    let summary = summaryCache.get(id)
    if (!summary) {
      const saved = savedCitizens.get(id)
      summary = saved ? toSummary(saved) : generateCitizen(id).summary
      if (summaryCache.size > SUMMARY_CACHE_LIMIT) summaryCache.clear()
      summaryCache.set(id, summary)
    }
    return summary
  },

  async getDetails(id: number): Promise<CitizenDetails> {
    await delay(180)
    const saved = savedCitizens.get(id)
    if (saved) return saved
    if (id < 1 || id > CITIZENS_TOTAL) throw new Error('Гражданин не найден')
    return generateDetails(generateCitizen(id))
  },

  async save(citizen: CitizenDetails, action = 'Изменены данные карточки') {
    await delay(350)
    const next = normalize({
      ...citizen,
      history: [
        { id: `h${Date.now()}`, at: dayjs().format('YYYY-MM-DDTHH:mm'), author: CURRENT_USER.shortName, action },
        ...citizen.history,
      ],
    })
    return persist(next)
  },

  async create(draft: CitizenDetails) {
    await ready
    const ids = savedCitizens.all().map((citizen) => citizen.id)
    const id = Math.max(CITIZENS_TOTAL, ...ids) + 1
    const regNumber = `КЛ-${String(id).padStart(6, '0')}`
    return citizensApi.save(
      {
        ...draft,
        id,
        regNumber,
        registeredAt: dayjs().format(ISO_DATE),
        account: { ...draft.account, contractNumber: `ТКО-${id}`, contractDate: dayjs().format(ISO_DATE) },
      },
      'Создана карточка гражданина',
    )
  },

  async addAppeal(citizen: CitizenDetails, appeal: Omit<Appeal, 'id' | 'number' | 'citizenId'>) {
    const index = citizen.appeals.length + 1
    const created: Appeal = {
      ...appeal,
      id: `${citizen.id}-${index}-${Date.now()}`,
      number: `ОБР-${dayjs().format('YY')}-${String(Date.now()).slice(-6)}`,
      citizenId: citizen.id,
    }
    return citizensApi.save(
      { ...citizen, appeals: [created, ...citizen.appeals] },
      `Зарегистрировано обращение ${created.number}`,
    )
  },
}
