import { Avatar, type SxProps, type Theme } from '@mui/material'
import type { CitizenSummary } from '../../entities/citizen/types'
import { initials } from '../../lib/format'

const AVATAR_TONES = ['#17795B', '#4C6FFF', '#C2569A', '#E08A1E', '#2BA6B5', '#8E5BD9']

interface CitizenAvatarProps {
  citizen: Pick<CitizenSummary, 'id' | 'lastName' | 'firstName' | 'middleName'>
  size?: number
  sx?: SxProps<Theme>
}

export function CitizenAvatar({ citizen, size = 36, sx }: CitizenAvatarProps) {
  const color = AVATAR_TONES[citizen.id % AVATAR_TONES.length]
  return (
    <Avatar
      sx={[
        {
          width: size,
          height: size,
          fontSize: size * 0.36,
          fontWeight: 700,
          color,
          bgcolor: `color-mix(in srgb, ${color} 14%, transparent)`,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {initials(citizen)}
    </Avatar>
  )
}
