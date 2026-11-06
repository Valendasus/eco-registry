import { citizensApi } from '../../api/citizens'
import { CITIZEN_STATUSES, DISTRICT_LABELS, GENDERS, SOCIAL_CATEGORIES } from '../../entities/citizen/dictionaries'
import type { CitizenSummary } from '../../entities/citizen/types'
import { formatDate, fullName } from '../../lib/format'

const EXPORT_LIMIT = 20_000
const CHUNK = 2_000

const FIELDS: [string, (citizen: CitizenSummary) => string | number][] = [
  ['Номер карточки', (citizen) => citizen.regNumber],
  ['ФИО', fullName],
  ['Дата рождения', (citizen) => formatDate(citizen.birthDate)],
  ['Пол', (citizen) => GENDERS[citizen.gender]],
  ['СНИЛС', (citizen) => citizen.snils],
  ['Телефон', (citizen) => citizen.phone],
  ['Район', (citizen) => DISTRICT_LABELS[citizen.districtId]],
  ['Населённый пункт', (citizen) => citizen.locality],
  ['Статус', (citizen) => CITIZEN_STATUSES[citizen.status].label],
  ['Льготные категории', (citizen) => citizen.categories.map((category) => SOCIAL_CATEGORIES[category].label).join(', ')],
  ['Лицевой счёт', (citizen) => citizen.accountNumber],
  ['Задолженность, ₽', (citizen) => citizen.debt.toFixed(2).replace('.', ',')],
  ['Обращений', (citizen) => citizen.appealsTotal],
  ['Открытых обращений', (citizen) => citizen.appealsOpen],
  ['На учёте с', (citizen) => formatDate(citizen.registeredAt)],
]

const escape = (value: string | number) => {
  const text = String(value)
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

const nextFrame = () => new Promise((resolve) => setTimeout(resolve))

export async function exportCitizens(ids: Int32Array) {
  const lines = [FIELDS.map(([title]) => title).join(';')]
  const count = Math.min(ids.length, EXPORT_LIMIT)

  for (let start = 0; start < count; start += CHUNK) {
    for (let index = start; index < Math.min(start + CHUNK, count); index++) {
      const citizen = citizensApi.getSummary(ids[index])
      lines.push(FIELDS.map(([, read]) => escape(read(citizen))).join(';'))
    }
    await nextFrame()
  }

  const blob = new Blob(['﻿' + lines.join('\r\n')], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `citizens-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}
