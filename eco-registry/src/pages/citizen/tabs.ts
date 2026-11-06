import type { CitizenDetails } from '../../entities/citizen/types'

export const CITIZEN_TABS = [
  { id: 'main', label: 'Основное' },
  { id: 'documents', label: 'Документы' },
  { id: 'address', label: 'Адреса' },
  { id: 'contacts', label: 'Контакты' },
  { id: 'family', label: 'Семья' },
  { id: 'education', label: 'Образование и работа' },
  { id: 'social', label: 'Соцподдержка' },
  { id: 'account', label: 'Лицевой счёт ТКО' },
  { id: 'appeals', label: 'Обращения' },
  { id: 'history', label: 'История' },
] as const

export type CitizenTab = (typeof CITIZEN_TABS)[number]['id']

const FIELD_TABS: Partial<Record<keyof CitizenDetails, CitizenTab>> = {
  lastName: 'main',
  firstName: 'main',
  middleName: 'main',
  birthDate: 'main',
  gender: 'main',
  status: 'main',
  districtId: 'main',
  locality: 'main',
  passport: 'documents',
  snils: 'documents',
  inn: 'documents',
  documents: 'documents',
  registrationAddress: 'address',
  actualAddress: 'address',
  phones: 'contacts',
  email: 'contacts',
  family: 'family',
  education: 'education',
  employment: 'education',
  workHistory: 'education',
  social: 'social',
  account: 'account',
  property: 'account',
}

export const tabsWithErrors = (errors: object) =>
  new Set(Object.keys(errors).map((key) => FIELD_TABS[key as keyof CitizenDetails]).filter(Boolean) as CitizenTab[])
