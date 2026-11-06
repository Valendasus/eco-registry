import { Box, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface ReadOnlyFieldProps {
  label: ReactNode
  value: ReactNode
}

export function ReadOnlyField({ label, value }: ReadOnlyFieldProps) {
  const empty = value === '' || value === null || value === undefined
  return (
    <Box sx={{ py: 0.25 }}>
      <Typography variant="caption" component="div" sx={{ color: 'text.secondary', mb: 0.25 }}>
        {label}
      </Typography>
      <Typography
        component="div"
        sx={{ fontSize: 14, fontWeight: 500, color: empty ? 'text.disabled' : 'text.primary', wordBreak: 'break-word' }}
      >
        {empty ? '—' : value}
      </Typography>
    </Box>
  )
}
