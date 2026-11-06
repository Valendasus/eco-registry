import { alpha, createTheme } from '@mui/material/styles'
import { ruRU } from '@mui/material/locale'
import { ruRU as datePickersRu } from '@mui/x-date-pickers/locales'

declare module '@mui/material/styles' {
  interface Palette {
    surface: { subtle: string; muted: string; border: string }
  }
  interface PaletteOptions {
    surface?: { subtle: string; muted: string; border: string }
  }
}

const FONT = '"Manrope Variable", "Segoe UI", system-ui, sans-serif'

export const CHART_COLORS = ['#17795B', '#4C6FFF', '#F2A33A', '#E5484D', '#8E5BD9', '#2BA6B5', '#9AA7A1', '#C2569A']

const LIGHT_PALETTE = {
  primary: { main: '#17795B', light: '#3B9A7B', dark: '#0F5C44', contrastText: '#FFFFFF' },
  secondary: { main: '#4C6FFF' },
  success: { main: '#1F9D6A' },
  warning: { main: '#E08A1E' },
  error: { main: '#D9363E' },
  info: { main: '#2F80ED' },
  background: { default: '#F2F5F3', paper: '#FFFFFF' },
  text: { primary: '#15201B', secondary: '#5D6B65' },
  divider: '#E3E8E5',
  surface: { subtle: '#F7F9F8', muted: '#EDF2EF', border: '#E3E8E5' },
}

const DARK_PALETTE: typeof LIGHT_PALETTE = {
  primary: { main: '#3FBF8F', light: '#6AD4AC', dark: '#22936A', contrastText: '#06150F' },
  secondary: { main: '#7D93FF' },
  success: { main: '#3FBF8F' },
  warning: { main: '#F2A33A' },
  error: { main: '#F0656B' },
  info: { main: '#5AA1F5' },
  background: { default: '#0D1311', paper: '#141C19' },
  text: { primary: '#E8EEEB', secondary: '#93A39B' },
  divider: '#24302B',
  surface: { subtle: '#18211E', muted: '#1D2824', border: '#24302B' },
}

export const PALETTES = { light: LIGHT_PALETTE, dark: DARK_PALETTE }

export const theme = createTheme(
  {
    cssVariables: { colorSchemeSelector: 'data' },
    colorSchemes: {
      light: { palette: LIGHT_PALETTE },
      dark: { palette: DARK_PALETTE },
    },
    shape: { borderRadius: 10 },
    typography: {
      fontFamily: FONT,
      h1: { fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' },
      h2: { fontSize: '1.5rem', fontWeight: 700, letterSpacing: '-0.015em' },
      h3: { fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.01em' },
      h4: { fontSize: '1.125rem', fontWeight: 700 },
      h5: { fontSize: '1rem', fontWeight: 700 },
      h6: { fontSize: '0.9375rem', fontWeight: 700 },
      subtitle1: { fontWeight: 600 },
      subtitle2: { fontWeight: 600, fontSize: '0.8125rem' },
      body2: { fontSize: '0.8125rem' },
      caption: { fontSize: '0.75rem' },
      overline: { fontWeight: 700, letterSpacing: '0.08em', fontSize: '0.6875rem' },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: { fontFeatureSettings: '"tnum" 1' },
          '::selection': { background: alpha('#17795B', 0.2) },
        },
      },
      MuiPaper: {
        defaultProps: { elevation: 0 },
        styleOverrides: { root: { backgroundImage: 'none' } },
      },
      MuiCard: {
        defaultProps: { variant: 'outlined' },
        styleOverrides: {
          root: ({ theme }) => ({
            borderRadius: 16,
            borderColor: theme.vars.palette.divider,
          }),
        },
      },
      MuiCardHeader: {
        styleOverrides: {
          root: { padding: '18px 20px 0' },
          title: { fontSize: '0.9375rem', fontWeight: 700 },
          subheader: { fontSize: '0.75rem', marginTop: 2 },
        },
      },
      MuiCardContent: {
        styleOverrides: { root: { padding: 20, '&:last-child': { paddingBottom: 20 } } },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: { root: { borderRadius: 10, paddingInline: 14 } },
      },
      MuiIconButton: {
        styleOverrides: { root: { borderRadius: 10 } },
      },
      MuiTextField: {
        defaultProps: { size: 'small', fullWidth: true },
      },
      MuiFormControl: {
        defaultProps: { size: 'small', fullWidth: true },
      },
      MuiAutocomplete: {
        defaultProps: { size: 'small', fullWidth: true },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: ({ theme }) => ({
            backgroundColor: theme.vars.palette.background.paper,
            '&.Mui-disabled': { backgroundColor: theme.vars.palette.surface.subtle },
          }),
          notchedOutline: ({ theme }) => ({ borderColor: theme.vars.palette.divider }),
        },
      },
      MuiChip: {
        styleOverrides: {
          root: { fontWeight: 600, borderRadius: 8 },
          sizeSmall: { height: 22, fontSize: '0.71875rem' },
        },
      },
      MuiTabs: {
        styleOverrides: {
          root: { minHeight: 44 },
          indicator: { height: 3, borderRadius: '3px 3px 0 0' },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: { minHeight: 44, minWidth: 0, paddingInline: 4, marginRight: 22, fontWeight: 600, fontSize: '0.8125rem' },
        },
      },
      MuiTooltip: {
        styleOverrides: { tooltip: { fontSize: '0.75rem', borderRadius: 8 } },
      },
      MuiTableCell: {
        styleOverrides: {
          root: ({ theme }) => ({ borderColor: theme.vars.palette.divider }),
          head: ({ theme }) => ({
            fontSize: '0.75rem',
            fontWeight: 600,
            color: theme.vars.palette.text.secondary,
            whiteSpace: 'nowrap',
          }),
        },
      },
      MuiListItemButton: {
        styleOverrides: { root: { borderRadius: 10 } },
      },
      MuiDialog: {
        styleOverrides: { paper: { borderRadius: 18 } },
      },
      MuiDialogTitle: {
        styleOverrides: { root: { fontSize: '1.0625rem', fontWeight: 700 } },
      },
      MuiLinearProgress: {
        styleOverrides: { root: { borderRadius: 4, height: 6 } },
      },
    },
  },
  ruRU,
  datePickersRu,
)
