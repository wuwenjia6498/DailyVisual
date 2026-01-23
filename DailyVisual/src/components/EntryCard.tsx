/**
 * 日志卡片组件
 * 展示单条日志的完整内容
 * 支持删除图片
 */
'use client'

import { useState } from 'react'
import { Copy, Check, MoreHorizontal, Trash2, Pencil } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import ImageGrid from './ImageGrid'
import { linkifyText } from '@/utils/linkify'
import { createClient } from '@/utils/supabase/client'
import type { EntryWithDetails, Image } from '@/types/database'

interface EntryCardProps {
  entry: EntryWithDetails
  currentUserId: string
  onDelete?: (entryId: string) => void
  onEdit?: (entry: EntryWithDetails) => void
  onImageDeleted?: () => void
}

export default function EntryCard({ entry, currentUserId, onDelete, onEdit, onImageDeleted }: EntryCardProps) {
  const [copied, setCopied] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [images, setImages] = useState<Image[]>(entry.images || [])

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

  // 编辑日志
  const handleEdit = () => {
    if (onEdit) {
      // 传入当前日志的最新数据（包含更新后的图片列表）
      onEdit({
        ...entry,
        images: images,
      })
    }
    setMenuOpen(false)
  }

  // 删除日志
  const handleDelete = () => {
    if (onDelete) {
      onDelete(entry.id)
    }
    setMenuOpen(false)
  }

  // 删除单张图片
  const handleDeleteImage = async (imageId: string, storagePath: string) => {
    const supabase = createClient()

    // 删除 Storage 中的图片
    await supabase.storage.from('images').remove([storagePath])

    // 删除数据库记录
    const { error } = await supabase
      .from('images')
      .delete()
      .eq('id', imageId)

    if (error) {
      console.error('删除图片失败:', error)
      alert('删除失败，请重试')
    } else {
      // 更新本地状态
      setImages(prev => prev.filter(img => img.id !== imageId))
      onImageDeleted?.()
    }
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
            {/* 名称 */}
            <p className="font-medium text-sm">{entry.profiles.display_name}</p>
          </div>

          {/* 操作菜单 */}
          <div className="flex items-center gap-1">
            {/* 复制文本按钮 */}
            {entry.content && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={handleCopyText}
                title="复制文本"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            )}

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
                    className="w-full justify-start hover:bg-foreground/5"
                    onClick={handleEdit}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    编辑日志
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
                    onClick={handleDelete}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    删除日志
                  </Button>
                </PopoverContent>
              </Popover>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* 文本内容 */}
        {entry.content && (
          <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
            {linkifyText(entry.content)}
          </div>
        )}

        {/* 分隔线（文字和图片都存在时显示） */}
        {entry.content && images.length > 0 && (
          <div className="py-4">
            <div className="border-t border-dashed border-foreground/20" />
          </div>
        )}

        {/* 图片网格 */}
        {images.length > 0 && (
          <ImageGrid 
            images={images} 
            canDelete={isOwner}
            onDeleteImage={handleDeleteImage}
          />
        )}
      </CardContent>
    </Card>
  )
}
