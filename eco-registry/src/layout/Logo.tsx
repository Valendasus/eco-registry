import { Box, Stack, Typography } from '@mui/material'

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', gap: 1.25 }}>
      <Box
        component="svg"
        viewBox="0 0 32 32"
        sx={{ width: 34, height: 34, flexShrink: 0, color: 'primary.main' }}
      >
        <rect width="32" height="32" rx="9" fill="currentColor" />
        <path
          d="M9 21.5c0-7 5-11.5 14-12-.4 8.6-4.8 13.5-11.6 13.5-.9 0-1.7-.2-2.4-.5Zm0 0c2.2-3.6 5-6 8.5-7.6"
          fill="none"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Box>
      {!compact && (
        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ fontWeight: 800, fontSize: 17, lineHeight: 1.1, letterSpacing: '-0.02em' }}>
            ЭкоРеестр
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.secondary', whiteSpace: 'nowrap' }}>
            Региональный оператор ТКО
          </Typography>
        </Box>
      )}
    </Stack>
  )
}
