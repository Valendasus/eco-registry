import { Box, LinearProgress, Stack, Typography } from '@mui/material'
import type { AppealTopic } from '../../../entities/citizen/types'
import { APPEAL_TOPICS } from '../../../entities/citizen/dictionaries'
import { formatNumber } from '../../../lib/format'
import { ChartCard } from './ChartCard'

export function TopicsChart({ topics }: { topics: Record<AppealTopic, number> }) {
  const data = (Object.keys(topics) as AppealTopic[])
    .map((topic) => ({ topic, label: APPEAL_TOPICS[topic], value: topics[topic] }))
    .sort((a, b) => b.value - a.value)
  const max = data[0]?.value || 1
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <ChartCard title="Тематика обращений" subtitle="Доля от общего числа">
      <Stack sx={{ gap: 1.75 }}>
        {data.map((item) => (
          <Box key={item.topic}>
            <Stack direction="row" sx={{ justifyContent: 'space-between', mb: 0.5, gap: 1 }}>
              <Typography variant="body2" noWrap>
                {item.label}
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, flexShrink: 0 }}>
                {formatNumber(item.value)}
                <Typography component="span" variant="caption" sx={{ color: 'text.secondary', ml: 0.75 }}>
                  {((item.value / total) * 100).toFixed(1).replace('.', ',')}%
                </Typography>
              </Typography>
            </Stack>
            <LinearProgress variant="determinate" value={(item.value / max) * 100} sx={{ bgcolor: 'surface.muted' }} />
          </Box>
        ))}
      </Stack>
    </ChartCard>
  )
}
