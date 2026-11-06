import { Box } from '@mui/material'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ChartTooltip } from '../../../components/ui/ChartTooltip'
import { formatNumber } from '../../../lib/format'
import { useChartPalette } from '../../../lib/useChartPalette'
import { ChartCard } from './ChartCard'

interface AgePyramidProps {
  groups: { group: string; male: number; female: number }[]
}

export function AgePyramid({ groups }: AgePyramidProps) {
  const colors = useChartPalette()
  const data = [...groups].reverse().map((group) => ({ ...group, male: -group.male }))

  return (
    <ChartCard title="Возрастно-половая структура" subtitle="Граждане на учёте по возрастным группам">
      <Box sx={{ flex: 1, minHeight: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data} layout="vertical" stackOffset="sign" barCategoryGap={6} margin={{ left: 0, right: 8 }}>
            <CartesianGrid horizontal={false} stroke={colors.grid} />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fill: colors.text, fontSize: 11 }}
              tickFormatter={(value: number) => formatNumber(Math.abs(value))}
            />
            <YAxis type="category" dataKey="group" tickLine={false} axisLine={false} tick={{ fill: colors.text, fontSize: 12 }} width={56} />
            <Tooltip
              cursor={{ fill: colors.muted }}
              content={<ChartTooltip formatValue={(value) => formatNumber(Math.abs(value))} />}
            />
            <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="male" name="Мужчины" stackId="age" fill={colors.secondary} radius={[4, 0, 0, 4]} />
            <Bar dataKey="female" name="Женщины" stackId="age" fill={colors.series[7]} radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Box>
    </ChartCard>
  )
}
