import { Box, Stack, Typography } from '@mui/material'
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import type { AppealChannel } from '../../../entities/citizen/types'
import { APPEAL_CHANNELS } from '../../../entities/citizen/dictionaries'
import { ChartTooltip } from '../../../components/ui/ChartTooltip'
import { formatNumber } from '../../../lib/format'
import { useChartPalette } from '../../../lib/useChartPalette'
import { ChartCard } from './ChartCard'

export function ChannelsDonut({ channels }: { channels: Record<AppealChannel, number> }) {
  const colors = useChartPalette()
  const data = (Object.keys(channels) as AppealChannel[])
    .map((channel) => ({ channel, name: APPEAL_CHANNELS[channel], value: channels[channel] }))
    .sort((a, b) => b.value - a.value)
  const total = data.reduce((sum, item) => sum + item.value, 0)

  return (
    <ChartCard title="Каналы поступления" subtitle="Все обращения в системе">
      <Box sx={{ position: 'relative', height: 200 }}>
        <ResponsiveContainer>
          <PieChart>
            <Tooltip content={<ChartTooltip formatValue={formatNumber} />} />
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={62} outerRadius={90} paddingAngle={2} stroke="none">
              {data.map((item, index) => (
                <Cell key={item.channel} fill={colors.series[index % colors.series.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <Stack sx={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
          <Typography sx={{ fontSize: 22, fontWeight: 800 }}>{formatNumber(total)}</Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            обращений
          </Typography>
        </Stack>
      </Box>
      <Stack sx={{ gap: 1, mt: 2 }}>
        {data.map((item, index) => (
          <Stack key={item.channel} direction="row" sx={{ alignItems: 'center', gap: 1 }}>
            <Box sx={{ width: 10, height: 10, borderRadius: 1, bgcolor: colors.series[index % colors.series.length] }} />
            <Typography variant="body2" sx={{ flex: 1 }}>
              {item.name}
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              {formatNumber(item.value)}
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, width: 44, textAlign: 'right' }}>
              {Math.round((item.value / total) * 100)}%
            </Typography>
          </Stack>
        ))}
      </Stack>
    </ChartCard>
  )
}
