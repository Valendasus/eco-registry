import NavigateNextRoundedIcon from '@mui/icons-material/NavigateNextRounded'
import { Breadcrumbs, Link, Stack, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { Link as RouterLink } from 'react-router'

interface PageHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  breadcrumbs?: { label: string; to?: string }[]
  actions?: ReactNode
}

export function PageHeader({ title, subtitle, breadcrumbs, actions }: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', md: 'row' }}
      sx={{ alignItems: { md: 'flex-end' }, justifyContent: 'space-between', gap: 2, pt: 1, mb: 3 }}
    >
      <div>
        {breadcrumbs && (
          <Breadcrumbs separator={<NavigateNextRoundedIcon sx={{ fontSize: 16 }} />} sx={{ mb: 0.75, fontSize: 13 }}>
            {breadcrumbs.map((crumb) =>
              crumb.to ? (
                <Link key={crumb.label} component={RouterLink} to={crumb.to} underline="hover" color="text.secondary">
                  {crumb.label}
                </Link>
              ) : (
                <Typography key={crumb.label} sx={{ fontSize: 13, color: 'text.primary' }}>
                  {crumb.label}
                </Typography>
              ),
            )}
          </Breadcrumbs>
        )}
        <Typography variant="h1">{title}</Typography>
        {subtitle && (
          <Typography sx={{ color: 'text.secondary', mt: 0.5, fontSize: 14 }}>{subtitle}</Typography>
        )}
      </div>
      {actions && <Stack direction="row" sx={{ gap: 1, flexWrap: 'wrap' }}>{actions}</Stack>}
    </Stack>
  )
}
