import TrendingDownRoundedIcon from '@mui/icons-material/TrendingDownRounded'
import TrendingUpRoundedIcon from '@mui/icons-material/TrendingUpRounded'
import { Avatar, Box, Card, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { Area, AreaChart, ResponsiveContainer } from 'recharts'

interface KpiCardProps {
  label: string
  value: ReactNode
  icon: ReactNode
  color: string
  caption?: ReactNode
  delta?: number
  invertDelta?: boolean
  trend?: number[]
}

export function KpiCard({ label, value, icon, color, caption, delta, invertDelta, trend }: KpiCardProps) {
  const positive = delta !== undefined && (invertDelta ? delta < 0 : delta > 0)
  const gradientId = `kpi-${label.replace(/\s/g, '')}`

  return (
    <Card sx={{ height: '100%', position: 'relative', overflow: 'hidden' }}>
      <Box sx={{ p: 2.5, pb: trend ? 7 : 2.5 }}>
        <Stack direction="row" sx={{ justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Avatar
            variant="rounded"
            sx={{ width: 42, height: 42, borderRadius: 3, color, bgcolor: `color-mix(in srgb, ${color} 14%, transparent)` }}
          >
            {icon}
          </Avatar>
          {delta !== undefined && Number.isFinite(delta) && (
            <Stack
              direction="row"
              sx={{
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.25,
                borderRadius: 2,
                fontSize: 12,
                fontWeight: 700,
                color: positive ? 'success.main' : 'error.main',
                bgcolor: positive
                  ? 'rgba(var(--mui-palette-success-mainChannel) / 0.12)'
                  : 'rgba(var(--mui-palette-error-mainChannel) / 0.12)',
              }}
            >
              {delta >= 0 ? <TrendingUpRoundedIcon sx={{ fontSize: 16 }} /> : <TrendingDownRoundedIcon sx={{ fontSize: 16 }} />}
              {delta > 0 ? '+' : ''}
              {(delta * 100).toFixed(1).replace('.', ',')}%
            </Stack>
          )}
        </Stack>
        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 500 }}>
          {label}
        </Typography>
        <Typography sx={{ fontSize: 28, fontWeight: 800, letterSpacing: '-0.02em', lineHeight: 1.25 }}>{value}</Typography>
        {caption && (
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {caption}
          </Typography>
        )}
      </Box>

      {trend && (
        <Box sx={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 56 }}>
          <ResponsiveContainer>
            <AreaChart data={trend.map((value, index) => ({ index, value }))} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                fill={`url(#${gradientId})`}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Box>
      )}
    </Card>
  )
}
