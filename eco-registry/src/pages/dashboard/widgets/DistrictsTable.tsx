import { Box, LinearProgress, Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'
import { useNavigate } from 'react-router'
import type { DistrictStats } from '../../../api/types'
import { DISTRICT_LABELS } from '../../../entities/citizen/dictionaries'
import { formatCompactMoney, formatNumber } from '../../../lib/format'
import { ChartCard } from './ChartCard'

export function DistrictsTable({ districts }: { districts: DistrictStats[] }) {
  const navigate = useNavigate()
  const shares = districts.map((district) => district.debtors / district.citizens)
  const maxShare = Math.max(...shares)
  const averageShare = shares.reduce((sum, share) => sum + share, 0) / shares.length

  return (
    <ChartCard title="Муниципальные образования" subtitle="Охват, платёжная дисциплина и нагрузка по обращениям">
      <Box sx={{ overflowX: 'auto', mx: -2.5 }}>
        <Table size="small" sx={{ minWidth: 560 }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ pl: 2.5 }}>Территория</TableCell>
              <TableCell align="right">Граждан</TableCell>
              <TableCell sx={{ width: '30%' }}>Доля должников</TableCell>
              <TableCell align="right">Долг</TableCell>
              <TableCell align="right" sx={{ pr: 2.5 }}>
                В работе
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {districts.map((district) => {
              const share = district.debtors / district.citizens
              return (
                <TableRow
                  key={district.districtId}
                  hover
                  sx={{ cursor: 'pointer', '&:last-child td': { borderBottom: 0 } }}
                  onClick={() => navigate('/citizens')}
                >
                  <TableCell sx={{ pl: 2.5, fontWeight: 600, fontSize: 13 }}>{DISTRICT_LABELS[district.districtId]}</TableCell>
                  <TableCell align="right" sx={{ fontSize: 13 }}>
                    {formatNumber(district.citizens)}
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <LinearProgress
                        variant="determinate"
                        value={(share / maxShare) * 100}
                        color={share > averageShare * 1.15 ? 'error' : share > averageShare ? 'warning' : 'primary'}
                        sx={{ flex: 1, bgcolor: 'surface.muted' }}
                      />
                      <Typography variant="caption" sx={{ width: 36, textAlign: 'right', fontWeight: 600 }}>
                        {Math.round(share * 100)}%
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell align="right" sx={{ fontSize: 13 }}>
                    {formatCompactMoney(district.debt)}
                  </TableCell>
                  <TableCell align="right" sx={{ pr: 2.5, fontSize: 13 }}>
                    {formatNumber(district.openAppeals)}
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </Box>
    </ChartCard>
  )
}
