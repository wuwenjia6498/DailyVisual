/**
 * 创建日志对话框
 * 包含文本输入和图片上传
 */
'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { zhCN } from 'date-fns/locale'
import { Loader2 } from 'lucide-react'
import { useDate } from '@/contexts/DateContext'
import { createClient } from '@/utils/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ImageUploader from './ImageUploader'

interface CreateEntryDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  userId: string
  onSuccess?: () => void
}

export default function CreateEntryDialog({
  open,
  onOpenChange,
  userId,
  onSuccess,
}: CreateEntryDialogProps) {
  const { selectedDate } = useDate()
  const [content, setContent] = useState('')
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(false)

  // 重置表单
  const resetForm = () => {
    setContent('')
    setImages([])
  }

  // 上传单张图片到 Storage
  const uploadImage = async (file: File, entryId: string): Promise<{ url: string; path: string } | null> => {
    const supabase = createClient()
    
    // 生成唯一文件名
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const ext = file.name.split('.').pop() || 'jpg'
    const fileName = `${userId}/${entryId}/${timestamp}-${randomStr}.${ext}`

    // 上传到 Storage
    const { error } = await supabase.storage
      .from('images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false,
      })

    if (error) {
      console.error('图片上传失败:', error)
      return null
    }

    // 获取公开 URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(fileName)

    return { url: publicUrl, path: fileName }
  }

  // 提交表单
  const handleSubmit = async () => {
    // 验证
    if (!content.trim() && images.length === 0) {
      alert('请输入内容或添加图片')
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()
      const dateStr = format(selectedDate, 'yyyy-MM-dd')

      // 1. 创建日志条目
      const { data: entry, error: entryError } = await supabase
        .from('entries')
        .insert({
          user_id: userId,
          content: content.trim(),
          date: dateStr,
        })
        .select()
        .single()

      if (entryError || !entry) {
        throw new Error('创建日志失败')
      }

      // 2. 上传图片并创建记录
      if (images.length > 0) {
        const uploadPromises = images.map((file) => uploadImage(file, entry.id))
        const uploadResults = await Promise.all(uploadPromises)

        // 过滤成功上传的图片
        const successfulUploads = uploadResults.filter(
          (result): result is { url: string; path: string } => result !== null
        )

        // 批量插入图片记录
        if (successfulUploads.length > 0) {
          const imageRecords = successfulUploads.map((upload) => ({
            entry_id: entry.id,
            url: upload.url,
            storage_path: upload.path,
          }))

          const { error: imageError } = await supabase
            .from('images')
            .insert(imageRecords)

          if (imageError) {
            console.error('图片记录创建失败:', imageError)
          }
        }
      }

      // 3. 成功处理
      resetForm()
      onOpenChange(false)
      onSuccess?.()
    } catch (error) {
      console.error('发布失败:', error)
      alert('发布失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>添加记录</DialogTitle>
          <DialogDescription>
            记录 {format(selectedDate, 'M月d日 EEEE', { locale: zhCN })} 的内容
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* 文本输入 */}
          <Textarea
            placeholder="写点什么..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="min-h-[120px] resize-none"
            disabled={loading}
          />

          {/* 图片上传 */}
          <ImageUploader
            images={images}
            onChange={setImages}
            maxImages={9}
          />
        </div>

        {/* 底部按钮 */}
        <div className="flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading || (!content.trim() && images.length === 0)}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                发布中...
              </>
            ) : (
              '发布'
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

