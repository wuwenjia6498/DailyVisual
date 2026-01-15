/**
 * 日志内容流组件
 * 展示选中日期的所有日志条目
 */
'use client'

import { useEffect, useState, useCallback } from 'react'
import { useDate } from '@/contexts/DateContext'
import { useEntry } from '@/contexts/EntryContext'
import { createClient } from '@/utils/supabase/client'
import { format, isToday, isYesterday } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { FileText, Loader2 } from 'lucide-react'
import EntryCard from './EntryCard'
import type { EntryWithDetails } from '@/types/database'

interface EntryFeedProps {
  userId: string
}

export default function EntryFeed({ userId }: EntryFeedProps) {
  const { selectedDate } = useDate()
  const { refreshKey } = useEntry()
  const [entries, setEntries] = useState<EntryWithDetails[]>([])
  const [loading, setLoading] = useState(true)

  // 格式化日期显示
  const getDateLabel = (date: Date) => {
    if (isToday(date)) return '今天'
    if (isYesterday(date)) return '昨天'
    return format(date, 'M月d日', { locale: zhCN })
  }

  // 获取日志数据
  const fetchEntries = useCallback(async () => {
    setLoading(true)

    const supabase = createClient()
    const dateStr = format(selectedDate, 'yyyy-MM-dd')

    const { data, error } = await supabase
      .from('entries')
      .select(
        `
        *,
        profiles (*),
        images (*)
      `
      )
      .eq('date', dateStr)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取日志失败:', error)
      setEntries([])
    } else {
      setEntries(data as EntryWithDetails[])
    }

    setLoading(false)
  }, [selectedDate])

  // 当日期变化或 refreshKey 变化时重新获取数据
  useEffect(() => {
    fetchEntries()
  }, [fetchEntries, refreshKey])

  // 删除日志
  const handleDeleteEntry = async (entryId: string) => {
    const confirmed = window.confirm('确定要删除这条日志吗？')
    if (!confirmed) return

    const supabase = createClient()

    // 先获取关联的图片
    const { data: images } = await supabase
      .from('images')
      .select('storage_path')
      .eq('entry_id', entryId)

    // 删除 Storage 中的图片
    if (images && images.length > 0) {
      const paths = images.map((img) => img.storage_path)
      await supabase.storage.from('images').remove(paths)
    }

    // 删除日志（级联删除会自动删除 images 表记录）
    const { error } = await supabase.from('entries').delete().eq('id', entryId)

    if (error) {
      console.error('删除失败:', error)
      alert('删除失败，请重试')
    } else {
      // 更新本地状态
      setEntries((prev) => prev.filter((e) => e.id !== entryId))
    }
  }

  // 加载状态
  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          <p className="text-sm text-muted-foreground mt-4">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* 日期标题（移动端显示） */}
      <div className="lg:hidden mb-6">
        <h2 className="text-lg font-semibold">
          {getDateLabel(selectedDate)}的记录
        </h2>
        <p className="text-sm text-muted-foreground">
          共 {entries.length} 条记录
        </p>
      </div>

      {/* 日志列表 */}
      {entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map((entry) => (
            <EntryCard
              key={entry.id}
              entry={entry}
              currentUserId={userId}
              onDelete={handleDeleteEntry}
            />
          ))}
        </div>
      ) : (
        /* 空状态 */
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-full bg-foreground/5 flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">暂无记录</h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            {getDateLabel(selectedDate)}还没有任何日志，点击"添加记录"开始记录吧
          </p>
        </div>
      )}
    </div>
  )
}
