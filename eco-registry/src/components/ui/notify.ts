import type { AlertColor } from '@mui/material'
import { createContext, useContext } from 'react'

export type Notify = (message: string, severity?: AlertColor) => void

export const NotifyContext = createContext<Notify>(() => undefined)

export const useNotify = () => useContext(NotifyContext)
