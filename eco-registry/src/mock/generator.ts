import type {
  Address,
  Appeal,
  AppealChannel,
  AppealStatus,
  AppealTopic,
  CitizenDetails,
  CitizenStatus,
  CitizenSummary,
  FamilyMember,
  Gender,
  SocialCategory,
} from '../entities/citizen/types'
import {
  ACCRUAL_METHODS,
  BENEFITS,
  CITIZENSHIPS,
  DEPARTMENTS,
  DISABILITY_GROUPS,
  DISTRICTS,
  DOCUMENT_TYPES,
  EDUCATION_FORMS,
  EDUCATION_LEVELS,
  EXECUTORS,
  HOUSING_TYPES,
  INSTITUTIONS,
  MARITAL_STATUSES,
  MESSENGERS,
  ORGANIZATIONS,
  OWNERSHIP_TYPES,
  PAYMENT_METHODS,
  POSITIONS,
  PREFERRED_CHANNELS,
  RECEIPT_DELIVERY,
  REGION,
  SPECIALITIES,
} from '../entities/citizen/dictionaries'
import { dayjs, ISO_DATE, today } from '../lib/date'
import { applyMask, MASKS } from '../lib/masks'
import { createRandom, hashSeed, type Random, type Weighted } from '../lib/random'
import { snilsChecksum } from '../lib/validators'
import { FEMALE_NAMES, feminineSurname, MALE_NAMES, PATRONYMICS, STREETS, SURNAMES, surnameFor } from './names'

export const CITIZENS_TOTAL = 100_000

const NOW = today()
const CLOCK = dayjs().subtract(3, 'minute')
const REFORM_START = dayjs('2019-01-01')
const TARIFF = 138.62

const DISTRICT_WEIGHTS: Weighted<(typeof DISTRICTS)[number]> = DISTRICTS.map((district) => [
  district,
  district.value === 'kaluga' ? 34 : district.value === 'obninsk' ? 12 : 5,
])

const AGE_BUCKETS: Weighted<[number, number]> = [
  [[18, 24], 8],
  [[25, 34], 17],
  [[35, 44], 18],
  [[45, 54], 16],
  [[55, 64], 17],
  [[65, 74], 15],
  [[75, 92], 9],
]

const TOPIC_WEIGHTS: Weighted<AppealTopic> = [
  ['schedule', 28],
  ['billing', 24],
  ['container', 15],
  ['contract', 9],
  ['dump', 9],
  ['bulky', 8],
  ['separate', 4],
  ['other', 3],
]

const CHANNEL_WEIGHTS: Weighted<AppealChannel> = [
  ['radar', 34],
  ['phone', 26],
  ['portal', 18],
  ['email', 11],
  ['office', 7],
  ['mail', 4],
]

const SUBJECTS: Record<AppealTopic, string[]> = {
  schedule: [
    'Мусор не вывозится больше трёх дней',
    'Вывоз производится в ночное время',
    'Мусоровоз пропускает наш двор',
    'Нарушен график вывоза в частном секторе',
  ],
  container: [
    'Переполнены контейнеры у дома',
    'Сломан контейнер, требуется замена',
    'Площадка не убирается после вывоза',
    'Просьба установить дополнительный контейнер',
  ],
  billing: [
    'Начисление за умершего собственника',
    'Перерасчёт за период временного отсутствия',
    'Неверное количество проживающих в квитанции',
    'Двойное начисление за один месяц',
    'Не учтена оплата за прошлый период',
  ],
  contract: [
    'Запрос на заключение договора',
    'Переоформление лицевого счёта на нового собственника',
    'Расторжение договора в связи с продажей',
  ],
  dump: [
    'Стихийная свалка у лесополосы',
    'Строительный мусор у гаражей',
    'Свалка на берегу реки',
  ],
  bulky: [
    'Не вывезена старая мебель',
    'Заявка на вывоз КГО из частного дома',
    'Бункер для КГО переполнен',
  ],
  separate: [
    'Установить контейнеры для раздельного сбора',
    'Пластик из жёлтого контейнера вывозят вместе с ТКО',
  ],
  other: ['Благодарность водителю мусоровоза', 'Вопрос о работе горячей линии', 'Предложение по графику вывоза'],
}

