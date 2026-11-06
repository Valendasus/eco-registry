import AccountBalanceWalletOutlinedIcon from '@mui/icons-material/AccountBalanceWalletOutlined'
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined'
import PeopleAltOutlinedIcon from '@mui/icons-material/PeopleAltOutlined'
import TaskAltRoundedIcon from '@mui/icons-material/TaskAltRounded'
import { Alert, Button, Grid, Skeleton } from '@mui/material'
import { Link } from 'react-router'
import { useDashboardStats } from '../../api/hooks'
import { CURRENT_USER } from '../../app/currentUser'
import { PageHeader } from '../../components/ui/PageHeader'
import { dayjs } from '../../lib/date'
import { formatCompactMoney, formatNumber } from '../../lib/format'
import { useChartPalette } from '../../lib/useChartPalette'
import { AgePyramid } from './widgets/AgePyramid'
import { AppealsDynamics } from './widgets/AppealsDynamics'
import { CategoriesCard } from './widgets/CategoriesCard'
import { ChannelsDonut } from './widgets/ChannelsDonut'
import { DistrictsTable } from './widgets/DistrictsTable'
import { ExecutorsCard } from './widgets/ExecutorsCard'
import { KpiCard } from './widgets/KpiCard'
import { RecentAppeals } from './widgets/RecentAppeals'
import { TopicsChart } from './widgets/TopicsChart'

const growth = (current: number, previous: number) => (previous ? (current - previous) / previous : 0)

const greeting = () => {
  const hour = dayjs().hour()
  if (hour < 6) return 'Доброй ночи'
  if (hour < 12) return 'Доброе утро'
  if (hour < 18) return 'Добрый день'
  return 'Добрый вечер'
}

function DashboardSkeleton() {
  return (
    <Grid container spacing={2.5}>
      {[3, 3, 3, 3, 8, 4, 4, 4, 4].map((size, index) => (
        <Grid key={index} size={{ xs: 12, sm: size === 3 ? 6 : 12, lg: size }}>
          <Skeleton variant="rounded" height={size === 3 ? 170 : 360} sx={{ borderRadius: 4 }} />
        </Grid>
      ))}
    </Grid>
  )
}

export function DashboardPage() {
  const { data: stats, isLoading, isError } = useDashboardStats()
  const colors = useChartPalette()

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${CURRENT_USER.name.split(' ')[0]}`}
        subtitle={`Сводка по реестру граждан и обращениям на ${dayjs().format('D MMMM YYYY')}`}
        actions={
          <>
            <Button component={Link} to="/citizens/new" variant="outlined" color="inherit" sx={{ borderColor: 'divider' }}>
              Новая карточка
            </Button>
            <Button component={Link} to="/citizens" variant="contained">
              Открыть картотеку
            </Button>
          </>
        }
      />

      {isError && <Alert severity="error">Не удалось загрузить статистику</Alert>}
      {isLoading && <DashboardSkeleton />}

      {stats && (
        <Grid container spacing={2.5}>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              label="Граждан на учёте"
              value={formatNumber(stats.citizens.active)}
              caption={`+${formatNumber(stats.citizens.newLast30)} за 30 дней`}
              delta={growth(stats.citizens.newLast30, stats.citizens.newPrev30)}
              icon={<PeopleAltOutlinedIcon />}
              color={colors.primary}
              trend={stats.citizens.registrations.map((item) => item.count)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              label="Обращений за 30 дней"
              value={formatNumber(stats.appeals.last30)}
              caption={`${formatNumber(stats.appeals.open)} в работе, ${formatNumber(stats.appeals.overdue)} просрочено`}
              delta={growth(stats.appeals.last30, stats.appeals.prev30)}
              invertDelta
              icon={<ForumOutlinedIcon />}
              color={colors.secondary}
              trend={stats.appeals.daily.map((item) => item.count)}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              label="Решено в срок"
              value={`${(stats.appeals.onTimeRate * 100).toFixed(1).replace('.', ',')}%`}
              caption={`Среднее время ответа ${stats.appeals.avgResolutionDays.toFixed(1).replace('.', ',')} дн. · оценка ${stats.appeals.avgRating.toFixed(1).replace('.', ',')}`}
              icon={<TaskAltRoundedIcon />}
              color={colors.success}
              trend={stats.appeals.byMonth.map((month) => (month.received ? month.resolved / month.received : 0))}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
            <KpiCard
              label="Задолженность населения"
              value={formatCompactMoney(stats.citizens.debtTotal)}
              caption={`${formatNumber(stats.citizens.debtors)} должников · ${Math.round((stats.citizens.debtors / stats.citizens.total) * 100)}% лицевых счетов`}
              icon={<AccountBalanceWalletOutlinedIcon />}
              color={colors.warning}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 8 }}>
            <AppealsDynamics months={stats.appeals.byMonth} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <ChannelsDonut channels={stats.appeals.byChannel} />
          </Grid>

          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <TopicsChart topics={stats.appeals.byTopic} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <AgePyramid groups={stats.citizens.ageGender} />
          </Grid>
          <Grid size={{ xs: 12, md: 6, lg: 4 }}>
            <CategoriesCard
              categories={stats.citizens.byCategory}
              statuses={stats.appeals.byStatus}
              total={stats.citizens.total}
              onTimeRate={stats.appeals.onTimeRate}
            />
          </Grid>

          <Grid size={{ xs: 12, lg: 7 }}>
            <DistrictsTable districts={stats.districts} />
          </Grid>
          <Grid size={{ xs: 12, lg: 5 }}>
            <ExecutorsCard executors={stats.appeals.executors} />
          </Grid>

          <Grid size={12}>
            <RecentAppeals appeals={stats.appeals.recent} />
          </Grid>
        </Grid>
      )}
    </>
  )
}
