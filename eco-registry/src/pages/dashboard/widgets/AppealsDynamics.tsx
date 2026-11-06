import { Box, ToggleButton, ToggleButtonGroup } from '@mui/material'
import { useState } from 'react'
import { Bar, CartesianGrid, ComposedChart, Legend, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { MonthStats } from '../../../api/types'
import { ChartTooltip } from '../../../components/ui/ChartTooltip'
import { dayjs } from '../../../lib/date'
import { formatNumber } from '../../../lib/format'
import { useChartPalette } from '../../../lib/useChartPalette'
import { ChartCard } from './ChartCard'

export function AppealsDynamics({ months }: { months: MonthStats[] }) {
  const colors = useChartPalette()
  const [period, setPeriod] = useState<6 | 12>(12)
  const data = months.slice(-period).map((month) => ({
    ...month,
    label: dayjs(`${month.month}-01`).format(period === 12 ? 'MMM' : 'MMMM'),
  }))

  return (
    <ChartCard
      title="Динамика обращений"
      subtitle="Поступившие, решённые и просроченные по месяцам"
      action={
        <ToggleButtonGroup
          size="small"
          exclusive
          value={period}
          onChange={(_, value) => value && setPeriod(value)}
          sx={{ '& .MuiToggleButton-root': { px: 1.5, py: 0.25, textTransform: 'none', fontSize: 12 } }}
        >
          <ToggleButton value={6}>6 мес.</ToggleButton>
          <ToggleButton value={12}>Год</ToggleButton>
        </ToggleButtonGroup>
      }
    >
      <Box sx={{ flex: 1, minHeight: 300 }}>
        <ResponsiveContainer>
          <ComposedChart data={data} margin={{ left: -8, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} stroke={colors.grid} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: colors.text, fontSize: 12 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fill: colors.text, fontSize: 12 }} tickFormatter={formatNumber} />
            <Tooltip cursor={{ fill: colors.muted }} content={<ChartTooltip formatValue={formatNumber} />} />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
            <Bar dataKey="received" name="Поступило" fill={colors.primary} radius={[6, 6, 0, 0]} maxBarSize={28} />
            <Bar dataKey="resolved" name="Решено" fill={colors.series[5]} radius={[6, 6, 0, 0]} maxBarSize={28} />
            <Line dataKey="overdue" name="С нарушением срока" stroke={colors.error} strokeWidth={2} dot={false} type="monotone" />
          </ComposedChart>
        </ResponsiveContainer>
      </Box>
    </ChartCard>
  )
}
