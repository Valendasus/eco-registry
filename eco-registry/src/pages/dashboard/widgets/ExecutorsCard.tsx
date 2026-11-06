import { Avatar, Box, Stack, Typography } from '@mui/material'
import { ChartCard } from './ChartCard'

interface ExecutorsCardProps {
  executors: { name: string; open: number; resolved: number; overdue: number }[]
}

export function ExecutorsCard({ executors }: ExecutorsCardProps) {
  const max = Math.max(...executors.map((executor) => executor.open), 1)

  return (
    <ChartCard title="Нагрузка исполнителей" subtitle="Обращения в работе и решённые за 30 дней">
      <Stack sx={{ gap: 1.75 }}>
        {executors.map((executor) => (
          <Stack key={executor.name} direction="row" sx={{ alignItems: 'center', gap: 1.5 }}>
            <Avatar sx={{ width: 32, height: 32, fontSize: 12, fontWeight: 700, bgcolor: 'surface.muted', color: 'text.primary' }}>
              {executor.name.split(' ').map((part) => part[0]).slice(0, 2).join('')}
            </Avatar>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack direction="row" sx={{ justifyContent: 'space-between' }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                  {executor.name}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary', flexShrink: 0 }}>
                  {executor.resolved} решено
                </Typography>
              </Stack>
              <Stack direction="row" sx={{ alignItems: 'center', gap: 1, mt: 0.5 }}>
                <Box sx={{ flex: 1, height: 6, borderRadius: 3, bgcolor: 'surface.muted', overflow: 'hidden', display: 'flex' }}>
                  <Box sx={{ width: `${((executor.open - executor.overdue) / max) * 100}%`, bgcolor: 'primary.main' }} />
                  <Box sx={{ width: `${(executor.overdue / max) * 100}%`, bgcolor: 'error.main' }} />
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, minWidth: 56, textAlign: 'right', whiteSpace: 'nowrap' }}>
                  {executor.open}
                  {executor.overdue > 0 && (
                    <Typography component="span" variant="caption" sx={{ color: 'error.main', fontWeight: 700 }}>
                      {' '}/ {executor.overdue}
                    </Typography>
                  )}
                </Typography>
              </Stack>
            </Box>
          </Stack>
        ))}
      </Stack>
    </ChartCard>
  )
}
