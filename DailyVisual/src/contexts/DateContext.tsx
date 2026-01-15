/**
 * 日期上下文
 * 管理全局选中的日期状态
 */
'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface DateContextType {
  selectedDate: Date
  setSelectedDate: (date: Date) => void
}

const DateContext = createContext<DateContextType | undefined>(undefined)

export function DateProvider({ children }: { children: ReactNode }) {
  // 默认选中今天
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  return (
    <DateContext.Provider value={{ selectedDate, setSelectedDate }}>
      {children}
    </DateContext.Provider>
  )
}

export function useDate() {
  const context = useContext(DateContext)
  if (context === undefined) {
    throw new Error('useDate must be used within a DateProvider')
  }
  return context
}

