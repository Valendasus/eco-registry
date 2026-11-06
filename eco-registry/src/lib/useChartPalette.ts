import { useColorScheme } from '@mui/material'
import { CHART_COLORS, PALETTES } from '../app/theme'

export function useChartPalette() {
  const { mode, systemMode } = useColorScheme()
  const scheme = (mode === 'system' ? systemMode : mode) === 'dark' ? 'dark' : 'light'
  const palette = PALETTES[scheme]

  return {
    scheme,
    series: CHART_COLORS,
    primary: palette.primary.main,
    secondary: palette.secondary.main,
    success: palette.success.main,
    warning: palette.warning.main,
    error: palette.error.main,
    info: palette.info.main,
    text: palette.text.secondary,
    grid: palette.divider,
    paper: palette.background.paper,
    muted: palette.surface.muted,
  }
}
