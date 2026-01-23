/**
 * 仪表板布局组件
 * 响应式设计：桌面端左右分栏，移动端单栏
 */
'use client'

import { ReactNode } from 'react'
import { DateProvider } from '@/contexts/DateContext'
import { EntryProvider, useEntry } from '@/contexts/EntryContext'
import Sidebar from './Sidebar'
import MobileHeader from './MobileHeader'
import DesktopHeader from './DesktopHeader'
import CreateEntryDialog from './CreateEntryDialog'

interface DashboardLayoutProps {
  children: ReactNode
  displayName: string
  userId: string
}

// 内部布局组件（使用 EntryContext）
function LayoutContent({
  children,
  displayName,
  userId,
}: DashboardLayoutProps) {
  const { dialogOpen, editEntry, closeDialog, triggerRefresh } = useEntry()

  return (
    <div className="min-h-screen bg-background">
      {/* 移动端头部 */}
      <MobileHeader displayName={displayName} />

      <div className="flex">
        {/* 桌面端侧边栏 */}
        <Sidebar displayName={displayName} />

        {/* 主内容区 */}
        <main className="flex-1 min-h-screen">
          {/* 桌面端头部 */}
          <DesktopHeader displayName={displayName} />

          {/* 内容区 */}
          <div className="p-4 lg:p-6">{children}</div>
        </main>
      </div>

      {/* 发布/编辑对话框 */}
      <CreateEntryDialog
        open={dialogOpen}
        onOpenChange={(open) => !open && closeDialog()}
        userId={userId}
        onSuccess={triggerRefresh}
        editEntry={editEntry || undefined}
      />
    </div>
  )
}

export default function DashboardLayout(props: DashboardLayoutProps) {
  return (
    <DateProvider>
      <EntryProvider>
        <LayoutContent {...props} />
      </EntryProvider>
    </DateProvider>
  )
}
