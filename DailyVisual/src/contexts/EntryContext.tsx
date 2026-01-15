/**
 * 日志上下文
 * 管理发布对话框状态和刷新触发
 */
'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'

interface EntryContextType {
  dialogOpen: boolean
  openDialog: () => void
  closeDialog: () => void
  refreshKey: number
  triggerRefresh: () => void
}

const EntryContext = createContext<EntryContextType | undefined>(undefined)

export function EntryProvider({ children }: { children: ReactNode }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const openDialog = useCallback(() => setDialogOpen(true), [])
  const closeDialog = useCallback(() => setDialogOpen(false), [])
  const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  return (
    <EntryContext.Provider
      value={{
        dialogOpen,
        openDialog,
        closeDialog,
        refreshKey,
        triggerRefresh,
      }}
    >
      {children}
    </EntryContext.Provider>
  )
}

export function useEntry() {
  const context = useContext(EntryContext)
  if (context === undefined) {
    throw new Error('useEntry must be used within an EntryProvider')
  }
  return context
}

