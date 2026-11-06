import ViewColumnRoundedIcon from '@mui/icons-material/ViewColumnRounded'
import { Button, Checkbox, ListItemIcon, ListSubheader, Menu, MenuItem, Typography } from '@mui/material'
import { Fragment, useState } from 'react'
import { COLUMNS, DEFAULT_VISIBLE_COLUMNS } from './columns'

interface ColumnsMenuProps {
  visible: string[]
  onChange: (visible: string[]) => void
}

const GROUPS = [...new Set(COLUMNS.map((column) => column.group))]

export function ColumnsMenu({ visible, onChange }: ColumnsMenuProps) {
  const [anchor, setAnchor] = useState<HTMLElement | null>(null)

  const toggle = (id: string) =>
    onChange(visible.includes(id) ? visible.filter((item) => item !== id) : [...visible, id])

  return (
    <>
      <Button
        variant="outlined"
        color="inherit"
        startIcon={<ViewColumnRoundedIcon />}
        onClick={(event) => setAnchor(event.currentTarget)}
        sx={{ borderColor: 'divider', whiteSpace: 'nowrap' }}
      >
        Колонки
      </Button>
      <Menu
        anchorEl={anchor}
        open={!!anchor}
        onClose={() => setAnchor(null)}
        slotProps={{ paper: { sx: { width: 260, maxHeight: 480, mt: 0.5, border: 1, borderColor: 'divider' } } }}
      >
        {GROUPS.map((group) => (
          <Fragment key={group}>
            <ListSubheader sx={{ lineHeight: '32px', fontSize: 12 }}>{group}</ListSubheader>
            {COLUMNS.filter((column) => column.group === group).map((column) => (
              <MenuItem
                key={column.id}
                dense
                disabled={column.hideable === false}
                onClick={() => toggle(column.id)}
              >
                <ListItemIcon>
                  <Checkbox size="small" checked={visible.includes(column.id)} sx={{ p: 0 }} />
                </ListItemIcon>
                <Typography variant="body2">{column.label}</Typography>
              </MenuItem>
            ))}
          </Fragment>
        ))}
        <MenuItem dense onClick={() => onChange(DEFAULT_VISIBLE_COLUMNS)} sx={{ color: 'primary.main', mt: 0.5 }}>
          Вернуть по умолчанию
        </MenuItem>
      </Menu>
    </>
  )
}
