/**
 * 图片网格组件
 * 展示日志中的图片，支持 Lightbox 放大查看
 */
'use client'

import { useState } from 'react'
import { X, ChevronLeft, ChevronRight, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Image } from '@/types/database'

interface ImageGridProps {
  images: Image[]
}

export default function ImageGrid({ images }: ImageGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)

  if (images.length === 0) return null

  // 打开 Lightbox
  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
    // 禁止背景滚动
    document.body.style.overflow = 'hidden'
  }

  // 关闭 Lightbox
  const closeLightbox = () => {
    setLightboxOpen(false)
    document.body.style.overflow = ''
  }

  // 上一张
  const prevImage = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  // 下一张
  const nextImage = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  // 下载图片
  const downloadImage = async (url: string, filename: string) => {
    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = blobUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(blobUrl)
    } catch (error) {
      console.error('下载失败:', error)
    }
  }

  // 根据图片数量决定网格布局
  const getGridClass = () => {
    switch (images.length) {
      case 1:
        return 'grid-cols-1'
      case 2:
        return 'grid-cols-2'
      case 3:
        return 'grid-cols-2'
      case 4:
        return 'grid-cols-2'
      default:
        return 'grid-cols-3'
    }
  }

  return (
    <>
      {/* 图片网格 */}
      <div className={`grid ${getGridClass()} gap-2 mt-3`}>
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`relative aspect-square overflow-hidden rounded-lg bg-foreground/5 cursor-pointer group ${
              images.length === 3 && index === 0 ? 'row-span-2' : ''
            }`}
            onClick={() => openLightbox(index)}
          >
            <img
              src={image.url}
              alt=""
              className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
              loading="lazy"
            />
            {/* 悬浮遮罩 */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={closeLightbox}
        >
          {/* 关闭按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={closeLightbox}
          >
            <X className="h-6 w-6" />
          </Button>

          {/* 下载按钮 */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-16 text-white hover:bg-white/20 z-10"
            onClick={(e) => {
              e.stopPropagation()
              downloadImage(images[currentIndex].url, `image-${currentIndex + 1}.jpg`)
            }}
          >
            <Download className="h-5 w-5" />
          </Button>

          {/* 图片计数 */}
          <div className="absolute top-4 left-4 text-white/80 text-sm">
            {currentIndex + 1} / {images.length}
          </div>

          {/* 上一张按钮 */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                prevImage()
              }}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {/* 图片 */}
          <img
            src={images[currentIndex].url}
            alt=""
            className="max-w-[90vw] max-h-[90vh] object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {/* 下一张按钮 */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 text-white hover:bg-white/20"
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}
        </div>
      )}
    </>
  )
}

