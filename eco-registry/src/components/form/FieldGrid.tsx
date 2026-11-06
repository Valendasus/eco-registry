import { Grid, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'

export interface SpanProps {
  span?: number
}

export const FieldGrid = ({ children }: { children: ReactNode }) => (
  <Grid container spacing={2}>
    {children}
  </Grid>
)

export const FieldCell = ({ span = 6, children }: SpanProps & { children: ReactNode }) => (
  <Grid size={{ xs: 12, sm: span <= 4 ? 6 : 12, md: span }}>{children}</Grid>
)

export const FieldGroupTitle = ({ children, hint }: { children: ReactNode; hint?: ReactNode }) => (
  <Grid size={12}>
    <Stack direction="row" sx={{ alignItems: 'baseline', gap: 1, mt: 1 }}>
      <Typography variant="overline" sx={{ color: 'text.secondary' }}>
        {children}
      </Typography>
      {hint && (
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          {hint}
        </Typography>
      )}
    </Stack>
  </Grid>
)
