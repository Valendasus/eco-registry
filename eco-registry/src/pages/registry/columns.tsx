import { Badge, Box, Stack, Tooltip, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { CitizenAvatar } from '../../components/ui/CitizenAvatar'
import { CitizenStatusChip } from '../../components/ui/StatusChips'
import type { CitizenSummary, SortableField } from '../../entities/citizen/types'
import { DISTRICT_LABELS, GENDERS, SOCIAL_CATEGORIES } from '../../entities/citizen/dictionaries'
import { formatAge, formatDate, formatMoney, fullName } from '../../lib/format'

export interface Column {
  id: string
  label: string
  width: number
  group: 'Основное' | 'Контакты' | 'Учёт' | 'Обращения'
  sortField?: SortableField
  align?: 'left' | 'right' | 'center'
  hideable?: boolean
  render: (citizen: CitizenSummary) => ReactNode
}

const muted = (value: ReactNode) => (
  <Typography variant="body2" noWrap sx={{ color: 'text.secondary' }}>
    {value}
  </Typography>
)

const text = (value: ReactNode) => (
  <Typography variant="body2" noWrap>
    {value}
  </Typography>
)

export const COLUMNS: Column[] = [
  {
    id: 'name',
    label: 'Гражданин',
    width: 300,
    group: 'Основное',
    sortField: 'fullName',
    hideable: false,
    render: (citizen) => (
      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25, minWidth: 0 }}>
        <CitizenAvatar citizen={citizen} size={32} />
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
            {fullName(citizen)}
          </Typography>
          <Typography variant="caption" noWrap component="div" sx={{ color: 'text.secondary' }}>
            {citizen.regNumber}
          </Typography>
        </Box>
      </Stack>
    ),
  },
  {
    id: 'birthDate',
    label: 'Дата рождения',
    width: 140,
    group: 'Основное',
    sortField: 'birthDate',
    render: (citizen) => (
      <div>
        {text(formatDate(citizen.birthDate))}
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {formatAge(citizen.birthDate)}
        </Typography>
      </div>
    ),
  },
  { id: 'gender', label: 'Пол', width: 100, group: 'Основное', render: (citizen) => muted(GENDERS[citizen.gender]) },
  { id: 'snils', label: 'СНИЛС', width: 140, group: 'Основное', render: (citizen) => text(citizen.snils) },
  {
    id: 'district',
    label: 'Район',
    width: 200,
    group: 'Учёт',
    sortField: 'districtId',
    render: (citizen) => (
      <div>
        {text(DISTRICT_LABELS[citizen.districtId])}
        <Typography variant="caption" noWrap component="div" sx={{ color: 'text.secondary' }}>
          {citizen.locality}
        </Typography>
      </div>
    ),
  },
  { id: 'phone', label: 'Телефон', width: 160, group: 'Контакты', render: (citizen) => text(citizen.phone) },
  { id: 'account', label: 'Лицевой счёт', width: 130, group: 'Учёт', render: (citizen) => text(citizen.accountNumber) },
  {
    id: 'status',
    label: 'Статус',
    width: 110,
    group: 'Учёт',
    sortField: 'status',
    render: (citizen) => <CitizenStatusChip status={citizen.status} />,
  },
  {
    id: 'categories',
    label: 'Льготные категории',
    width: 200,
    group: 'Учёт',
    render: (citizen) =>
      citizen.categories.length ? (
        <Tooltip title={citizen.categories.map((category) => SOCIAL_CATEGORIES[category].label).join(', ')}>
          <Typography variant="body2" noWrap>
            {citizen.categories.map((category) => SOCIAL_CATEGORIES[category].short).join(' · ')}
          </Typography>
        </Tooltip>
      ) : (
        muted('—')
      ),
  },
  {
    id: 'family',
    label: 'Семья',
    width: 80,
    group: 'Основное',
    sortField: 'familySize',
    align: 'center',
    render: (citizen) => text(citizen.familySize),
  },
  {
    id: 'appeals',
    label: 'Обращения',
    width: 110,
    group: 'Обращения',
    sortField: 'appealsTotal',
    align: 'center',
    render: (citizen) =>
      citizen.appealsTotal ? (
        <Tooltip title={citizen.appealsOpen ? `Открытых: ${citizen.appealsOpen}` : 'Все закрыты'}>
          <Badge color="warning" variant="dot" invisible={!citizen.appealsOpen}>
            <Typography variant="body2" sx={{ fontWeight: 600, px: 0.5 }}>
              {citizen.appealsTotal}
            </Typography>
          </Badge>
        </Tooltip>
      ) : (
        muted('0')
      ),
  },
  {
    id: 'debt',
    label: 'Задолженность',
    width: 140,
    group: 'Учёт',
    sortField: 'debt',
    align: 'right',
    render: (citizen) =>
      citizen.debt > 0 ? (
        <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.main' }}>
          {formatMoney(citizen.debt)}
        </Typography>
      ) : (
        muted('нет')
      ),
  },
  {
    id: 'registeredAt',
    label: 'На учёте с',
    width: 120,
    group: 'Учёт',
    sortField: 'registeredAt',
    render: (citizen) => muted(formatDate(citizen.registeredAt)),
  },
  {
    id: 'updatedAt',
    label: 'Изменена',
    width: 120,
    group: 'Учёт',
    sortField: 'updatedAt',
    render: (citizen) => muted(formatDate(citizen.updatedAt)),
  },
]

export const DEFAULT_VISIBLE_COLUMNS = ['name', 'birthDate', 'district', 'phone', 'status', 'categories', 'appeals', 'debt']
