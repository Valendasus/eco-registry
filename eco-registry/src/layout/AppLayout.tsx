import { Box, Drawer, useMediaQuery, useTheme } from '@mui/material'
import { useState } from 'react'
import { Outlet } from 'react-router'
import { Header } from './Header'
import { Sidebar } from './Sidebar'

const SIDEBAR_WIDTH = 252
const SIDEBAR_COLLAPSED_WIDTH = 76

export function AppLayout() {
  const theme = useTheme()
  const desktop = useMediaQuery(theme.breakpoints.up('lg'))
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const width = collapsed ? SIDEBAR_COLLAPSED_WIDTH : SIDEBAR_WIDTH

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {desktop ? (
        <Box
          component="nav"
          sx={{
            width,
            flexShrink: 0,
            position: 'sticky',
            top: 0,
            height: '100vh',
            bgcolor: 'background.paper',
            borderRight: 1,
            borderColor: 'divider',
            transition: theme.transitions.create('width', { duration: 200 }),
            overflow: 'hidden',
          }}
        >
          <Sidebar collapsed={collapsed} />
        </Box>
      ) : (
        <Drawer
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          slotProps={{ paper: { sx: { width: SIDEBAR_WIDTH } } }}
        >
          <Sidebar collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </Drawer>
      )}

      <Box sx={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
        <Header onMenuClick={() => (desktop ? setCollapsed((value) => !value) : setMobileOpen(true))} />
        <Box component="main" sx={{ flex: 1, px: { xs: 2, md: 3 }, pb: 4 }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}
