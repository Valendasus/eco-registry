import { Alert, Snackbar, type AlertColor } from '@mui/material'
import { useCallback, useState, type ReactNode } from 'react'
import { NotifyContext, type Notify } from './notify'

export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<{ key: number; message: string; severity: AlertColor } | null>(null)

  const notify = useCallback<Notify>((message, severity = 'success') => {
    setState({ key: Date.now(), message, severity })
  }, [])

  return (
    <NotifyContext.Provider value={notify}>
      {children}
      <Snackbar
        key={state?.key}
        open={!!state}
        autoHideDuration={3500}
        onClose={() => setState(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={state?.severity} variant="filled" onClose={() => setState(null)} sx={{ borderRadius: 3 }}>
          {state?.message}
        </Alert>
      </Snackbar>
    </NotifyContext.Provider>
  )
}
