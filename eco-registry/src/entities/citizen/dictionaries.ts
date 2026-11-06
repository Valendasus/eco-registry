import type {
  AppealChannel,
  AppealPriority,
  AppealStatus,
  AppealTopic,
  CitizenStatus,
  Gender,
  SocialCategory,
} from './types'

export interface Option<T extends string = string> {
  value: T
  label: string
}

export type Tone = 'success' | 'warning' | 'error' | 'info' | 'default' | 'primary' | 'secondary'

export const REGION = 'Калужская область'

export const DISTRICTS = [
  { value: 'kaluga', label: 'г. Калуга', localities: ['Калуга'] },
  { value: 'obninsk', label: 'г. Обнинск', localities: ['Обнинск'] },
  { value: 'borovsk', label: 'Боровский район', localities: ['Боровск', 'Балабаново', 'Ермолино', 'Ворсино'] },
  { value: 'maloyaroslavets', label: 'Малоярославецкий район', localities: ['Малоярославец', 'Детчино', 'Головтеево'] },
  { value: 'zhukov', label: 'Жуковский район', localities: ['Жуков', 'Кременки', 'Белоусово', 'Тарутино'] },
  { value: 'kozelsk', label: 'Козельский район', localities: ['Козельск', 'Сосенский', 'Плюсково'] },
  { value: 'lyudinovo', label: 'Людиновский район', localities: ['Людиново', 'Заречный', 'Букань'] },
  { value: 'kirov', label: 'Кировский район', localities: ['Киров', 'Шайковка', 'Фоминичи'] },
  { value: 'sukhinichi', label: 'Сухиничский район', localities: ['Сухиничи', 'Середейский', 'Шлиппово'] },
  { value: 'medyn', label: 'Медынский район', localities: ['Медынь', 'Кременское', 'Михеево'] },
  { value: 'tarusa', label: 'Тарусский район', localities: ['Таруса', 'Барятино', 'Петрищево'] },
  { value: 'dzerzhinsky', label: 'Дзержинский район', localities: ['Кондрово', 'Полотняный Завод', 'Товарково', 'Пятовский'] },
] as const

export const DISTRICT_LABELS: Record<string, string> = Object.fromEntries(
  DISTRICTS.map((district) => [district.value, district.label]),
)

export const CITIZEN_STATUSES: Record<CitizenStatus, { label: string; tone: Tone }> = {
  active: { label: 'Активен', tone: 'success' },
  moved: { label: 'Выбыл', tone: 'warning' },
  archived: { label: 'В архиве', tone: 'default' },
  deceased: { label: 'Умер', tone: 'secondary' },
}

export const GENDERS: Record<Gender, string> = {
  male: 'Мужской',
  female: 'Женский',
}

export const SOCIAL_CATEGORIES: Record<SocialCategory, { label: string; short: string }> = {
  pensioner: { label: 'Пенсионер', short: 'Пенс.' },
  disabled: { label: 'Инвалидность', short: 'Инв.' },
  largeFamily: { label: 'Многодетная семья', short: 'Многодет.' },
  lowIncome: { label: 'Малоимущие', short: 'Малоим.' },
  veteran: { label: 'Ветеран труда', short: 'Ветеран' },
  svo: { label: 'Участник СВО и члены семьи', short: 'СВО' },
  orphan: { label: 'Дети-сироты', short: 'Сироты' },
  student: { label: 'Студент очной формы', short: 'Студ.' },
}

export const APPEAL_STATUSES: Record<AppealStatus, { label: string; tone: Tone }> = {
  new: { label: 'Новое', tone: 'info' },
  inProgress: { label: 'В работе', tone: 'primary' },
  waiting: { label: 'Ждёт ответа', tone: 'warning' },
  resolved: { label: 'Решено', tone: 'success' },
  rejected: { label: 'Отклонено', tone: 'default' },
}

export const OPEN_APPEAL_STATUSES: AppealStatus[] = ['new', 'inProgress', 'waiting']

export const APPEAL_CHANNELS: Record<AppealChannel, string> = {
  radar: 'РЭО Радар',
  phone: 'Горячая линия',
  email: 'Электронная почта',
  portal: 'Госуслуги',
  office: 'Личный приём',
  mail: 'Почта России',
}

export const APPEAL_TOPICS: Record<AppealTopic, string> = {
  schedule: 'Нарушение графика вывоза',
  container: 'Состояние контейнерной площадки',
  billing: 'Начисления и перерасчёт',
  contract: 'Заключение договора',
  dump: 'Несанкционированная свалка',
  bulky: 'Вывоз крупногабаритных отходов',
  separate: 'Раздельный сбор',
  other: 'Прочее',
}

export const APPEAL_PRIORITIES: Record<AppealPriority, { label: string; tone: Tone }> = {
  low: { label: 'Низкий', tone: 'default' },
  normal: { label: 'Обычный', tone: 'info' },
  high: { label: 'Высокий', tone: 'error' },
}

export const DEPARTMENTS = [
  'Отдел работы с обращениями',
  'Отдел расчётов с населением',
  'Служба контроля вывоза',
  'Договорной отдел',
  'Отдел экологического надзора',
]

export const EXECUTORS = [
  'Ковалёва Е. А.',
  'Тихонов Д. С.',
  'Мельникова О. В.',
  'Гусев А. Н.',
  'Зайцева М. П.',
  'Орлов И. Р.',
  'Белова Т. Ю.',
  'Савченко К. Л.',
]

export const MARITAL_STATUSES = [
  'Холост / не замужем',
  'Женат / замужем',
  'В разводе',
  'Вдовец / вдова',
  'Гражданский брак',
]

