import AddRoundedIcon from '@mui/icons-material/AddRounded'
import DeleteOutlineRoundedIcon from '@mui/icons-material/DeleteOutlineRounded'
import { Box, Button, IconButton, Stack, Tooltip, Typography } from '@mui/material'
import type { ReactNode } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { EmptyState } from '../ui/EmptyState'
import { FieldGrid } from './FieldGrid'
import { useFieldMode } from './FieldMode'

interface RecordListProps<T> {
  name: string
  emptyText: string
  addLabel: string
  createItem: () => T
  renderView: (items: T[]) => ReactNode
  renderEdit: (index: number) => ReactNode
  itemTitle?: (item: T, index: number) => string
}

export function RecordList<T extends { id?: string }>({
  name,
  emptyText,
  addLabel,
  createItem,
  renderView,
  renderEdit,
  itemTitle,
}: RecordListProps<T>) {
  const { editing } = useFieldMode()
  const { control, watch } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name })
  const items: T[] = watch(name) ?? []

  if (!editing) {
    return items.length ? renderView(items) : <EmptyState title={emptyText} />
  }

  return (
    <Stack sx={{ gap: 1.5 }}>
      {fields.map((field, index) => (
        <Box key={field.id} sx={{ p: 2, borderRadius: 3, border: 1, borderColor: 'divider', bgcolor: 'surface.subtle' }}>
          <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
            <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
              {itemTitle && items[index] ? itemTitle(items[index], index) : `Запись ${index + 1}`}
            </Typography>
            <Tooltip title="Удалить">
              <IconButton size="small" onClick={() => remove(index)}>
                <DeleteOutlineRoundedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>
          <FieldGrid>{renderEdit(index)}</FieldGrid>
        </Box>
      ))}
      <Button
        startIcon={<AddRoundedIcon />}
        onClick={() => append(createItem() as never)}
        variant="outlined"
        sx={{ alignSelf: 'flex-start', borderStyle: 'dashed' }}
      >
        {addLabel}
      </Button>
    </Stack>
  )
}
