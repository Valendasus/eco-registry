import { Box, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface TooltipEntry {
  name?: ReactNode
  value?: number | string | readonly (number | string)[]
  color?: string
  dataKey?: unknown
}

interface ChartTooltipProps {
  active?: boolean
  label?: ReactNode
  payload?: readonly TooltipEntry[]
  formatLabel?: (label: ReactNode) => ReactNode
  formatValue?: (value: number) => ReactNode
}

export function ChartTooltip({ active, label, payload, formatLabel, formatValue }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <Box
      sx={{
        px: 1.5,
        py: 1,
        borderRadius: 2.5,
        bgcolor: 'background.paper',
        border: 1,
        borderColor: 'divider',
        boxShadow: '0 8px 24px rgba(15, 30, 25, 0.12)',
        minWidth: 140,
      }}
    >
      {label !== undefined && (
        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
          {formatLabel ? formatLabel(label) : label}
        </Typography>
      )}
      {payload.map((entry, index) => (
        <Stack key={index} direction="row" sx={{ alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
          <Stack direction="row" sx={{ alignItems: 'center', gap: 0.75 }}>
            <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: entry.color }} />
            <Typography variant="caption">{entry.name}</Typography>
          </Stack>
          <Typography variant="caption" sx={{ fontWeight: 700 }}>
            {formatValue ? formatValue(Number(entry.value)) : String(entry.value)}
          </Typography>
        </Stack>
      ))}
    </Box>
  )
}