const DESCRIPTIONS: Record<AppealTopic, string> = {
  schedule: 'Прошу принять меры и обеспечить вывоз отходов согласно утверждённому графику. Фотографии прилагаю.',
  container: 'Состояние контейнерной площадки не соответствует санитарным нормам. Прошу направить бригаду.',
  billing: 'Прошу провести проверку начислений и выполнить перерасчёт. Подтверждающие документы приложены.',
  contract: 'Прошу подготовить договор на оказание услуг по обращению с ТКО и направить для подписания.',
  dump: 'Обнаружено место несанкционированного размещения отходов. Координаты и фото во вложении.',
  bulky: 'Заявка на вывоз крупногабаритных отходов. Прошу сообщить дату и время вывоза.',
  separate: 'Прошу рассмотреть возможность организации раздельного накопления отходов в нашем дворе.',
  other: 'Прошу рассмотреть обращение и дать ответ в установленный срок.',
}

const pad = (value: number, length: number) => String(value).padStart(length, '0')

const isoBetween = (random: Random, from: dayjs.Dayjs, to: dayjs.Dayjs) => {
  const days = Math.max(0, to.diff(from, 'day'))
  return from.add(random.int(0, days), 'day').format(ISO_DATE)
}

function makeSnils(random: Random) {
  const base = String(random.int(100_000_000, 999_999_999))
  return applyMask(base + pad(snilsChecksum(base), 2), MASKS.snils)
}

const makePhone = (random: Random, mobile = true) =>
  applyMask(`7${mobile ? '9' + random.digits(9) : '4842' + random.digits(6)}`, MASKS.phone)

function makePerson(random: Random, gender: Gender) {
  const surname = random.pick(SURNAMES)
  const patronymic = random.pick(PATRONYMICS)
  return gender === 'male'
    ? { lastName: surname, firstName: random.pick(MALE_NAMES), middleName: patronymic[0] }
    : { lastName: feminineSurname(surname), firstName: random.pick(FEMALE_NAMES), middleName: patronymic[1] }
}

function makeCategories(random: Random, gender: Gender, age: number, familySize: number): SocialCategory[] {
  const result: SocialCategory[] = []
  if (age >= (gender === 'male' ? 65 : 60) || (age >= 58 && random.chance(0.4))) result.push('pensioner')
  if (random.chance(age > 55 ? 0.12 : 0.04)) result.push('disabled')
  if (familySize >= 5 && age < 55) result.push('largeFamily')
  if (random.chance(0.07)) result.push('lowIncome')
  if (age > 58 && random.chance(0.22)) result.push('veteran')
  if (age > 20 && age < 60 && random.chance(0.025)) result.push('svo')
  if (age < 23 && random.chance(0.05)) result.push('orphan')
  if (age < 24 && random.chance(0.55)) result.push('student')
  return result
}

