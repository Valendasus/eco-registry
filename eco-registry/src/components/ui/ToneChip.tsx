import { Chip, type ChipProps } from '@mui/material'
import type { Tone } from '../../entities/citizen/dictionaries'

interface ToneChipProps extends Omit<ChipProps, 'color'> {
  tone: Tone
}

const toneColor = (tone: Tone) => (tone === 'default' ? 'text.secondary' : `${tone}.main`)

const toneBackground = (tone: Tone, opacity = 0.12) => {
  const channel = tone === 'default' ? 'text-secondaryChannel' : `${tone}-mainChannel`
  return `rgba(var(--mui-palette-${channel}) / ${opacity})`
}

export function ToneChip({ tone, sx, ...props }: ToneChipProps) {
  return <Chip size="small" {...props} sx={{ color: toneColor(tone), bgcolor: toneBackground(tone), ...sx }} />
}
