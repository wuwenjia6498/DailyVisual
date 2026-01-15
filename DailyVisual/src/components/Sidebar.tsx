/**
 * 桌面端侧边栏
 * 包含日历组件，用于选择日期
 */
'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { Calendar } from '@/components/ui/calendar'
import { useDate } from '@/contexts/DateContext'
import { useEntry } from '@/contexts/EntryContext'
import { createClient } from '@/utils/supabase/client'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { zhCN } from 'date-fns/locale'

interface SidebarProps {
  displayName: string
}

export default function Sidebar({ displayName }: SidebarProps) {
  const { selectedDate, setSelectedDate } = useDate()
  const { refreshKey } = useEntry()
  const [datesWithContent, setDatesWithContent] = useState<Date[]>([])

  // 获取当月有内容的日期
  useEffect(() => {
    const fetchDatesWithContent = async () => {
      const supabase = createClient()
      const monthStart = format(startOfMonth(selectedDate), 'yyyy-MM-dd')
      const monthEnd = format(endOfMonth(selectedDate), 'yyyy-MM-dd')

      const { data } = await supabase
        .from('entries')
        .select('date')
        .gte('date', monthStart)
        .lte('date', monthEnd)

      if (data) {
        // 去重并转换为 Date 对象
        const uniqueDates = [...new Set(data.map(entry => entry.date))]
        setDatesWithContent(uniqueDates.map(d => new Date(d + 'T00:00:00')))
      }
    }

    fetchDatesWithContent()
  }, [selectedDate, refreshKey])

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
          modifiers={{
            hasContent: datesWithContent,
          }}
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

