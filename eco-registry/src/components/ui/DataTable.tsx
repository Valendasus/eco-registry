import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material'
import type { ReactNode } from 'react'

export interface DataColumn<T> {
  key: string
  title: string
  align?: 'left' | 'right' | 'center'
  width?: number | string
  render: (row: T) => ReactNode
}

interface DataTableProps<T> {
  rows: T[]
  columns: DataColumn<T>[]
  rowKey: (row: T) => string
  onRowClick?: (row: T) => void
}

export function DataTable<T>({ rows, columns, rowKey, onRowClick }: DataTableProps<T>) {
  return (
    <TableContainer sx={{ border: 1, borderColor: 'divider', borderRadius: 3 }}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: 'surface.subtle' }}>
            {columns.map((column) => (
              <TableCell key={column.key} align={column.align} sx={{ width: column.width, py: 1.25 }}>
                {column.title}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={rowKey(row)}
              hover={!!onRowClick}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              sx={{ cursor: onRowClick ? 'pointer' : 'default', '&:last-child td': { borderBottom: 0 } }}
            >
              {columns.map((column) => (
                <TableCell key={column.key} align={column.align} sx={{ py: 1.25, fontSize: 13 }}>
                  {column.render(row)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
