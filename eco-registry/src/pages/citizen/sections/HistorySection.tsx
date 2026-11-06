import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined'
import ImageOutlinedIcon from '@mui/icons-material/ImageOutlined'
import { Avatar, Box, Grid, Stack, Typography } from '@mui/material'
import { SectionCard } from '../../../components/ui/SectionCard'
import type { CitizenDetails } from '../../../entities/citizen/types'
import { formatDate, formatDateTime, formatFileSize } from '../../../lib/format'

export function HistorySection({ citizen }: { citizen: CitizenDetails }) {
  return (
    <Stack sx={{ gap: 2.5 }}>
      <SectionCard title="Файлы" description={`${citizen.attachments.length} в карточке`}>
        <Grid container spacing={1.5}>
          {citizen.attachments.map((file) => (
            <Grid key={file.id} size={{ xs: 12, sm: 6 }}>
              <Stack
                direction="row"
                sx={{ alignItems: 'center', gap: 1.5, p: 1.5, borderRadius: 3, border: 1, borderColor: 'divider' }}
              >
                <Avatar variant="rounded" sx={{ bgcolor: 'surface.muted', color: 'primary.main', borderRadius: 2 }}>
                  {file.name.endsWith('.jpg') ? <ImageOutlinedIcon /> : <DescriptionOutlinedIcon />}
                </Avatar>
                <Box sx={{ minWidth: 0 }}>
                  <Typography variant="body2" noWrap sx={{ fontWeight: 600 }}>
                    {file.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {file.kind} · {formatFileSize(file.size)} · {formatDate(file.uploadedAt)}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
          ))}
        </Grid>
      </SectionCard>

      <SectionCard title="Журнал изменений">
        <Stack>
          {citizen.history.map((entry, index) => (
            <Stack key={entry.id} direction="row" sx={{ gap: 2 }}>
              <Stack sx={{ alignItems: 'center', pt: 0.75 }}>
                <Box
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    border: 2,
                    borderColor: index === 0 ? 'primary.main' : 'divider',
                    bgcolor: index === 0 ? 'primary.main' : 'background.paper',
                  }}
                />
                {index < citizen.history.length - 1 && <Box sx={{ width: 2, flex: 1, bgcolor: 'divider', my: 0.5 }} />}
              </Stack>
              <Box sx={{ pb: 2.25 }}>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>
                  {entry.action}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {entry.author} · {formatDateTime(entry.at)}
                </Typography>
              </Box>
            </Stack>
          ))}
        </Stack>
      </SectionCard>
    </Stack>
  )
}
