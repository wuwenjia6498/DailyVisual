/**
 * 日志上下文
 * 管理发布对话框状态、编辑模式和刷新触发
 */
'use client'

import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { EntryWithDetails } from '@/types/database'

interface EntryContextType {
  dialogOpen: boolean
  editEntry: EntryWithDetails | null
  openDialog: () => void
  openEditDialog: (entry: EntryWithDetails) => void
  closeDialog: () => void
  refreshKey: number
  triggerRefresh: () => void
}

const EntryContext = createContext<EntryContextType | undefined>(undefined)

export function EntryProvider({ children }: { children: ReactNode }) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editEntry, setEditEntry] = useState<EntryWithDetails | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  const openDialog = useCallback(() => {
    setEditEntry(null)
    setDialogOpen(true)
  }, [])

  const openEditDialog = useCallback((entry: EntryWithDetails) => {
    setEditEntry(entry)
    setDialogOpen(true)
  }, [])

  const closeDialog = useCallback(() => {
    setDialogOpen(false)
    setEditEntry(null)
  }, [])

  const triggerRefresh = useCallback(() => setRefreshKey((k) => k + 1), [])

  return (
    <EntryContext.Provider
      value={{
        dialogOpen,
        editEntry,
        openDialog,
        openEditDialog,
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

