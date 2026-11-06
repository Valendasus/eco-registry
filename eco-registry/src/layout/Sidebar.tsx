import { Box, List, ListItemButton, ListItemIcon, ListItemText, Stack, Tooltip, Typography } from '@mui/material'
import { NavLink } from 'react-router'
import { Logo } from './Logo'
import { NAVIGATION } from './navigation'

interface SidebarProps {
  collapsed: boolean
  onNavigate?: () => void
}

export function Sidebar({ collapsed, onNavigate }: SidebarProps) {
  return (
    <Stack sx={{ height: '100%', px: collapsed ? 1.25 : 2, py: 2.5 }}>
      <Box sx={{ px: collapsed ? 0.5 : 1, mb: 3.5 }}>
        <Logo compact={collapsed} />
      </Box>

      {NAVIGATION.map((group) => (
        <Box key={group.title} sx={{ mb: 2.5 }}>
          {!collapsed && (
            <Typography variant="overline" sx={{ px: 1.5, color: 'text.secondary', display: 'block', mb: 0.5 }}>
              {group.title}
            </Typography>
          )}
          <List disablePadding sx={{ display: 'grid', gap: 0.5 }}>
            {group.items.map(({ label, to, icon: Icon, end }) => (
              <Tooltip key={to} title={collapsed ? label : ''} placement="right">
                <ListItemButton
                  component={NavLink}
                  to={to}
                  end={end}
                  onClick={onNavigate}
                  sx={{
                    px: 1.5,
                    py: 1,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    color: 'text.secondary',
                    '&.active': {
                      color: 'primary.main',
                      bgcolor: 'rgba(var(--mui-palette-primary-mainChannel) / 0.1)',
                    },
                    '&.active .MuiListItemIcon-root': { color: 'primary.main' },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: collapsed ? 0 : 36, color: 'inherit' }}>
                    <Icon fontSize="small" />
                  </ListItemIcon>
                  {!collapsed && (
                    <ListItemText primary={label} slotProps={{ primary: { sx: { fontWeight: 600, fontSize: 14 } } }} />
                  )}
                </ListItemButton>
              </Tooltip>
            ))}
          </List>
        </Box>
      ))}
    </Stack>
  )
}
