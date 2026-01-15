/**
 * 日志卡片组件
 * 展示单条日志的完整内容
 */
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Copy, Check, MoreHorizontal, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import ImageGrid from './ImageGrid'
import { linkifyText } from '@/utils/linkify'
import type { EntryWithDetails } from '@/types/database'

interface EntryCardProps {
  entry: EntryWithDetails
  currentUserId: string
  onDelete?: (entryId: string) => void
}

export default function EntryCard({ entry, currentUserId, onDelete }: EntryCardProps) {
  const [copied, setCopied] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  // 是否为当前用户的日志
  const isOwner = entry.user_id === currentUserId

  // 复制文本
  const handleCopyText = async () => {
    try {
      await navigator.clipboard.writeText(entry.content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  // 删除日志
  const handleDelete = () => {
    if (onDelete) {
      onDelete(entry.id)
    }
    setMenuOpen(false)
  }

  // 格式化时间
  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return format(date, 'HH:mm', { locale: zhCN })
  }

  return (
    <Card className="border border-foreground/10 hover:border-foreground/20 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          {/* 用户信息 */}
          <div className="flex items-center gap-3">
            {/* 头像 */}
            <div className="w-10 h-10 rounded-full bg-foreground/10 flex items-center justify-center text-sm font-medium">
              {entry.profiles.avatar_url ? (
                <img
                  src={entry.profiles.avatar_url}
                  alt={entry.profiles.display_name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                entry.profiles.display_name.charAt(0).toUpperCase()
              )}
            </div>
            {/* 名称和时间 */}
            <div>
              <p className="font-medium text-sm">{entry.profiles.display_name}</p>
              <p className="text-xs text-muted-foreground">
                {formatTime(entry.created_at)}
              </p>
            </div>
          </div>

          {/* 操作菜单 */}
          <div className="flex items-center gap-1">
            {/* 复制按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              onClick={handleCopyText}
            >
              {copied ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>

            {/* 更多操作（仅限日志所有者） */}
            {isOwner && (
              <Popover open={menuOpen} onOpenChange={setMenuOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-foreground"
                  >
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-40 p-1" align="end">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除
                  </Button>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* 文本内容 */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
          {linkifyText(entry.content)}
        </div>

        {/* 图片网格 */}
        {entry.images && entry.images.length > 0 && (
          <ImageGrid images={entry.images} />
        )}
      </CardContent>
    </Card>
  )
}

