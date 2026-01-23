/**
 * 图片上传器组件
 * 支持拖拽上传（桌面端）和点击选择（移动端）
 * 预览图片完整显示
 * 支持编辑模式：显示已存在的图片
 */
'use client'

import { useCallback, useState } from 'react'
import { ImagePlus, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Image } from '@/types/database'

// 图片项类型：可以是新上传的文件或已存在的图片
export type ImageItem = File | Image

interface ImageUploaderProps {
  images: ImageItem[]
  onChange: (images: ImageItem[]) => void
  maxImages?: number
  onDeleteExisting?: (imageId: string, storagePath: string) => Promise<void>
}

export default function ImageUploader({
  images,
  onChange,
  maxImages = 9,
  onDeleteExisting,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  // 判断是否为已存在的图片
  const isExistingImage = (item: ImageItem): item is Image => {
    return 'id' in item && 'url' in item
  }

  // 处理文件选择
  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return

      const newFiles = Array.from(files).filter((file) => {
        // 只接受图片文件
        if (!file.type.startsWith('image/')) return false
        // 限制文件大小（10MB）
        if (file.size > 10 * 1024 * 1024) {
          alert('图片大小不能超过 10MB')
          return false
        }
        return true
      })

      // 限制总数量
      const combined = [...images, ...newFiles].slice(0, maxImages)
      onChange(combined)
    },
    [images, onChange, maxImages]
  )

  // 处理拖拽
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      handleFileSelect(e.dataTransfer.files)
    },
    [handleFileSelect]
  )

  // 移除图片
  const removeImage = useCallback(
    async (index: number) => {
      const image = images[index]
      
      // 如果是已存在的图片，调用删除回调
      if (isExistingImage(image)) {
        if (onDeleteExisting) {
          setDeletingIds(prev => new Set(prev).add(image.id))
          try {
            await onDeleteExisting(image.id, image.storage_path)
            const newImages = images.filter((_, i) => i !== index)
            onChange(newImages)
          } catch (error) {
            console.error('删除图片失败:', error)
            alert('删除失败，请重试')
          } finally {
            setDeletingIds(prev => {
              const next = new Set(prev)
              next.delete(image.id)
              return next
            })
          }
        }
      } else {
        // 新上传的文件，直接从列表移除
        const newImages = images.filter((_, i) => i !== index)
        onChange(newImages)
      }
    },
    [images, onChange, onDeleteExisting]
  )

  // 生成预览 URL
  const getPreviewUrl = (item: ImageItem) => {
    return isExistingImage(item) ? item.url : URL.createObjectURL(item)
  }

  // 根据图片数量决定网格布局
  const getGridClass = () => {
    if (images.length === 1) return 'grid-cols-1'
    if (images.length === 2) return 'grid-cols-2'
    return 'grid-cols-3'
  }

  return (
    <div className="space-y-3">
      {/* 已选图片预览 */}
      {images.length > 0 && (
        <div className={`grid ${getGridClass()} gap-2`}>
          {images.map((item, index) => {
            const isDeleting = isExistingImage(item) && deletingIds.has(item.id)
            return (
              <div
                key={isExistingImage(item) ? item.id : index}
                className={`relative rounded-lg overflow-hidden bg-foreground/5 ${
                  images.length === 1 ? '' : 'aspect-square'
                } ${isDeleting ? 'opacity-50' : ''}`}
              >
                <img
                  src={getPreviewUrl(item)}
                  alt={`预览 ${index + 1}`}
                  className={`w-full object-contain ${
                    images.length === 1 
                      ? 'h-auto max-h-[200px]' 
                      : 'h-full'
                  }`}
                />
                {/* 删除按钮 */}
                <Button
                  type="button"
                  variant="secondary"
                  size="icon"
                  className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/50 hover:bg-black/70 text-white"
                  onClick={() => removeImage(index)}
                  disabled={isDeleting}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            )
          })}
        </div>
      )}

      {/* 上传区域 */}
      {images.length < maxImages && (
        <div
          className={`
            relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer
            transition-colors duration-200
            ${
              isDragging
                ? 'border-foreground bg-foreground/5'
                : 'border-foreground/20 hover:border-foreground/40'
            }
          `}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('image-input')?.click()}
        >
          <input
            id="image-input"
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <ImagePlus className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground">
            <span className="hidden lg:inline">拖拽图片到此处，或</span>
            <span className="text-foreground font-medium">点击选择</span>
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            最多 {maxImages} 张，单张不超过 10MB
          </p>
        </div>
      )}
    </div>
  )
}
