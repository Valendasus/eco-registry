import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import ExpandMoreRoundedIcon from '@mui/icons-material/ExpandMoreRounded'
import OpenInNewRoundedIcon from '@mui/icons-material/OpenInNewRounded'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Divider,
  IconButton,
  Skeleton,
  Stack,
  Typography,
} from '@mui/material'
import type { ReactNode } from 'react'
import { Link } from 'react-router'
import { useCitizen } from '../../api/hooks'
import { ReadOnlyField } from '../../components/form'
import { CitizenAvatar } from '../../components/ui/CitizenAvatar'
import { AppealStatusChip, CitizenStatusChip } from '../../components/ui/StatusChips'
import { APPEAL_TOPICS, DISTRICT_LABELS, GENDERS, SOCIAL_CATEGORIES } from '../../entities/citizen/dictionaries'
import { formatAddress, formatAge, formatDate, formatMoney, fullName } from '../../lib/format'

interface CitizenPreviewProps {
  id: number
  onClose: () => void
}

const Block = ({ title, count, children, defaultExpanded }: { title: string; count?: number; children: ReactNode; defaultExpanded?: boolean }) => (
  <Accordion
    disableGutters
    defaultExpanded={defaultExpanded}
    elevation={0}
    sx={{ bgcolor: 'transparent', '&::before': { display: 'none' }, borderTop: 1, borderColor: 'divider' }}
  >
    <AccordionSummary expandIcon={<ExpandMoreRoundedIcon />} sx={{ px: 2.5, minHeight: 48 }}>
      <Typography variant="h6">{title}</Typography>
      {count !== undefined && (
        <Chip label={count} size="small" sx={{ ml: 1, height: 20, fontSize: 11 }} />
      )}
    </AccordionSummary>
    <AccordionDetails sx={{ px: 2.5, pt: 0, pb: 2 }}>{children}</AccordionDetails>
  </Accordion>
)

const Pairs = ({ items }: { items: [string, ReactNode][] }) => (
  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5 }}>
    {items.map(([label, value]) => (
      <ReadOnlyField key={label} label={label} value={value} />
    ))}
  </Box>
)

const Metric = ({ label, value, tone }: { label: string; value: ReactNode; tone?: string }) => (
  <Box sx={{ flex: 1, minWidth: 0, px: 1.5, py: 1.25, borderRadius: 2.5, bgcolor: 'surface.subtle' }}>
    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
      {label}
    </Typography>
    <Typography sx={{ fontWeight: 700, fontSize: 15, color: tone }} noWrap>
      {value}
    </Typography>
  </Box>
)

