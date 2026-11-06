import type { AppealPriority, AppealStatus, CitizenStatus } from '../../entities/citizen/types'
import { APPEAL_PRIORITIES, APPEAL_STATUSES, CITIZEN_STATUSES } from '../../entities/citizen/dictionaries'
import { ToneChip } from './ToneChip'

export const CitizenStatusChip = ({ status }: { status: CitizenStatus }) => (
  <ToneChip tone={CITIZEN_STATUSES[status].tone} label={CITIZEN_STATUSES[status].label} />
)

export const AppealStatusChip = ({ status }: { status: AppealStatus }) => (
  <ToneChip tone={APPEAL_STATUSES[status].tone} label={APPEAL_STATUSES[status].label} />
)

export const PriorityChip = ({ priority }: { priority: AppealPriority }) => (
  <ToneChip tone={APPEAL_PRIORITIES[priority].tone} label={APPEAL_PRIORITIES[priority].label} variant="outlined" sx={{ bgcolor: 'transparent', borderColor: 'currentColor' }} />
)
