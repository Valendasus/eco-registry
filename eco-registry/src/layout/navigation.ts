import DashboardRoundedIcon from '@mui/icons-material/SpaceDashboardRounded'
import PeopleAltRoundedIcon from '@mui/icons-material/PeopleAltRounded'
import PersonAddAlt1RoundedIcon from '@mui/icons-material/PersonAddAlt1Rounded'
import type { SvgIconComponent } from '@mui/icons-material'

export interface NavItem {
  label: string
  to: string
  icon: SvgIconComponent
  end?: boolean
}

export const NAVIGATION: { title: string; items: NavItem[] }[] = [
  {
    title: 'Обзор',
    items: [{ label: 'Главная', to: '/', icon: DashboardRoundedIcon, end: true }],
  },
  {
    title: 'Картотека',
    items: [
      { label: 'Граждане', to: '/citizens', icon: PeopleAltRoundedIcon, end: true },
      { label: 'Новая карточка', to: '/citizens/new', icon: PersonAddAlt1RoundedIcon },
    ],
  },
]
