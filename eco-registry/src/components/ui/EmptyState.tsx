import InboxRoundedIcon from '@mui/icons-material/InboxRounded'
import { Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface EmptyStateProps {
  title: string
  description?: string
  icon?: ReactNode
  action?: ReactNode
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <Stack sx={{ alignItems: 'center', textAlign: 'center', py: 5, px: 2, gap: 1, color: 'text.secondary' }}>
      {icon ?? <InboxRoundedIcon sx={{ fontSize: 40, opacity: 0.5 }} />}
      <Typography variant="subtitle1" sx={{ color: 'text.primary' }}>
        {title}
      </Typography>
      {description && <Typography variant="body2">{description}</Typography>}
      {action}
    </Stack>
  )
}
