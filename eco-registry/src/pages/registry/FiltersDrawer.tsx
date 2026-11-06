import CloseRoundedIcon from '@mui/icons-material/CloseRounded'
import {
  Box,
  Button,
  Checkbox,
  Divider,
  Drawer,
  FormControlLabel,
  FormGroup,
  IconButton,
  Slider,
  Stack,
  Switch,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { useState, type ReactNode } from 'react'
import type { CitizenFilters, CitizenStatus, SocialCategory } from '../../entities/citizen/types'
import { CITIZEN_STATUSES, DISTRICTS, SOCIAL_CATEGORIES } from '../../entities/citizen/dictionaries'
import { dayjs, ISO_DATE } from '../../lib/date'
import { AGE_LIMITS, DEFAULT_FILTERS } from './filters'

interface FiltersDrawerProps {
  open: boolean
  filters: CitizenFilters
  onClose: () => void
  onApply: (filters: CitizenFilters) => void
}

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <Box>
    <Typography variant="overline" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
      {title}
    </Typography>
    {children}
  </Box>
)

const toggle = <T,>(list: T[], value: T) => (list.includes(value) ? list.filter((item) => item !== value) : [...list, value])

export function FiltersDrawer({ open, filters, onClose, onApply }: FiltersDrawerProps) {
  return (
    <Drawer anchor="right" open={open} onClose={onClose} slotProps={{ paper: { sx: { width: { xs: '100%', sm: 420 } } } }}>
      <FiltersPanel filters={filters} onClose={onClose} onApply={onApply} />
    </Drawer>
  )
}

function FiltersPanel({ filters, onClose, onApply }: Omit<FiltersDrawerProps, 'open'>) {
  const [draft, setDraft] = useState(filters)

  const patch = (changes: Partial<CitizenFilters>) => setDraft((current) => ({ ...current, ...changes }))

  return (
    <>
      <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2 }}>
        <Typography variant="h4">Фильтры</Typography>
        <IconButton onClick={onClose}>
          <CloseRoundedIcon />
        </IconButton>
      </Stack>
      <Divider />

      <Stack sx={{ flex: 1, overflow: 'auto', px: 3, py: 2.5, gap: 3 }}>
        <Section title="Статус учёта">
          <Stack direction="row" sx={{ flexWrap: 'wrap', gap: 1 }}>
            {(Object.keys(CITIZEN_STATUSES) as CitizenStatus[]).map((status) => (
              <ToggleButton
                key={status}
                value={status}
                size="small"
                selected={draft.statuses.includes(status)}
                onChange={() => patch({ statuses: toggle(draft.statuses, status) })}
                sx={{ px: 1.5, borderRadius: 2, textTransform: 'none' }}
              >
                {CITIZEN_STATUSES[status].label}
              </ToggleButton>
            ))}
          </Stack>
        </Section>

        <Section title="Пол">
          <ToggleButtonGroup
            exclusive
            size="small"
            fullWidth
            value={draft.gender}
            onChange={(_, gender) => gender !== null && patch({ gender })}
          >
            <ToggleButton value="">Все</ToggleButton>
            <ToggleButton value="male">Мужчины</ToggleButton>
            <ToggleButton value="female">Женщины</ToggleButton>
          </ToggleButtonGroup>
        </Section>

        <Section title={`Возраст: ${draft.ageFrom}–${draft.ageTo} лет`}>
          <Box sx={{ px: 1 }}>
            <Slider
              value={[draft.ageFrom, draft.ageTo]}
              min={AGE_LIMITS[0]}
              max={AGE_LIMITS[1]}
              valueLabelDisplay="auto"
              onChange={(_, value) => {
                const [ageFrom, ageTo] = value as number[]
                patch({ ageFrom, ageTo })
              }}
              marks={[18, 35, 60, 80, 100].map((value) => ({ value, label: value }))}
            />
          </Box>
        </Section>

        <Section title="Район проживания">
          <FormGroup sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', columnGap: 1 }}>
            {DISTRICTS.map((district) => (
              <FormControlLabel
                key={district.value}
                control={
                  <Checkbox
                    size="small"
                    checked={draft.districts.includes(district.value)}
                    onChange={() => patch({ districts: toggle(draft.districts, district.value as string) })}
                  />
                }
                label={<Typography variant="body2">{district.label}</Typography>}
              />
            ))}
          </FormGroup>
        </Section>

        <Section title="Льготные категории">
          <FormGroup>
            {(Object.keys(SOCIAL_CATEGORIES) as SocialCategory[]).map((category) => (
              <FormControlLabel
                key={category}
                control={
                  <Checkbox
                    size="small"
                    checked={draft.categories.includes(category)}
                    onChange={() => patch({ categories: toggle(draft.categories, category) })}
                  />
                }
                label={<Typography variant="body2">{SOCIAL_CATEGORIES[category].label}</Typography>}
              />
            ))}
          </FormGroup>
        </Section>

        <Section title="Дата постановки на учёт">
          <Stack direction="row" sx={{ gap: 1.5 }}>
            {(['registeredFrom', 'registeredTo'] as const).map((key) => (
              <DatePicker
                key={key}
                label={key === 'registeredFrom' ? 'С' : 'По'}
                value={draft[key] ? dayjs(draft[key]) : null}
                onChange={(value) => patch({ [key]: value?.isValid() ? value.format(ISO_DATE) : '' })}
                disableFuture
                slotProps={{ textField: { size: 'small' }, field: { clearable: true } }}
              />
            ))}
          </Stack>
        </Section>

        <Section title="Дополнительно">
          <Stack>
            <FormControlLabel
              control={<Switch checked={draft.withDebt} onChange={(event) => patch({ withDebt: event.target.checked })} />}
              label={<Typography variant="body2">Только с задолженностью</Typography>}
            />
            <FormControlLabel
              control={
                <Switch checked={draft.withOpenAppeals} onChange={(event) => patch({ withOpenAppeals: event.target.checked })} />
              }
              label={<Typography variant="body2">Есть открытые обращения</Typography>}
            />
          </Stack>
        </Section>
      </Stack>

      <Divider />
      <Stack direction="row" sx={{ gap: 1.5, px: 3, py: 2 }}>
        <Button
          variant="outlined"
          color="inherit"
          fullWidth
          onClick={() => setDraft({ ...DEFAULT_FILTERS, search: draft.search })}
        >
          Сбросить
        </Button>
        <Button
          variant="contained"
          fullWidth
          onClick={() => {
            onApply(draft)
            onClose()
          }}
        >
          Применить
        </Button>
      </Stack>
    </>
  )
}
