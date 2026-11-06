export type Gender = 'male' | 'female'

export type CitizenStatus = 'active' | 'moved' | 'archived' | 'deceased'

export type SocialCategory =
  | 'pensioner'
  | 'disabled'
  | 'largeFamily'
  | 'lowIncome'
  | 'veteran'
  | 'svo'
  | 'orphan'
  | 'student'

export type AppealStatus = 'new' | 'inProgress' | 'waiting' | 'resolved' | 'rejected'

export type AppealChannel = 'radar' | 'phone' | 'email' | 'portal' | 'office' | 'mail'

export type AppealTopic =
  | 'schedule'
  | 'container'
  | 'billing'
  | 'contract'
  | 'dump'
  | 'bulky'
  | 'separate'
  | 'other'

export type AppealPriority = 'low' | 'normal' | 'high'

export interface CitizenSummary {
  id: number
  regNumber: string
  lastName: string
  firstName: string
  middleName: string
  gender: Gender
  birthDate: string
  snils: string
  phone: string
  districtId: string
  locality: string
  status: CitizenStatus
  categories: SocialCategory[]
  accountNumber: string
  debt: number
  appealsTotal: number
  appealsOpen: number
  familySize: number
  registeredAt: string
  updatedAt: string
}

export interface Appeal {
  id: string
  number: string
  citizenId: number
  createdAt: string
  channel: AppealChannel
  topic: AppealTopic
  subject: string
  description: string
  status: AppealStatus
  priority: AppealPriority
  executor: string
  department: string
  dueDate: string
  closedAt: string | null
  rating: number | null
}

export interface Address {
  postalCode: string
  region: string
  district: string
  locality: string
  street: string
  house: string
  building: string
  apartment: string
}

export interface Passport {
  series: string
  number: string
  issuedBy: string
  issuedAt: string
  divisionCode: string
}

export interface ExtraDocument {
  id: string
  type: string
  number: string
  issuedBy: string
  issuedAt: string
  validUntil: string
}

export interface Phone {
  id: string
  kind: 'mobile' | 'home' | 'work'
  number: string
  primary: boolean
}

export interface FamilyMember {
  id: string
  relation: string
  fullName: string
  birthDate: string
  livesTogether: boolean
  dependent: boolean
}

export interface Education {
  id: string
  level: string
  institution: string
  speciality: string
  form: string
  graduationYear: number | null
}

export interface Job {
  id: string
  organization: string
  position: string
  from: string
  to: string
}

export interface Employment {
  status: string
  organization: string
  position: string
  since: string
  income: number | null
}

export interface SocialInfo {
  disabilityGroup: string
  disabilityUntil: string
  pensionType: string
  benefits: string[]
  certificateNumber: string
  lowIncomeUntil: string
  compensationPercent: number
}

export interface WasteAccount {
  contractNumber: string
  contractDate: string
  housingType: string
  ownership: string
  area: number
  rooms: number
  residentsRegistered: number
  residentsActual: number
  accrualMethod: string
  tariff: number
  paymentMethod: string
  receiptDelivery: string
  autopayment: boolean
  lastPaymentAt: string
  containerSite: string
  wasteSorting: boolean
}

export interface Payment {
  month: string
  accrued: number
  paid: number
}

export interface Property {
  id: string
  type: string
  cadastralNumber: string
  address: string
  share: string
  area: number
}

export interface Attachment {
  id: string
  name: string
  kind: string
  size: number
  uploadedAt: string
}

export interface HistoryEntry {
  id: string
  at: string
  author: string
  action: string
}

export interface CitizenDetails extends CitizenSummary {
  birthPlace: string
  citizenship: string
  maritalStatus: string
  inn: string
  passport: Passport
  documents: ExtraDocument[]
  registrationAddress: Address
  actualAddress: Address
  sameAddress: boolean
  phones: Phone[]
  email: string
  preferredChannel: string
  messengers: string[]
  consentPersonalData: boolean
  consentNotifications: boolean
  family: FamilyMember[]
  education: Education[]
  employment: Employment
  workHistory: Job[]
  social: SocialInfo
  account: WasteAccount
  payments: Payment[]
  appeals: Appeal[]
  property: Property[]
  attachments: Attachment[]
  history: HistoryEntry[]
  notes: string
}

export interface CitizenFilters {
  search: string
  districts: string[]
  statuses: CitizenStatus[]
  categories: SocialCategory[]
  gender: Gender | ''
  ageFrom: number
  ageTo: number
  withDebt: boolean
  withOpenAppeals: boolean
  registeredFrom: string
  registeredTo: string
}

export type SortableField =
  | 'regNumber'
  | 'fullName'
  | 'birthDate'
  | 'districtId'
  | 'status'
  | 'debt'
  | 'appealsTotal'
  | 'familySize'
  | 'registeredAt'
  | 'updatedAt'

export interface SortState {
  field: SortableField
  direction: 'asc' | 'desc'
}
