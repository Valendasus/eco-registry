import { Box, Stack, Typography } from '@mui/material'
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer } from 'recharts'
import type { AppealStatus, SocialCategory } from '../../../entities/citizen/types'
import { APPEAL_STATUSES, SOCIAL_CATEGORIES } from '../../../entities/citizen/dictionaries'
import { formatNumber } from '../../../lib/format'
import { useChartPalette } from '../../../lib/useChartPalette'
import { ChartCard } from './ChartCard'

interface CategoriesCardProps {
  categories: Record<SocialCategory, number>
  statuses: Record<AppealStatus, number>
  total: number
  onTimeRate: number
}

export function CategoriesCard({ categories, statuses, total, onTimeRate }: CategoriesCardProps) {
  const colors = useChartPalette()
  const items = (Object.keys(categories) as SocialCategory[])
    .map((category) => ({ category, value: categories[category] }))
    .sort((a, b) => b.value - a.value)
  const statusColors: Record<AppealStatus, string> = {
    new: colors.info,
    inProgress: colors.primary,
    waiting: colors.warning,
    resolved: colors.success,
    rejected: colors.text,
  }
  const statusTotal = Object.values(statuses).reduce((sum, value) => sum + value, 0)

  return (
    <ChartCard title="Исполнение и льготы" subtitle="Статусы обращений и льготные категории граждан">
      <Stack direction="row" sx={{ alignItems: 'center', gap: 2, mb: 2 }}>
        <Box sx={{ width: 104, height: 104, position: 'relative', flexShrink: 0 }}>
          <ResponsiveContainer>
            <RadialBarChart innerRadius="78%" outerRadius="100%" data={[{ value: onTimeRate * 100 }]} startAngle={90} endAngle={-270}>
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
              <RadialBar dataKey="value" cornerRadius={8} fill={colors.primary} background={{ fill: colors.muted }} />
            </RadialBarChart>
          </ResponsiveContainer>
          <Stack sx={{ position: 'absolute', inset: 0, alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontWeight: 800, fontSize: 20 }}>{Math.round(onTimeRate * 100)}%</Typography>
          </Stack>
        </Box>
        <Box sx={{ flex: 1 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
            Закрыто в установленный срок
          </Typography>
          <Stack direction="row" sx={{ height: 8, borderRadius: 4, overflow: 'hidden', mb: 1 }}>
            {(Object.keys(statuses) as AppealStatus[]).map((status) => (
              <Box key={status} sx={{ width: `${(statuses[status] / statusTotal) * 100}%`, bgcolor: statusColors[status] }} />
            ))}
          </Stack>
          <Stack direction="row" sx={{ flexWrap: 'wrap', columnGap: 1.5, rowGap: 0.25 }}>
            {(Object.keys(statuses) as AppealStatus[]).map((status) => (
              <Stack key={status} direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: statusColors[status] }} />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {APPEAL_STATUSES[status].label} {formatNumber(statuses[status])}
                </Typography>
              </Stack>
            ))}
          </Stack>
        </Box>
      </Stack>

      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
        {items.map((item) => (
          <Box key={item.category} sx={{ p: 1.25, borderRadius: 2.5, bgcolor: 'surface.subtle' }}>
            <Typography variant="caption" noWrap component="div" sx={{ color: 'text.secondary' }}>
              {SOCIAL_CATEGORIES[item.category].label}
            </Typography>
            <Stack direction="row" sx={{ alignItems: 'baseline', gap: 0.75 }}>
              <Typography sx={{ fontWeight: 700 }}>{formatNumber(item.value)}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {((item.value / total) * 100).toFixed(1).replace('.', ',')}%
              </Typography>
            </Stack>
          </Box>
        ))}
      </Box>
    </ChartCard>
  )
}
