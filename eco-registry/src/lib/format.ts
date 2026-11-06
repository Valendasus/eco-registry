import { dayjs, today } from './date'

const moneyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  maximumFractionDigits: 2,
})

const compactMoneyFormatter = new Intl.NumberFormat('ru-RU', {
  style: 'currency',
  currency: 'RUB',
  notation: 'compact',
  maximumFractionDigits: 1,
})

const numberFormatter = new Intl.NumberFormat('ru-RU')

export const formatMoney = (value: number) => moneyFormatter.format(value)

export const formatCompactMoney = (value: number) => compactMoneyFormatter.format(value)

export const formatNumber = (value: number) => numberFormatter.format(value)

export const formatDate = (value?: string | null) => (value ? dayjs(value).format('DD.MM.YYYY') : '—')

export const formatDateTime = (value?: string | null) =>
  value ? dayjs(value).format('DD.MM.YYYY, HH:mm') : '—'

export const formatRelative = (value: string) => {
  const days = today().diff(dayjs(value).startOf('day'), 'day')
  if (days === 0) return 'сегодня'
  if (days === 1) return 'вчера'
  if (days < 7) return `${days} ${plural(days, ['день', 'дня', 'дней'])} назад`
  return formatDate(value)
}

export const formatFileSize = (bytes: number) => {
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} КБ`
  return `${(bytes / 1024 / 1024).toFixed(1).replace('.', ',')} МБ`
}

export function plural(count: number, forms: [string, string, string]) {
  const mod100 = Math.abs(count) % 100
  const mod10 = mod100 % 10
  if (mod100 > 10 && mod100 < 20) return forms[2]
  if (mod10 === 1) return forms[0]
  if (mod10 >= 2 && mod10 <= 4) return forms[1]
  return forms[2]
}

export const getAge = (birthDate: string) => today().diff(dayjs(birthDate), 'year')

export const formatAge = (birthDate: string) => {
  const age = getAge(birthDate)
  return `${age} ${plural(age, ['год', 'года', 'лет'])}`
}

interface PersonName {
  lastName: string
  firstName: string
  middleName: string
}

export const fullName = ({ lastName, firstName, middleName }: PersonName) =>
  [lastName, firstName, middleName].filter(Boolean).join(' ')

export const shortName = ({ lastName, firstName, middleName }: PersonName) =>
  `${lastName} ${firstName.charAt(0)}.${middleName ? ` ${middleName.charAt(0)}.` : ''}`

export const initials = ({ lastName, firstName }: PersonName) =>
  `${lastName.charAt(0)}${firstName.charAt(0)}`.toUpperCase()

export const formatAddress = (address: {
  postalCode: string
  region: string
  district: string
  locality: string
  street: string
  house: string
  building: string
  apartment: string
}) =>
  [
    address.postalCode,
    address.region,
    address.district,
    address.locality,
    address.street,
    address.house && `д. ${address.house}`,
    address.building && `корп. ${address.building}`,
    address.apartment && `кв. ${address.apartment}`,
  ]
    .filter(Boolean)
    .join(', ')
