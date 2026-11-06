import { Card, CardContent, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

interface SectionCardProps {
  title: ReactNode
  description?: ReactNode
  action?: ReactNode
  children: ReactNode
  noPadding?: boolean
}

export function SectionCard({ title, description, action, children, noPadding }: SectionCardProps) {
  return (
    <Card>
      <Stack
        direction="row"
        sx={{ alignItems: 'center', justifyContent: 'space-between', gap: 2, px: 2.5, py: 1.75, borderBottom: 1, borderColor: 'divider' }}
      >
        <div>
          <Typography variant="h5">{title}</Typography>
          {description && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {description}
            </Typography>
          )}
        </div>
        {action}
      </Stack>
      {noPadding ? children : <CardContent>{children}</CardContent>}
    </Card>
  )
}