export function CitizenPreview({ id, onClose }: CitizenPreviewProps) {
  const { data: citizen, isLoading } = useCitizen(id)

  if (isLoading || !citizen) {
    return (
      <Stack sx={{ p: 2.5, gap: 2 }}>
        <Stack direction="row" sx={{ gap: 2, alignItems: 'center' }}>
          <Skeleton variant="circular" width={56} height={56} />
          <Box sx={{ flex: 1 }}>
            <Skeleton width="80%" height={28} />
            <Skeleton width="40%" />
          </Box>
        </Stack>
        <Skeleton variant="rounded" height={60} />
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} variant="rounded" height={40} />
        ))}
      </Stack>
    )
  }

  const openAppeals = citizen.appeals.filter((appeal) => !appeal.closedAt)

  return (
    <Box sx={{ height: '100%', overflow: 'auto' }}>
      <Box sx={{ p: 2.5 }}>
        <Stack direction="row" sx={{ gap: 2, alignItems: 'flex-start' }}>
          <CitizenAvatar citizen={citizen} size={56} />
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="h4" sx={{ lineHeight: 1.25 }}>
              {fullName(citizen)}
            </Typography>
            <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mt: 0.75 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {citizen.regNumber}
              </Typography>
              <CitizenStatusChip status={citizen.status} />
            </Stack>
          </Box>
          <IconButton size="small" onClick={onClose} aria-label="Закрыть">
            <CloseRoundedIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Stack direction="row" sx={{ gap: 1, mt: 2.5 }}>
          <Metric label="Возраст" value={formatAge(citizen.birthDate)} />
          <Metric label="Семья" value={`${citizen.familySize} чел.`} />
          <Metric label="Обращения" value={openAppeals.length ? `${citizen.appealsTotal} / ${openAppeals.length} откр.` : citizen.appealsTotal} />
        </Stack>
        <Stack direction="row" sx={{ gap: 1, mt: 1 }}>
          <Metric
            label="Задолженность ТКО"
            value={citizen.debt > 0 ? formatMoney(citizen.debt) : 'Нет'}
            tone={citizen.debt > 0 ? 'error.main' : 'success.main'}
          />
          <Metric label="Лицевой счёт" value={citizen.accountNumber} />
        </Stack>

        <Button
          component={Link}
          to={`/citizens/${citizen.id}`}
          variant="contained"
          fullWidth
          endIcon={<OpenInNewRoundedIcon />}
          sx={{ mt: 2 }}
        >
          Открыть карточку
        </Button>
      </Box>

      <Block title="Личные данные" defaultExpanded>
        <Pairs
          items={[
            ['Дата рождения', formatDate(citizen.birthDate)],
            ['Пол', GENDERS[citizen.gender]],
            ['СНИЛС', citizen.snils],
            ['ИНН', citizen.inn],
            ['Паспорт', `${citizen.passport.series} ${citizen.passport.number}`],
            ['Семейное положение', citizen.maritalStatus],
          ]}
        />
      </Block>

      <Block title="Контакты и адрес" defaultExpanded>
        <Stack sx={{ gap: 1.5 }}>
          <Pairs
            items={[
              ['Телефон', citizen.phone],
              ['Эл. почта', citizen.email],
              ['Район', DISTRICT_LABELS[citizen.districtId]],
              ['Способ связи', citizen.preferredChannel],
            ]}
          />
          <ReadOnlyField label="Адрес регистрации" value={formatAddress(citizen.registrationAddress)} />
        </Stack>
      </Block>

      <Block title="Члены семьи" count={citizen.family.length}>
        {citizen.family.length ? (
          <Stack divider={<Divider flexItem />} sx={{ gap: 1 }}>
            {citizen.family.map((member) => (
              <Stack key={member.id} direction="row" sx={{ justifyContent: 'space-between', gap: 2 }}>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                    {member.fullName}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {member.relation} · {formatDate(member.birthDate)}
                  </Typography>
                </Box>
                {!member.livesTogether && <Chip size="small" label="Отдельно" variant="outlined" />}
              </Stack>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Проживает один
          </Typography>
        )}
      </Block>

      <Block title="Образование и работа" count={citizen.education.length}>
        <Stack sx={{ gap: 1.25 }}>
          {citizen.education.map((item) => (
            <Box key={item.id}>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {item.level}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {[item.institution, item.speciality, item.graduationYear].filter(Boolean).join(' · ')}
              </Typography>
            </Box>
          ))}
          <Divider />
          <Pairs
            items={[
              ['Занятость', citizen.employment.status],
              ['Место работы', citizen.employment.organization],
            ]}
          />
        </Stack>
      </Block>

      <Block title="Социальная поддержка" count={citizen.categories.length}>
        <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 0.75, mb: citizen.social.benefits.length ? 1.5 : 0 }}>
          {citizen.categories.length ? (
            citizen.categories.map((category) => (
              <Chip key={category} size="small" color="primary" variant="outlined" label={SOCIAL_CATEGORIES[category].label} />
            ))
          ) : (
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Льготных категорий нет
            </Typography>
          )}
        </Stack>
        {citizen.social.benefits.length > 0 && (
          <ReadOnlyField label="Назначенные меры" value={citizen.social.benefits.join(', ')} />
        )}
      </Block>

      <Block title="Последние обращения" count={citizen.appeals.length}>
        {citizen.appeals.length ? (
          <Stack sx={{ gap: 1.25 }}>
            {citizen.appeals.slice(0, 4).map((appeal) => (
              <Box key={appeal.id} sx={{ p: 1.5, borderRadius: 2.5, border: 1, borderColor: 'divider' }}>
                <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {appeal.number} · {formatDate(appeal.createdAt)}
                  </Typography>
                  <AppealStatusChip status={appeal.status} />
                </Stack>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {appeal.subject}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {APPEAL_TOPICS[appeal.topic]}
                </Typography>
              </Box>
            ))}
          </Stack>
        ) : (
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Обращений не поступало
          </Typography>
        )}
      </Block>
    </Box>
  )
}