export const CITIZENSHIPS = ['Российская Федерация', 'Республика Беларусь', 'Республика Казахстан', 'Без гражданства']

export const DOCUMENT_TYPES = [
  'Свидетельство о рождении',
  'Водительское удостоверение',
  'Заграничный паспорт',
  'Военный билет',
  'Полис ОМС',
  'Удостоверение ветерана',
  'Справка МСЭ',
  'Удостоверение многодетной семьи',
  'Свидетельство о браке',
]

export const RELATIONS = ['Супруг(а)', 'Сын', 'Дочь', 'Отец', 'Мать', 'Брат', 'Сестра', 'Внук', 'Внучка', 'Опекаемый']

export const EDUCATION_LEVELS = [
  'Основное общее',
  'Среднее общее',
  'Среднее профессиональное',
  'Высшее — бакалавриат',
  'Высшее — специалитет',
  'Высшее — магистратура',
  'Аспирантура',
]

export const EDUCATION_FORMS = ['Очная', 'Очно-заочная', 'Заочная', 'Дистанционная']

export const INSTITUTIONS = [
  'КГУ им. К. Э. Циолковского',
  'ИАТЭ НИЯУ МИФИ',
  'Калужский филиал МГТУ им. Н. Э. Баумана',
  'Калужский филиал РАНХиГС',
  'Калужский колледж экономики и технологий',
  'Калужский технический колледж',
  'Обнинский колледж технологий и услуг',
  'Калужский базовый медицинский колледж',
  'Людиновский индустриальный техникум',
  'Козельский политехнический техникум',
]

export const SPECIALITIES = [
  'Экономика',
  'Юриспруденция',
  'Педагогическое образование',
  'Информатика и вычислительная техника',
  'Ядерная энергетика',
  'Машиностроение',
  'Сестринское дело',
  'Бухгалтерский учёт',
  'Строительство',
  'Техносферная безопасность',
  'Менеджмент',
  'Электроснабжение',
]

export const EMPLOYMENT_STATUSES = [
  'Работает по найму',
  'Индивидуальный предприниматель',
  'Самозанятый',
  'Пенсионер',
  'Учащийся',
  'Безработный',
  'В декретном отпуске',
]

export const ORGANIZATIONS = [
  'АО «Калужский турбинный завод»',
  'ООО «Фольксваген Груп Рус»',
  'ГБУЗ КО «Калужская областная больница»',
  'МБОУ «СОШ № 12» г. Калуги',
  'АО «ГНЦ РФ — ФЭИ»',
  'ПАО «Россети Центр и Приволжье»',
  'ООО «Л’Ореаль»',
  'ГКУ КО «ЦЗН Калужской области»',
  'АО «Тайфун»',
  'ООО «Агрохолдинг Калужский»',
  'ИП Самойлов В. Г.',
  'АО «Калужский электромеханический завод»',
]

export const POSITIONS = [
  'Инженер',
  'Ведущий специалист',
  'Бухгалтер',
  'Учитель',
  'Оператор станков с ЧПУ',
  'Медицинская сестра',
  'Водитель',
  'Менеджер по продажам',
  'Начальник отдела',
  'Программист',
  'Кладовщик',
  'Электромонтёр',
]

export const DISABILITY_GROUPS = ['', 'I группа', 'II группа', 'III группа', 'Ребёнок-инвалид']

export const PENSION_TYPES = ['', 'По старости', 'По инвалидности', 'По потере кормильца', 'За выслугу лет', 'Социальная']

export const BENEFITS = [
  'Компенсация за вывоз ТКО',
  'ЕДВ',
  'Субсидия на оплату ЖКУ',
  'Ежемесячная денежная выплата',
  'Компенсация расходов на капремонт',
  'Бесплатный проезд',
  'Единое пособие на детей',
]

export const HOUSING_TYPES = ['Многоквартирный дом', 'Индивидуальный жилой дом', 'Садовый дом', 'Общежитие']

export const OWNERSHIP_TYPES = ['Собственник', 'Долевая собственность', 'Социальный наём', 'Аренда']

export const ACCRUAL_METHODS = ['По количеству проживающих', 'По площади помещения', 'По фактическому объёму']

export const PAYMENT_METHODS = ['Сбербанк Онлайн', 'Почта России', 'Касса регоператора', 'Госуслуги', 'СБП по QR-коду']

export const RECEIPT_DELIVERY = ['Бумажная квитанция', 'Электронная почта', 'Личный кабинет', 'Госуслуги']

export const PREFERRED_CHANNELS = ['Телефон', 'SMS', 'Электронная почта', 'Госуслуги', 'Почта России']

export const MESSENGERS = ['Telegram', 'MAX', 'WhatsApp', 'VK Мессенджер']

export const PROPERTY_TYPES = ['Квартира', 'Жилой дом', 'Земельный участок', 'Садовый дом', 'Гараж', 'Нежилое помещение']

export const PHONE_KINDS: Record<'mobile' | 'home' | 'work', string> = {
  mobile: 'Мобильный',
  home: 'Домашний',
  work: 'Рабочий',
}

export const toOptions = (values: readonly string[]): Option[] =>
  values.filter(Boolean).map((value) => ({ value, label: value }))

export const recordToOptions = <T extends string>(record: Record<T, string | { label: string }>): Option<T>[] =>
  (Object.keys(record) as T[]).map((value) => {
    const entry = record[value]
    return { value, label: typeof entry === 'string' ? entry : entry.label }
  })
