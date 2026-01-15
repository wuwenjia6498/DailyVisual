/**
 * 移动端悬浮操作按钮 (FAB)
 * 用于添加新记录
 */
'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEntry } from '@/contexts/EntryContext'

export default function FloatingActionButton() {
  const { openDialog } = useEntry()

  return (
    <Button
      onClick={openDialog}
      size="icon"
      className="lg:hidden fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50"
    >
      <Plus className="h-6 w-6" />
    </Button>
  )
}
