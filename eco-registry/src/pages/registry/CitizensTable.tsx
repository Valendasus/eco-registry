import ArrowDownwardRoundedIcon from '@mui/icons-material/ArrowDownwardRounded'
import SearchOffRoundedIcon from '@mui/icons-material/SearchOffRounded'
import { Box, ButtonBase, LinearProgress, Skeleton, Stack } from '@mui/material'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useEffect, useRef, type KeyboardEvent } from 'react'
import { citizensApi } from '../../api/citizens'
import { EmptyState } from '../../components/ui/EmptyState'
import type { SortState } from '../../entities/citizen/types'
import type { Column } from './columns'

const ROW_HEIGHT = 56
const HEADER_HEIGHT = 44

interface CitizensTableProps {
  ids?: Int32Array
  columns: Column[]
  sort: SortState
  loading: boolean
  fetching: boolean
  selectedId: number | null
  onSortChange: (sort: SortState) => void
  onSelect: (id: number) => void
  onOpen: (id: number) => void
}

export function CitizensTable({ ids, columns, sort, loading, fetching, selectedId, onSortChange, onSelect, onOpen }: CitizensTableProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const count = ids?.length ?? 0
  const minWidth = columns.reduce((sum, column) => sum + column.width, 0)

  const virtualizer = useVirtualizer({
    count,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => ROW_HEIGHT,
    overscan: 10,
    paddingStart: HEADER_HEIGHT,
  })

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 })
  }, [ids])

  const selectedIndex = ids && selectedId !== null ? ids.indexOf(selectedId) : -1

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!ids || !count) return
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      const step = event.key === 'ArrowDown' ? 1 : -1
      const next = Math.min(count - 1, Math.max(0, selectedIndex + step))
      onSelect(ids[next])
      virtualizer.scrollToIndex(next, { align: 'auto' })
    }
    if (event.key === 'Enter' && selectedId !== null) onOpen(selectedId)
  }

  const toggleSort = (column: Column) => {
    if (!column.sortField) return
    onSortChange(
      sort.field === column.sortField
        ? { field: column.sortField, direction: sort.direction === 'asc' ? 'desc' : 'asc' }
        : { field: column.sortField, direction: column.align === 'right' || column.sortField === 'appealsTotal' ? 'desc' : 'asc' },
    )
  }

  const cellSx = (column: Column, index: number) => ({
    width: column.width,
    flex: index === columns.length - 1 ? `1 0 ${column.width}px` : `0 0 ${column.width}px`,
    px: 1.5,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: column.align === 'right' ? 'flex-end' : column.align === 'center' ? 'center' : 'flex-start',
    textAlign: column.align ?? 'left',
  })

  return (
    <Box sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {fetching && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, zIndex: 3, borderRadius: 0 }} />}

      <Box
        ref={scrollRef}
        tabIndex={0}
        onKeyDown={handleKeyDown}
        role="grid"
        aria-rowcount={count}
        sx={{ flex: 1, overflow: 'auto', outline: 'none', position: 'relative' }}
      >
        <Box sx={{ height: virtualizer.getTotalSize(), minWidth, position: 'relative' }}>
          <Stack
            direction="row"
            role="row"
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 2,
              height: HEADER_HEIGHT,
              bgcolor: 'surface.subtle',
              borderBottom: 1,
              borderColor: 'divider',
            }}
          >
            {columns.map((column, index) => {
              const active = sort.field === column.sortField
              return (
                <Box key={column.id} role="columnheader" sx={cellSx(column, index)}>
                  <ButtonBase
                    disabled={!column.sortField}
                    onClick={() => toggleSort(column)}
                    sx={{
                      gap: 0.5,
                      fontSize: 12,
                      fontWeight: 600,
                      color: active ? 'text.primary' : 'text.secondary',
                      borderRadius: 1,
                      whiteSpace: 'nowrap',
                      '&:hover .sort-icon': { opacity: 0.5 },
                    }}
                  >
                    {column.label}
                    {column.sortField && (
                      <ArrowDownwardRoundedIcon
                        className="sort-icon"
                        sx={{
                          fontSize: 14,
                          opacity: active ? 1 : 0,
                          transform: active && sort.direction === 'asc' ? 'rotate(180deg)' : 'none',
                          transition: 'transform 150ms, opacity 150ms',
                        }}
                      />
                    )}
                  </ButtonBase>
                </Box>
              )
            })}
          </Stack>

          {loading &&
            Array.from({ length: 10 }, (_, index) => (
              <Stack key={index} direction="row" sx={{ height: ROW_HEIGHT, alignItems: 'center', px: 1.5, gap: 2 }}>
                <Skeleton variant="circular" width={32} height={32} />
                <Skeleton width="30%" />
                <Skeleton width="20%" />
                <Skeleton width="25%" />
              </Stack>
            ))}

          {virtualizer.getVirtualItems().map((item) => {
            const id = ids![item.index]
            const citizen = citizensApi.getSummary(id)
            const selected = id === selectedId
            return (
              <Stack
                key={id}
                direction="row"
                role="row"
                aria-selected={selected}
                onClick={() => onSelect(id)}
                onDoubleClick={() => onOpen(id)}
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: ROW_HEIGHT,
                  transform: `translateY(${item.start}px)`,
                  cursor: 'pointer',
                  borderBottom: 1,
                  borderColor: 'divider',
                  bgcolor: selected ? 'rgba(var(--mui-palette-primary-mainChannel) / 0.08)' : 'transparent',
                  boxShadow: selected ? 'inset 3px 0 0 var(--mui-palette-primary-main)' : 'none',
                  '&:hover': { bgcolor: selected ? undefined : 'surface.subtle' },
                }}
              >
                {columns.map((column, index) => (
                  <Box key={column.id} role="gridcell" sx={cellSx(column, index)}>
                    {column.render(citizen)}
                  </Box>
                ))}
              </Stack>
            )
          })}
        </Box>

        {!loading && count === 0 && (
          <Box sx={{ position: 'absolute', inset: `${HEADER_HEIGHT}px 0 0` }}>
            <EmptyState
              icon={<SearchOffRoundedIcon sx={{ fontSize: 40, opacity: 0.5 }} />}
              title="Никого не нашли"
              description="Попробуйте ослабить условия фильтра или изменить запрос"
            />
          </Box>
        )}
      </Box>
    </Box>
  )
}
