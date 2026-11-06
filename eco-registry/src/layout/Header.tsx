import DarkModeRoundedIcon from '@mui/icons-material/DarkModeRounded'
import LightModeRoundedIcon from '@mui/icons-material/LightModeRounded'
import MenuRoundedIcon from '@mui/icons-material/MenuRounded'
import NotificationsNoneRoundedIcon from '@mui/icons-material/NotificationsNoneRounded'
import SearchRoundedIcon from '@mui/icons-material/SearchRounded'
import {
  Avatar,
  Badge,
  Box,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useColorScheme,
} from '@mui/material'
import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { useDashboardStats } from '../api/hooks'
import { CURRENT_USER } from '../app/currentUser'

interface HeaderProps {
  onMenuClick: () => void
}

export function Header({ onMenuClick }: HeaderProps) {
  const navigate = useNavigate()
  const { mode, systemMode, setMode } = useColorScheme()
  const { data: stats } = useDashboardStats()
  const [search, setSearch] = useState('')
  const isDark = (mode === 'system' ? systemMode : mode) === 'dark'

  const handleSearch = (event: FormEvent) => {
    event.preventDefault()
    const query = search.trim()
    navigate(query ? `/citizens?q=${encodeURIComponent(query)}` : '/citizens')
  }

  return (
    <Stack
      direction="row"
      sx={{
        alignItems: 'center',
        gap: 1.5,
        px: { xs: 2, md: 3 },
        height: 68,
        position: 'sticky',
        top: 0,
        zIndex: 'appBar',
        bgcolor: 'rgba(var(--mui-palette-background-defaultChannel) / 0.85)',
        backdropFilter: 'blur(10px)',
      }}
    >
      <IconButton onClick={onMenuClick} sx={{ bgcolor: 'background.paper', border: 1, borderColor: 'divider' }}>
        <MenuRoundedIcon fontSize="small" />
      </IconButton>

      <Box component="form" onSubmit={handleSearch} sx={{ flex: 1, maxWidth: 420 }}>
        <TextField
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="ФИО, СНИЛС, лицевой счёт или телефон"
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchRoundedIcon fontSize="small" />
                </InputAdornment>
              ),
              sx: { borderRadius: 2.5 },
            },
          }}
        />
      </Box>

      <Box sx={{ flex: 1 }} />

      <Tooltip title={isDark ? 'Светлая тема' : 'Тёмная тема'}>
        <IconButton onClick={() => setMode(isDark ? 'light' : 'dark')}>
          {isDark ? <LightModeRoundedIcon fontSize="small" /> : <DarkModeRoundedIcon fontSize="small" />}
        </IconButton>
      </Tooltip>

      <Tooltip title="Просроченные обращения">
        <IconButton onClick={() => navigate('/citizens?openAppeals=1')}>
          <Badge badgeContent={stats?.appeals.overdue} color="error" max={999}>
            <NotificationsNoneRoundedIcon fontSize="small" />
          </Badge>
        </IconButton>
      </Tooltip>

      <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25, ml: 0.5 }}>
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14, fontWeight: 700 }}>
          {CURRENT_USER.initials}
        </Avatar>
        <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
          <Typography variant="subtitle2" sx={{ lineHeight: 1.2 }}>
            {CURRENT_USER.name}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
            {CURRENT_USER.role}
          </Typography>
        </Box>
      </Stack>
    </Stack>
  )
}