function makeAppeals(random: Random, citizenId: number, count: number, registeredAt: string): Appeal[] {
  const from = dayjs(registeredAt)
  const appeals: Appeal[] = []

  for (let index = 0; index < count; index++) {
    const lastYear = random.chance(0.55)
    const created = lastYear
      ? dayjs.max(from, NOW.subtract(random.int(0, 364), 'day'))
      : from.add(random.int(0, Math.max(1, NOW.diff(from, 'day'))), 'day')
    const scheduled = created.add(random.int(8 * 60, 20 * 60), 'minute')
    const createdAt = scheduled.isAfter(CLOCK) ? CLOCK.subtract(random.int(2, 9 * 60), 'minute') : scheduled
    const topic = random.weighted(TOPIC_WEIGHTS)
    const age = NOW.diff(created, 'day')
    const dueDate = created.add(topic === 'billing' || topic === 'contract' ? 30 : 10, 'day')

    let status: AppealStatus
    if (age < 3) status = random.weighted([['new', 6], ['inProgress', 3], ['resolved', 1]])
    else if (age < 10) status = random.weighted([['inProgress', 5], ['waiting', 2], ['resolved', 4], ['new', 1]])
    else if (age < 30) status = random.weighted([['inProgress', 2], ['waiting', 1], ['resolved', 12], ['rejected', 1]])
    else status = random.weighted([['resolved', 920], ['rejected', 70], ['inProgress', 6], ['waiting', 4]])

    const closed = status === 'resolved' || status === 'rejected'
    const closedAt = closed
      ? dayjs.min(NOW, created.add(random.weighted([[random.int(1, 9), 85], [random.int(10, 30), 15]]), 'day'))
      : null

    appeals.push({
      id: `${citizenId}-${index + 1}`,
      number: `ОБР-${created.format('YY')}-${pad((citizenId * 7 + index * 131) % 1_000_000, 6)}`,
      citizenId,
      createdAt: createdAt.format('YYYY-MM-DDTHH:mm'),
      channel: random.weighted(CHANNEL_WEIGHTS),
      topic,
      subject: random.pick(SUBJECTS[topic]),
      description: DESCRIPTIONS[topic],
      status,
      priority: random.weighted([['normal', 7], ['high', 2], ['low', 1]]),
      executor: random.pick(EXECUTORS),
      department: random.pick(DEPARTMENTS),
      dueDate: dueDate.format(ISO_DATE),
      closedAt: closedAt ? closedAt.format(ISO_DATE) : null,
      rating: status === 'resolved' && random.chance(0.6) ? random.weighted([[5, 5], [4, 3], [3, 1], [2, 1], [1, 1]]) : null,
    })
  }

  return appeals.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export interface GeneratedCitizen {
  summary: CitizenSummary
  appeals: Appeal[]
}

export function generateCitizen(id: number): GeneratedCitizen {
  const random = createRandom(hashSeed(id))
  const gender: Gender = random.chance(0.46) ? 'male' : 'female'
  const [ageFrom, ageTo] = random.weighted(AGE_BUCKETS)
  const age = random.int(ageFrom, ageTo)
  const birthDate = NOW.subtract(age, 'year').subtract(random.int(0, 364), 'day').format(ISO_DATE)
  const district = random.weighted(DISTRICT_WEIGHTS)
  const familySize = random.weighted<number>([[1, 22], [2, 30], [3, 24], [4, 15], [5, 6], [6, 3]])
  const registeredAt = isoBetween(random, dayjs.max(REFORM_START, NOW.subtract(age - 18, 'year')), NOW.subtract(20, 'day'))
  const status: CitizenStatus = random.weighted([
    ['active', 88],
    ['moved', 5],
    ['archived', 4],
    ['deceased', age > 70 ? 6 : 1],
  ])
  const appealsTotal = random.weighted<number>([[0, 44], [1, 29], [2, 13], [3, 7], [4, 4], [random.int(5, 9), 3]])
  const appeals = makeAppeals(random, id, appealsTotal, registeredAt)

  const summary: CitizenSummary = {
    id,
    regNumber: `КЛ-${pad(id, 6)}`,
    ...makePerson(random, gender),
    gender,
    birthDate,
    snils: makeSnils(random),
    phone: makePhone(random),
    districtId: district.value,
    locality: random.pick(district.localities),
    status,
    categories: makeCategories(random, gender, age, familySize),
    accountNumber: `40${pad(DISTRICTS.indexOf(district) + 1, 2)}${random.digits(8)}`,
    debt: random.chance(0.16 + (DISTRICTS.indexOf(district) % 5) * 0.035) ? Math.round(random.int(140, 18_000) * 100 + random.int(0, 99)) / 100 : 0,
    appealsTotal,
    appealsOpen: appeals.filter((appeal) => !appeal.closedAt).length,
    familySize,
    registeredAt,
    updatedAt: isoBetween(random, dayjs(registeredAt), NOW),
  }

  return { summary, appeals }
}

function makeAddress(random: Random, summary: CitizenSummary, privateHouse: boolean): Address {
  const district = DISTRICTS.find((item) => item.value === summary.districtId)
  return {
    postalCode: `2${random.int(48, 49)}${random.digits(3)}`,
    region: REGION,
    district: district && !district.label.startsWith('г.') ? district.label : '',
    locality: summary.locality,
    street: random.pick(STREETS),
    house: String(random.int(1, privateHouse ? 140 : 72)),
    building: !privateHouse && random.chance(0.15) ? String(random.int(1, 4)) : '',
    apartment: privateHouse ? '' : String(random.int(1, 180)),
  }
}

function makeFamily(random: Random, summary: CitizenSummary, age: number): FamilyMember[] {
  const members: FamilyMember[] = []
  const add = (relation: string, gender: Gender, memberAge: number, livesTogether = true) => {
    const person = makePerson(random, gender)
    if (relation !== 'Мать' || random.chance(0.8)) person.lastName = surnameFor(summary.lastName, gender)
    members.push({
      id: `f${members.length + 1}`,
      relation,
      fullName: `${person.lastName} ${person.firstName} ${person.middleName}`,
      birthDate: NOW.subtract(Math.max(0, memberAge), 'year').subtract(random.int(0, 364), 'day').format(ISO_DATE),
      livesTogether,
      dependent: memberAge < 18,
    })
  }

  const slots = summary.familySize - 1
  if (slots > 0 && age > 22) add('Супруг(а)', summary.gender === 'male' ? 'female' : 'male', age + random.int(-5, 5))
  while (members.length < slots) {
    if (age > 60 && random.chance(0.4)) {
      const gender: Gender = random.chance(0.5) ? 'male' : 'female'
      add(gender === 'male' ? 'Внук' : 'Внучка', gender, random.int(1, 17))
    } else if (age > 20) {
      const gender: Gender = random.chance(0.5) ? 'male' : 'female'
      add(gender === 'male' ? 'Сын' : 'Дочь', gender, random.int(0, Math.min(age - 20, 30)))
    } else {
      add(random.pick(['Мать', 'Отец']), random.chance(0.5) ? 'female' : 'male', age + random.int(20, 30))
    }
  }
  if (age < 60 && random.chance(0.25)) add('Мать', 'female', age + random.int(22, 32), false)
  return members
}

export function generateDetails({ summary, appeals }: GeneratedCitizen): CitizenDetails {
  const random = createRandom(hashSeed(summary.id, 7919))
  const age = NOW.diff(dayjs(summary.birthDate), 'year')
  const privateHouse = summary.districtId !== 'kaluga' && summary.districtId !== 'obninsk' ? random.chance(0.55) : random.chance(0.08)
  const registrationAddress = makeAddress(random, summary, privateHouse)
  const sameAddress = random.chance(0.82)
  const passportIssued = dayjs(summary.birthDate).add(age >= 45 ? 45 : age >= 20 ? 20 : 14, 'year').add(random.int(5, 60), 'day')
  const isPensioner = summary.categories.includes('pensioner')
  const isStudent = summary.categories.includes('student')
  const hasHigher = random.chance(0.45)
  const employmentStatus = isPensioner
    ? random.weighted([['Пенсионер', 8], ['Работает по найму', 2]])
    : isStudent
      ? 'Учащийся'
      : random.weighted<string>([
          ['Работает по найму', 70],
          ['Индивидуальный предприниматель', 6],
          ['Самозанятый', 8],
          ['Безработный', 5],
          ['В декретном отпуске', summary.gender === 'female' && age < 40 ? 8 : 0],
        ])
  const working = employmentStatus !== 'Пенсионер' && employmentStatus !== 'Безработный' && employmentStatus !== 'Учащийся'
  const area = privateHouse ? random.int(48, 180) : random.int(28, 96)
  const residents = Math.max(1, summary.familySize - random.int(0, 1))
  const monthly = Math.round(residents * TARIFF * 100) / 100

  const payments = Array.from({ length: 12 }, (_, index) => {
    const month = NOW.subtract(index + 1, 'month').startOf('month')
    const unpaid = summary.debt > 0 && index < Math.ceil(summary.debt / monthly)
    return {
      month: month.format(ISO_DATE),
      accrued: monthly,
      paid: unpaid ? (random.chance(0.3) ? Math.round(monthly * 0.5 * 100) / 100 : 0) : monthly,
    }
  })

  const education = [
    {
      id: 'e1',
      level: age < 18 ? 'Основное общее' : 'Среднее общее',
      institution: `МБОУ «СОШ № ${random.int(1, 46)}»`,
      speciality: '',
      form: 'Очная',
      graduationYear: dayjs(summary.birthDate).year() + 17,
    },
  ]
  if (age > 21) {
    education.push({
      id: 'e2',
      level: hasHigher ? random.pick(EDUCATION_LEVELS.slice(3, 5)) : 'Среднее профессиональное',
      institution: random.pick(hasHigher ? INSTITUTIONS.slice(0, 4) : INSTITUTIONS.slice(4)),
      speciality: random.pick(SPECIALITIES),
      form: random.weighted([[EDUCATION_FORMS[0], 7], [EDUCATION_FORMS[2], 3]]),
      graduationYear: dayjs(summary.birthDate).year() + (hasHigher ? 22 : 20),
    })
  }
  if (hasHigher && age > 26 && random.chance(0.2)) {
    education.push({
      id: 'e3',
      level: 'Высшее — магистратура',
      institution: random.pick(INSTITUTIONS.slice(0, 4)),
      speciality: random.pick(SPECIALITIES),
      form: random.pick(EDUCATION_FORMS),
      graduationYear: dayjs(summary.birthDate).year() + 24,
    })
  }

  const jobsCount = age > 24 ? random.int(1, Math.min(4, Math.floor((age - 18) / 8) + 1)) : 0
  const workHistory = Array.from({ length: jobsCount }, (_, index) => {
    const fromYear = dayjs(summary.birthDate).year() + 20 + index * random.int(4, 9)
    const toYear = index === jobsCount - 1 && working ? null : fromYear + random.int(2, 8)
    return {
      id: `w${index + 1}`,
      organization: random.pick(ORGANIZATIONS),
      position: random.pick(POSITIONS),
      from: `${Math.min(fromYear, NOW.year())}-0${random.int(1, 9)}-01`,
      to: toYear ? `${Math.min(toYear, NOW.year())}-0${random.int(1, 9)}-01` : '',
    }
  })
  const currentJob = working ? workHistory[workHistory.length - 1] : undefined

  const documents = random
    .sample(DOCUMENT_TYPES.filter((type) => age >= 18 || type === 'Свидетельство о рождении'), random.int(1, 3))
    .map((type, index) => ({
      id: `d${index + 1}`,
      type,
      number: `${random.digits(2)} ${random.digits(2)} ${random.digits(6)}`,
      issuedBy: random.pick(['ГУ МВД России по Калужской обл.', 'Отдел ЗАГС г. Калуги', 'ТФОМС Калужской обл.', 'Военный комиссариат']),
      issuedAt: isoBetween(random, dayjs(summary.birthDate).add(18, 'year'), NOW),
      validUntil: type === 'Водительское удостоверение' || type === 'Заграничный паспорт' ? NOW.add(random.int(30, 3000), 'day').format(ISO_DATE) : '',
    }))

  const history = [
    { id: 'h1', at: `${summary.registeredAt}T10:24`, author: 'Интеграция ГИС ЖКХ', action: 'Создана карточка гражданина' },
    { id: 'h2', at: `${summary.registeredAt}T10:25`, author: 'Интеграция ГИС ЖКХ', action: 'Открыт лицевой счёт ТКО' },
    ...appeals.slice(0, 4).map((appeal, index) => ({
      id: `h${index + 3}`,
      at: appeal.createdAt,
      author: appeal.channel === 'radar' ? 'РЭО Радар' : appeal.executor,
      action: `Зарегистрировано обращение ${appeal.number}`,
    })),
    { id: 'h9', at: `${summary.updatedAt}T15:02`, author: random.pick(EXECUTORS), action: 'Обновлены контактные данные' },
  ].sort((a, b) => b.at.localeCompare(a.at))

  return {
    ...summary,
    birthPlace: random.chance(0.7) ? `${DISTRICTS.some((district) => district.localities[0] === summary.locality) ? 'г.' : 'пос.'} ${summary.locality}` : random.pick(['г. Москва', 'г. Тула', 'г. Брянск', 'г. Смоленск', 'г. Орёл']),
    citizenship: random.weighted([[CITIZENSHIPS[0], 97], [CITIZENSHIPS[1], 1], [CITIZENSHIPS[2], 1]]),
    maritalStatus: summary.familySize > 1 && age > 22 ? MARITAL_STATUSES[1] : random.pick(MARITAL_STATUSES),
    inn: random.chance(0.85) ? makeInn(random) : '',
    passport: {
      series: applyMask(`29${random.digits(2)}`, MASKS.passportSeries),
      number: random.digits(6),
      issuedBy: `УМВД России по ${random.pick(['Калужской области', 'г. Калуге', 'г. Обнинску'])}`,
      issuedAt: passportIssued.format(ISO_DATE),
      divisionCode: `400-0${random.digits(2)}`,
    },
    documents,
    registrationAddress,
    actualAddress: sameAddress ? registrationAddress : makeAddress(random, summary, random.chance(0.3)),
    sameAddress,
    phones: [
      { id: 'p1', kind: 'mobile', number: summary.phone, primary: true },
      ...(random.chance(0.35) ? [{ id: 'p2', kind: 'home' as const, number: makePhone(random, false), primary: false }] : []),
      ...(working && random.chance(0.2) ? [{ id: 'p3', kind: 'work' as const, number: makePhone(random, false), primary: false }] : []),
    ],
    email: random.chance(age < 60 ? 0.75 : 0.25) ? `${translit(summary.lastName)}.${random.int(10, 99)}@${random.pick(['mail.ru', 'yandex.ru', 'gmail.com', 'bk.ru'])}` : '',
    preferredChannel: random.pick(PREFERRED_CHANNELS),
    messengers: random.sample(MESSENGERS, age < 65 ? random.int(0, 2) : 0),
    consentPersonalData: true,
    consentNotifications: random.chance(0.7),
    family: makeFamily(random, summary, age),
    education,
    employment: {
      status: employmentStatus,
      organization: currentJob?.organization ?? '',
      position: currentJob?.position ?? '',
      since: currentJob?.from ?? '',
      income: working ? random.int(28, 140) * 1000 : null,
    },
    workHistory,
    social: {
      disabilityGroup: summary.categories.includes('disabled') ? random.pick(DISABILITY_GROUPS.slice(1, 4)) : '',
      disabilityUntil: summary.categories.includes('disabled') && random.chance(0.5) ? NOW.add(random.int(60, 700), 'day').format(ISO_DATE) : '',
      pensionType: isPensioner ? 'По старости' : summary.categories.includes('disabled') ? 'По инвалидности' : '',
      benefits: summary.categories.length ? random.sample(BENEFITS, random.int(1, 3)) : [],
      certificateNumber: summary.categories.includes('largeFamily') || summary.categories.includes('veteran') ? `${random.pick(['МС', 'ВТ', 'АА'])} № ${random.digits(6)}` : '',
      lowIncomeUntil: summary.categories.includes('lowIncome') ? NOW.add(random.int(30, 360), 'day').format(ISO_DATE) : '',
      compensationPercent: summary.categories.length ? random.pick([0, 30, 50, 50, 100]) : 0,
    },
    account: {
      contractNumber: `ТКО-${summary.accountNumber.slice(2, 4)}/${pad(summary.id, 6)}`,
      contractDate: summary.registeredAt,
      housingType: privateHouse ? HOUSING_TYPES[1] : random.weighted([[HOUSING_TYPES[0], 19], [HOUSING_TYPES[3], 1]]),
      ownership: random.weighted([[OWNERSHIP_TYPES[0], 6], [OWNERSHIP_TYPES[1], 2], [OWNERSHIP_TYPES[2], 1], [OWNERSHIP_TYPES[3], 1]]),
      area,
      rooms: Math.max(1, Math.min(6, Math.round(area / 22))),
      residentsRegistered: residents,
      residentsActual: Math.max(1, residents + random.weighted([[0, 8], [-1, 1], [1, 1]])),
      accrualMethod: random.weighted([[ACCRUAL_METHODS[0], 8], [ACCRUAL_METHODS[1], 2]]),
      tariff: TARIFF,
      paymentMethod: random.pick(PAYMENT_METHODS),
      receiptDelivery: random.pick(RECEIPT_DELIVERY),
      autopayment: random.chance(0.18),
      lastPaymentAt: payments.find((payment) => payment.paid > 0)?.month.replace(/-01$/, `-${pad(random.int(5, 25), 2)}`) ?? '',
      containerSite: `КП-${summary.accountNumber.slice(2, 4)}-${random.digits(4)}`,
      wasteSorting: random.chance(0.22),
    },
    payments,
    appeals,
    property: Array.from({ length: random.weighted([[1, 6], [2, 3], [3, 1]]) }, (_, index) => {
      const type = index === 0 ? (privateHouse ? 'Жилой дом' : 'Квартира') : random.pick(['Земельный участок', 'Гараж', 'Садовый дом'])
      return {
        id: `r${index + 1}`,
        type,
        cadastralNumber: `40:${pad(random.int(1, 27), 2)}:${random.digits(7)}:${random.int(10, 9999)}`,
        address: index === 0 ? '' : `${summary.locality}, ${random.pick(['СНТ «Ромашка»', 'ГСК «Мотор»', 'СНТ «Лесное»', 'ДНП «Ока»'])}, уч. ${random.int(1, 200)}`,
        share: random.weighted([['1', 7], ['1/2', 2], ['1/3', 1]]),
        area: type === 'Земельный участок' ? random.int(400, 1500) : type === 'Гараж' ? random.int(18, 30) : index === 0 ? area : random.int(20, 70),
      }
    }),
    attachments: random.sample(
      [
        { name: 'Скан паспорта.pdf', kind: 'Документ' },
        { name: 'Договор ТКО.pdf', kind: 'Договор' },
        { name: 'Справка о составе семьи.pdf', kind: 'Справка' },
        { name: 'Заявление на перерасчёт.docx', kind: 'Заявление' },
        { name: 'Фото площадки.jpg', kind: 'Фото' },
        { name: 'Выписка ЕГРН.pdf', kind: 'Выписка' },
      ],
      random.int(1, 4),
    ).map((file, index) => ({
      id: `a${index + 1}`,
      ...file,
      size: random.int(80, 4200) * 1024,
      uploadedAt: isoBetween(random, dayjs(summary.registeredAt), NOW),
    })),
    history,
    notes: random.chance(0.15) ? 'Просит связываться только после 18:00. Предпочитает письменные ответы.' : '',
  }
}

function makeInn(random: Random) {
  const digits = `40${random.digits(8)}`.split('').map(Number)
  const check = (weights: number[]) => (weights.reduce((sum, weight, index) => sum + weight * digits[index], 0) % 11) % 10
  digits.push(check([7, 2, 4, 10, 3, 5, 9, 4, 6, 8]))
  digits.push(check([3, 7, 2, 4, 10, 3, 5, 9, 4, 6, 8]))
  return digits.join('')
}

const TRANSLIT: Record<string, string> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'e', ж: 'zh', з: 'z', и: 'i', й: 'y', к: 'k', л: 'l', м: 'm',
  н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't', у: 'u', ф: 'f', х: 'kh', ц: 'ts', ч: 'ch', ш: 'sh', щ: 'sch',
  ъ: '', ы: 'y', ь: '', э: 'e', ю: 'yu', я: 'ya',
}

const translit = (value: string) =>
  value
    .toLowerCase()
    .split('')
    .map((char) => TRANSLIT[char] ?? char)
    .join('')
