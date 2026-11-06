import { Box, Button, Stack, Typography } from '@mui/material'
import { Link, useNavigate } from 'react-router'
import type { RecentAppeal } from '../../../api/types'
import { AppealStatusChip } from '../../../components/ui/StatusChips'
import { APPEAL_CHANNELS, APPEAL_TOPICS } from '../../../entities/citizen/dictionaries'
import { dayjs } from '../../../lib/date'
import { formatRelative } from '../../../lib/format'
import { ChartCard } from './ChartCard'

export function RecentAppeals({ appeals }: { appeals: RecentAppeal[] }) {
  const navigate = useNavigate()

  return (
    <ChartCard
      title="Последние обращения"
      subtitle="Новые поступления по всем каналам"
      action={
        <Button component={Link} to="/citizens?openAppeals=1" size="small">
          Все открытые
        </Button>
      }
    >
      <Stack sx={{ mx: -2.5 }}>
        {appeals.map((appeal) => (
          <Stack
            key={appeal.id}
            direction="row"
            onClick={() => navigate(`/citizens/${appeal.citizenId}?tab=appeals`)}
            sx={{
              px: 2.5,
              py: 1.5,
              gap: 2,
              alignItems: 'center',
              cursor: 'pointer',
              borderTop: 1,
              borderColor: 'divider',
              '&:hover': { bgcolor: 'surface.subtle' },
            }}
          >
            <Box sx={{ width: 64, flexShrink: 0, display: { xs: 'none', sm: 'block' } }}>
              <Typography variant="body2" sx={{ fontWeight: 700 }}>
                {dayjs(appeal.createdAt).format('HH:mm')}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {formatRelative(appeal.createdAt)}
              </Typography>
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                {appeal.subject}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap component="div">
                {appeal.citizenName} · {APPEAL_TOPICS[appeal.topic]} · {APPEAL_CHANNELS[appeal.channel]}
              </Typography>
            </Box>
            <AppealStatusChip status={appeal.status} />
          </Stack>
        ))}
      </Stack>
    </ChartCard>
  )
}
