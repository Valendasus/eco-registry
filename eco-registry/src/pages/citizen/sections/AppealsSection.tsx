import AddRoundedIcon from '@mui/icons-material/AddRounded'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Rating,
  Stack,
  Tab,
  Tabs,
  Typography,
} from '@mui/material'
import { useState } from 'react'
import { ReadOnlyField } from '../../../components/form'
import { DataTable } from '../../../components/ui/DataTable'
import { EmptyState } from '../../../components/ui/EmptyState'
import { SectionCard } from '../../../components/ui/SectionCard'
import { AppealStatusChip, PriorityChip } from '../../../components/ui/StatusChips'
import { APPEAL_CHANNELS, APPEAL_TOPICS, OPEN_APPEAL_STATUSES } from '../../../entities/citizen/dictionaries'
import type { Appeal, CitizenDetails } from '../../../entities/citizen/types'
import { today } from '../../../lib/date'
import { formatDate, formatDateTime } from '../../../lib/format'
import { NewAppealDialog } from '../NewAppealDialog'

type AppealFilter = 'all' | 'open' | 'closed'

const isOpen = (appeal: Appeal) => OPEN_APPEAL_STATUSES.includes(appeal.status)
const isOverdue = (appeal: Appeal) => isOpen(appeal) && appeal.dueDate < today().format('YYYY-MM-DD')

export function AppealsSection({ citizen }: { citizen: CitizenDetails }) {
  const [filter, setFilter] = useState<AppealFilter>('all')
  const [selected, setSelected] = useState<Appeal | null>(null)
  const [creating, setCreating] = useState(false)

  const open = citizen.appeals.filter(isOpen)
  const rows = citizen.appeals.filter((appeal) =>
    filter === 'all' ? true : filter === 'open' ? isOpen(appeal) : !isOpen(appeal),
  )

  return (
    <>
      <SectionCard
        title="Обращения гражданина"
        description="Поступают из РЭО Радар, горячей линии, Госуслуг и с личного приёма"
        action={
          <Button variant="contained" size="small" startIcon={<AddRoundedIcon />} onClick={() => setCreating(true)}>
            Новое обращение
          </Button>
        }
      >
        <Tabs value={filter} onChange={(_, value) => setFilter(value)} sx={{ mb: 2, mt: -1 }}>
          <Tab value="all" label={`Все · ${citizen.appeals.length}`} />
          <Tab value="open" label={`Открытые · ${open.length}`} />
          <Tab value="closed" label={`Закрытые · ${citizen.appeals.length - open.length}`} />
        </Tabs>

        {rows.length ? (
          <DataTable
            rows={rows}
            rowKey={(row) => row.id}
            onRowClick={setSelected}
            columns={[
              {
                key: 'number',
                title: 'Номер / дата',
                render: (row) => (
                  <div>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {row.number}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {formatDateTime(row.createdAt)}
                    </Typography>
                  </div>
                ),
              },
              {
                key: 'subject',
                title: 'Суть обращения',
                render: (row) => (
                  <div>
                    <Typography variant="body2">{row.subject}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {APPEAL_TOPICS[row.topic]} · {APPEAL_CHANNELS[row.channel]}
                    </Typography>
                  </div>
                ),
              },
              { key: 'executor', title: 'Исполнитель', render: (row) => row.executor },
              {
                key: 'due',
                title: 'Срок',
                render: (row) => (
                  <Typography variant="body2" sx={{ color: isOverdue(row) ? 'error.main' : 'inherit', fontWeight: isOverdue(row) ? 600 : 400 }}>
                    {formatDate(row.dueDate)}
                  </Typography>
                ),
              },
              { key: 'status', title: 'Статус', align: 'right', render: (row) => <AppealStatusChip status={row.status} /> },
            ]}
          />
        ) : (
          <EmptyState title="Обращений нет" description="В выбранной категории пока пусто" />
        )}
      </SectionCard>

      <Dialog open={!!selected} onClose={() => setSelected(null)} maxWidth="sm" fullWidth>
        {selected && (
          <>
            <DialogTitle>
              <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                {selected.number}
                <AppealStatusChip status={selected.status} />
              </Stack>
            </DialogTitle>
            <DialogContent dividers>
              <Typography variant="h5" sx={{ mb: 1 }}>
                {selected.subject}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2.5 }}>
                {selected.description}
              </Typography>
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <ReadOnlyField label="Тематика" value={APPEAL_TOPICS[selected.topic]} />
                <ReadOnlyField label="Канал" value={APPEAL_CHANNELS[selected.channel]} />
                <ReadOnlyField label="Поступило" value={formatDateTime(selected.createdAt)} />
                <ReadOnlyField label="Срок ответа" value={formatDate(selected.dueDate)} />
                <ReadOnlyField label="Подразделение" value={selected.department} />
                <ReadOnlyField label="Исполнитель" value={selected.executor} />
                <ReadOnlyField label="Приоритет" value={<PriorityChip priority={selected.priority} />} />
                <ReadOnlyField label="Закрыто" value={selected.closedAt ? formatDate(selected.closedAt) : ''} />
                {selected.rating && (
                  <ReadOnlyField label="Оценка заявителя" value={<Rating value={selected.rating} readOnly size="small" />} />
                )}
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>

      <NewAppealDialog citizen={citizen} open={creating} onClose={() => setCreating(false)} />
    </>
  )
}
