import CakeOutlinedIcon from '@mui/icons-material/CakeOutlined'
import FmdGoodOutlinedIcon from '@mui/icons-material/FmdGoodOutlined'
import PhoneOutlinedIcon from '@mui/icons-material/PhoneOutlined'
import ReceiptLongOutlinedIcon from '@mui/icons-material/ReceiptLongOutlined'
import { Box, Card, Chip, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { CitizenAvatar } from '../../components/ui/CitizenAvatar'
import { CitizenStatusChip } from '../../components/ui/StatusChips'
import { DISTRICT_LABELS, SOCIAL_CATEGORIES } from '../../entities/citizen/dictionaries'
import type { CitizenDetails } from '../../entities/citizen/types'
import { formatAge, formatDate, formatMoney, fullName, plural } from '../../lib/format'

const Meta = ({ icon, children }: { icon: ReactNode; children: ReactNode }) => (
  <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75, color: 'text.secondary', '& svg': { fontSize: 18 } }}>
    {icon}
    <Typography variant="body2">{children}</Typography>
  </Stack>
)

const Stat = ({ label, value, hint, tone }: { label: string; value: ReactNode; hint?: string; tone?: string }) => (
  <Box sx={{ px: 2.5, py: 1.75, flex: '1 1 140px' }}>
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
    <Typography sx={{ fontSize: 20, fontWeight: 700, color: tone, lineHeight: 1.3 }}>{value}</Typography>
    {hint && (
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {hint}
      </Typography>
    )}
  </Box>
)

interface CitizenHeaderProps {
  citizen: CitizenDetails
  actions: ReactNode
}

export function CitizenHeader({ citizen, actions }: CitizenHeaderProps) {
  const openAppeals = citizen.appeals.filter((appeal) => !appeal.closedAt).length
  const together = citizen.family.filter((member) => member.livesTogether).length

  return (
    <Card sx={{ mb: 2.5 }}>
      <Box
        sx={{
          height: 84,
          background:
            'linear-gradient(120deg, rgba(var(--mui-palette-primary-mainChannel) / 0.22), rgba(var(--mui-palette-secondary-mainChannel) / 0.12) 60%, transparent)',
        }}
      />
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        sx={{ px: 3, pb: 2.5, gap: 2.5, alignItems: { md: 'flex-end' }, mt: '-44px' }}
      >
        <CitizenAvatar
          citizen={citizen}
          size={96}
          sx={{ border: 4, borderColor: 'background.paper', bgcolor: 'background.paper', fontSize: 34 }}
        />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 0.5 }}>
            <Typography variant="h2">{fullName(citizen)}</Typography>
            <CitizenStatusChip status={citizen.status} />
          </Stack>
          <Stack direction="row" sx={{ gap: 2.5, rowGap: 0.5, flexWrap: 'wrap' }}>
            <Meta icon={<ReceiptLongOutlinedIcon />}>{citizen.regNumber}</Meta>
            <Meta icon={<CakeOutlinedIcon />}>
              {formatDate(citizen.birthDate)}, {formatAge(citizen.birthDate)}
            </Meta>
            <Meta icon={<FmdGoodOutlinedIcon />}>
              {DISTRICT_LABELS[citizen.districtId]}, {citizen.locality}
            </Meta>
            <Meta icon={<PhoneOutlinedIcon />}>{citizen.phone || 'нет телефона'}</Meta>
          </Stack>
          {citizen.categories.length > 0 && (
            <Stack direction="row" sx={{ gap: 0.75, mt: 1.25, flexWrap: 'wrap' }}>
              {citizen.categories.map((category) => (
                <Chip key={category} size="small" variant="outlined" color="primary" label={SOCIAL_CATEGORIES[category].label} />
              ))}
            </Stack>
          )}
        </Box>
        <Stack direction="row" sx={{ gap: 1, flexShrink: 0 }}>
          {actions}
        </Stack>
      </Stack>
      <Stack
        direction="row"
        sx={{ flexWrap: 'wrap', borderTop: 1, borderColor: 'divider', '& > *:not(:last-child)': { borderRight: { sm: 1 }, borderColor: { sm: 'divider' } } }}
      >
        <Stat label="Состав семьи" value={`${together + 1} чел.`} hint={`${citizen.family.length} ${plural(citizen.family.length, ['родственник', 'родственника', 'родственников'])} в карточке`} />
        <Stat label="Обращения" value={citizen.appeals.length} hint={openAppeals ? `${openAppeals} в работе` : 'все закрыты'} />
        <Stat
          label="Задолженность"
          value={citizen.debt > 0 ? formatMoney(citizen.debt) : 'нет'}
          tone={citizen.debt > 0 ? 'error.main' : 'success.main'}
          hint={`л/с ${citizen.accountNumber}`}
        />
        <Stat label="На учёте с" value={formatDate(citizen.registeredAt)} hint={`изменена ${formatDate(citizen.updatedAt)}`} />
      </Stack>
    </Card>
  )
}
