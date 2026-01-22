/**
 * 移动端头部
 * 包含日期选择器和用户菜单
 */
'use client'

import { useState, useEffect } from 'react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { CalendarIcon, Menu, LogOut } from 'lucide-react'
import { useDate } from '@/contexts/DateContext'
import { useEntry } from '@/contexts/EntryContext'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { getDayNote } from '@/utils/getDayNote'

interface MobileHeaderProps {
  displayName: string
}

export default function MobileHeader({ displayName }: MobileHeaderProps) {
  const { selectedDate, setSelectedDate } = useDate()
  const { refreshKey } = useEntry()
  const [calendarOpen, setCalendarOpen] = useState(false)
  const [datesWithContent, setDatesWithContent] = useState<Date[]>([])
  const router = useRouter()

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

  // 获取星期几和备注
  const weekDay = format(selectedDate, 'EEEE', { locale: zhCN })
  const dayNote = getDayNote(selectedDate)

  // ===== 临时禁用登出功能 =====
  // 处理登出
  const handleLogout = async () => {
    // const supabase = createClient()
    // await supabase.auth.signOut()
    // router.push('/login')
    // router.refresh()
    alert('登录功能已临时禁用')
  }
  // ===== 结束：临时禁用登出功能 =====

  return (
    <header className="lg:hidden sticky top-0 z-50 bg-background border-b border-foreground/10">
      <div className="flex items-center justify-between h-14 px-4">
        {/* 左侧：菜单按钮 */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="shrink-0">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-foreground flex items-center justify-center">
                  <svg
                    className="w-4 h-4 text-background"
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
                DailyVisual
              </SheetTitle>
            </SheetHeader>
            
            {/* 日历 */}
            <div className="mt-6">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-md border border-foreground/10"
                locale={zhCN}
                modifiers={{
                  hasContent: datesWithContent,
                }}
              />
            </div>

            {/* 用户信息 & 登出 */}
            <div className="absolute bottom-6 left-6 right-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-medium">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm">{displayName}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="text-muted-foreground"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* 中间：日期选择器 + 备注 */}
        <div className="flex flex-col items-center">
          <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="font-semibold text-base gap-2 h-auto py-1"
              >
                <CalendarIcon className="h-4 w-4" />
                {format(selectedDate, 'M月d日', { locale: zhCN })} {weekDay}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => {
                  if (date) {
                    setSelectedDate(date)
                    setCalendarOpen(false)
                  }
                }}
                locale={zhCN}
                modifiers={{
                  hasContent: datesWithContent,
                }}
              />
            </PopoverContent>
          </Popover>
          {/* 备注 */}
          <span className="text-xs text-muted-foreground">{dayNote}</span>
        </div>

        {/* 右侧：占位（保持对称） */}
        <div className="w-10" />
      </div>
    </header>
  )
}
