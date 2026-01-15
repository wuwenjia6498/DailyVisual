/**
 * 桌面端侧边栏
 * 包含日历组件，用于选择日期
 */
'use client'

import Image from 'next/image'
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
    <aside className="hidden lg:flex flex-col w-80 border-r border-foreground/10 h-screen sticky top-0">
      {/* Logo 区域 */}
      <div className="p-6 border-b border-foreground/10">
        <div className="flex items-center gap-3">
          {/* Logo 图片 */}
          <Image
            src="/logo-1.jpg"
            alt="Logo"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <h1 className="font-bold text-lg">DailyVisual</h1>
            <p className="text-xs text-muted-foreground">每日分享素材</p>
          </div>
        </div>
      </div>

      {/* 日历区域 */}
      <div className="flex-1 px-4 py-4">
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
          className="w-full"
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

