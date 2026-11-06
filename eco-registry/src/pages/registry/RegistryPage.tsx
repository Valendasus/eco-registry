import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined'
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import TuneRoundedIcon from '@mui/icons-material/TuneRounded'
import {
  Badge,
  Box,
  Button,
  Card,
  Chip,
  Drawer,
  InputAdornment,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'
import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router'
import { useCitizenList } from '../../api/hooks'
import { PageHeader } from '../../components/ui/PageHeader'
import type { CitizenFilters, SortState } from '../../entities/citizen/types'
import { formatNumber, plural } from '../../lib/format'
import { useDebouncedValue, useStoredState } from '../../lib/hooks'
import { CitizenPreview } from './CitizenPreview'
import { CitizensTable } from './CitizensTable'
import { ColumnsMenu } from './ColumnsMenu'
import { COLUMNS, DEFAULT_VISIBLE_COLUMNS } from './columns'
import { exportCitizens } from './export'
import { DEFAULT_FILTERS, describeFilters } from './filters'
import { FiltersDrawer } from './FiltersDrawer'

const QUICK_FILTERS: { label: string; active: (filters: CitizenFilters) => boolean; toggle: (filters: CitizenFilters) => CitizenFilters }[] = [
  {
    label: 'С задолженностью',
    active: (filters) => filters.withDebt,
    toggle: (filters) => ({ ...filters, withDebt: !filters.withDebt }),
  },
  {
    label: 'Открытые обращения',
    active: (filters) => filters.withOpenAppeals,
    toggle: (filters) => ({ ...filters, withOpenAppeals: !filters.withOpenAppeals }),
  },
  {
    label: 'Пенсионеры',
    active: (filters) => filters.categories.includes('pensioner'),
    toggle: (filters) => ({
      ...filters,
      categories: filters.categories.includes('pensioner')
        ? filters.categories.filter((category) => category !== 'pensioner')
        : [...filters.categories, 'pensioner'],
    }),
  },
  {
    label: 'Многодетные',
    active: (filters) => filters.categories.includes('largeFamily'),
    toggle: (filters) => ({
      ...filters,
      categories: filters.categories.includes('largeFamily')
        ? filters.categories.filter((category) => category !== 'largeFamily')
        : [...filters.categories, 'largeFamily'],
    }),
  },
]

export function RegistryPage() {
  const theme = useTheme()
  const wide = useMediaQuery(theme.breakpoints.up('xl'))
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const search = params.get('q') ?? ''
  const openAppealsParam = params.get('openAppeals') === '1'
  const [filters, setFilters] = useState<CitizenFilters>(() => ({ ...DEFAULT_FILTERS, withOpenAppeals: openAppealsParam }))
  const [appliedOpenAppeals, setAppliedOpenAppeals] = useState(openAppealsParam)
  const [sort, setSort] = useState<SortState>({ field: 'fullName', direction: 'asc' })
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [visibleColumns, setVisibleColumns] = useStoredState('eco-registry.columns', DEFAULT_VISIBLE_COLUMNS)
  const [exporting, setExporting] = useState(false)

  const debouncedSearch = useDebouncedValue(search)
  const query = useMemo(() => ({ ...filters, search: debouncedSearch }), [filters, debouncedSearch])
  const { data, isLoading, isFetching } = useCitizenList(query, sort)

  const selectedParam = params.get('id')
  const selectedId = selectedParam ? Number(selectedParam) : null
  const columns = useMemo(() => COLUMNS.filter((column) => visibleColumns.includes(column.id)), [visibleColumns])
  const activeFilters = describeFilters(filters)

  if (openAppealsParam !== appliedOpenAppeals) {
    setAppliedOpenAppeals(openAppealsParam)
    if (openAppealsParam) setFilters((current) => ({ ...current, withOpenAppeals: true }))
  }

  const updateParam = (key: string, value: string | null) =>
    setParams(
      (current) => {
        const next = new URLSearchParams(current)
        if (value === null) next.delete(key)
        else next.set(key, value)
        return next
      },
      { replace: true },
    )

  const handleSearchChange = (value: string) => updateParam('q', value || null)

  const handleExport = async () => {
    if (!data) return
    setExporting(true)
    await exportCitizens(data.ids)
    setExporting(false)
  }

  const found = data?.ids.length ?? 0
  const total = data?.total ?? 0

  return (
    <>
      <PageHeader
        title="Картотека граждан"
        breadcrumbs={[{ label: 'Главная', to: '/' }, { label: 'Картотека' }]}
        subtitle={
          data
            ? `В реестре ${formatNumber(total)} ${plural(total, ['гражданин', 'гражданина', 'граждан'])}`
            : 'Загружаем реестр…'
        }
        actions={
          <>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<FileDownloadOutlinedIcon />}
              onClick={handleExport}
              disabled={!found || exporting}
              sx={{ borderColor: 'divider' }}
            >
              {exporting ? 'Готовим файл…' : 'Выгрузить CSV'}
            </Button>
            <Button component={Link} to="/citizens/new" variant="contained" startIcon={<PersonAddAlt1RoundedIcon />}>
              Новый гражданин
            </Button>
          </>
        }
      />

      <Card sx={{ display: 'flex', flexDirection: 'column', height: { xs: 'auto', md: 'calc(100vh - 176px)' }, minHeight: 560 }}>
        <Stack sx={{ p: 2, gap: 1.5, borderBottom: 1, borderColor: 'divider' }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} sx={{ gap: 1.5 }}>
            <TextField
              value={search}
              onChange={(event) => handleSearchChange(event.target.value)}
              placeholder="Поиск по ФИО, СНИЛС, номеру карточки, лицевому счёту"
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon fontSize="small" />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <Stack direction="row" sx={{ gap: 1.5, flexShrink: 0 }}>
              <Badge badgeContent={activeFilters.length} color="primary">
                <Button
                  variant="outlined"
                  color="inherit"
                  startIcon={<TuneRoundedIcon />}
                  onClick={() => setFiltersOpen(true)}
                  sx={{ borderColor: 'divider' }}
                >
                  Фильтры
                </Button>
              </Badge>
              <ColumnsMenu visible={visibleColumns} onChange={setVisibleColumns} />
            </Stack>
          </Stack>

          <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap', alignItems: 'center' }}>
            {QUICK_FILTERS.map((quick) => {
              const active = quick.active(filters)
              return (
                <Chip
                  key={quick.label}
                  label={quick.label}
                  onClick={() => setFilters(quick.toggle)}
                  color={active ? 'primary' : 'default'}
                  variant={active ? 'filled' : 'outlined'}
                />
              )
            })}
            {activeFilters
              .filter((filter) => !['debt', 'appeals', 'category-pensioner', 'category-largeFamily'].includes(filter.key))
              .map((filter) => (
                <Chip
                  key={filter.key}
                  label={filter.label}
                  onDelete={() => setFilters(filter.reset)}
                  sx={{ bgcolor: 'surface.muted' }}
                />
              ))}
            {activeFilters.length > 0 && (
              <Button size="small" onClick={() => setFilters({ ...DEFAULT_FILTERS })}>
                Сбросить всё
              </Button>
            )}
          </Stack>
        </Stack>

        <Stack direction="row" sx={{ flex: 1, minHeight: { xs: 520, md: 0 } }}>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <CitizensTable
              ids={data?.ids}
              columns={columns}
              sort={sort}
              loading={isLoading}
              fetching={isFetching}
              selectedId={selectedId}
              onSortChange={setSort}
              onSelect={(id) => updateParam('id', String(id))}
              onOpen={(id) => navigate(`/citizens/${id}`)}
            />
          </Box>

          {wide && selectedId !== null && (
            <Box sx={{ width: 400, flexShrink: 0, borderLeft: 1, borderColor: 'divider' }}>
              <CitizenPreview key={selectedId} id={selectedId} onClose={() => updateParam('id', null)} />
            </Box>
          )}
        </Stack>

        <Stack
          direction="row"
          sx={{ justifyContent: 'space-between', px: 2, py: 1.25, borderTop: 1, borderColor: 'divider', color: 'text.secondary' }}
        >
          <Typography variant="caption">
            Найдено <b>{formatNumber(found)}</b> из {formatNumber(total)}
            {data && ` · ${data.elapsed} мс`}
          </Typography>
          <Typography variant="caption" sx={{ display: { xs: 'none', md: 'block' } }}>
            ↑ ↓ — выбор строки, Enter или двойной клик — открыть карточку
          </Typography>
        </Stack>
      </Card>

      {!wide && (
        <Drawer
          anchor="right"
          open={selectedId !== null}
          onClose={() => updateParam('id', null)}
          slotProps={{ paper: { sx: { width: { xs: '100%', sm: 420 } } } }}
        >
          {selectedId !== null && <CitizenPreview key={selectedId} id={selectedId} onClose={() => updateParam('id', null)} />}
        </Drawer>
      )}

      <FiltersDrawer open={filtersOpen} filters={filters} onClose={() => setFiltersOpen(false)} onApply={setFilters} />
    </>
  )
}
