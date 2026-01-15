/**
 * 桌面端侧边栏
 * 包含日历组件，用于选择日期
 */
'use client'

import { Calendar } from '@/components/ui/calendar'
import { useDate } from '@/contexts/DateContext'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface SidebarProps {
  displayName: string
}

export default function Sidebar({ displayName }: SidebarProps) {
  const { selectedDate, setSelectedDate } = useDate()

  return (
    <aside className="hidden lg:flex flex-col w-72 border-r border-foreground/10 h-screen sticky top-0">
      {/* Logo 区域 */}
      <div className="p-6 border-b border-foreground/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
            <svg
              className="w-5 h-5 text-background"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
          </div>
          <div>
            <h1 className="font-bold text-lg">DailyVisual</h1>
            <p className="text-xs text-muted-foreground">团队视觉日志</p>
          </div>
        </div>
      </div>

      {/* 日历区域 */}
      <div className="flex-1 p-4">
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">选中日期</p>
          <p className="text-xl font-semibold">
            {format(selectedDate, 'M月d日 EEEE', { locale: zhCN })}
          </p>
        </div>
        
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(date) => date && setSelectedDate(date)}
          className="rounded-md border border-foreground/10"
          locale={zhCN}
        />
      </div>

      {/* 用户信息区域 */}
      <div className="p-4 border-t border-foreground/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-medium">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm truncate">{displayName}</span>
        </div>
      </div>
    </aside>
  )
}

