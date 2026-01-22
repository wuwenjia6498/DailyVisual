/**
 * 桌面端头部
 * 显示当前日期、星期、备注和用户操作
 */
'use client'

import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Plus, LogOut } from 'lucide-react'
import { useDate } from '@/contexts/DateContext'
import { useEntry } from '@/contexts/EntryContext'
import { Button } from '@/components/ui/button'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { getDayNote } from '@/utils/getDayNote'

interface DesktopHeaderProps {
  displayName: string
}

export default function DesktopHeader({ displayName }: DesktopHeaderProps) {
  const { selectedDate } = useDate()
  const { openDialog } = useEntry()
  const router = useRouter()

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
    <header className="hidden lg:flex items-center justify-between h-16 px-6 border-b border-foreground/10 sticky top-0 bg-background z-10">
      {/* 左侧：当前日期 */}
      <div className="flex items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold">
            {format(selectedDate, 'yyyy年M月d日', { locale: zhCN })}
          </h2>
          <p className="text-sm text-muted-foreground">
            {weekDay}
          </p>
        </div>
        {/* 备注标签 */}
        <div className="px-3 py-1 bg-foreground/5 rounded-full">
          <span className="text-sm text-muted-foreground">{dayNote}</span>
        </div>
      </div>

      {/* 右侧：操作按钮 */}
      <div className="flex items-center gap-3">
        {/* 添加记录按钮 */}
        <Button className="gap-2" onClick={openDialog}>
          <Plus className="h-4 w-4" />
          添加记录
        </Button>

        {/* 用户信息 */}
        <div className="flex items-center gap-3 pl-3 border-l border-foreground/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-medium">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm">{displayName}</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  )
}
