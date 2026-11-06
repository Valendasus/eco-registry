import { createContext, useContext } from 'react'

export const FieldModeContext = createContext({ editing: true })

export const useFieldMode = () => useContext(FieldModeContext)
