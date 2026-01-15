/**
 * 图片网格组件
 * 展示日志中的图片，支持 Lightbox 放大查看
 * 移动端支持长按保存图片
 */
'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight, Download, Trash2, Share2, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Image } from '@/types/database'

interface ImageGridProps {
  images: Image[]
  canDelete?: boolean
  onDeleteImage?: (imageId: string, storagePath: string) => void
}

export default function ImageGrid({ images, canDelete = false, onDeleteImage }: ImageGridProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [downloading, setDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // 检测是否为移动端
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/iPhone|iPad|iPod|Android/i.test(navigator.userAgent))
    }
    checkMobile()
  }, [])

  if (images.length === 0) return null

  // 打开 Lightbox
  const openLightbox = (index: number) => {
    setCurrentIndex(index)
    setLightboxOpen(true)
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

  // 下载单张图片
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

  // 下载所有图片（桌面端）
  const downloadAllImages = async () => {
    setDownloading(true)
    try {
      for (let i = 0; i < images.length; i++) {
        await downloadImage(images[i].url, `分享图片-${i + 1}.jpg`)
        await new Promise(resolve => setTimeout(resolve, 300))
      }
      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 2000)
    } catch (error) {
      console.error('批量下载失败:', error)
    } finally {
      setDownloading(false)
    }
  }

  // 删除图片
  const handleDeleteImage = (e: React.MouseEvent, image: Image) => {
    e.stopPropagation()
    if (onDeleteImage) {
      const confirmed = window.confirm('确定要删除这张图片吗？')
      if (confirmed) {
        onDeleteImage(image.id, image.storage_path)
      }
    }
  }

  // 渲染单张图片
  const renderImage = (image: Image, index: number, className: string = '') => (
    <div
      key={image.id}
      className={`relative overflow-hidden rounded-lg bg-foreground/5 cursor-pointer group ${className}`}
      onClick={() => openLightbox(index)}
    >
      <img
        src={image.url}
        alt=""
        className="w-full h-full object-contain transition-transform duration-200 group-hover:scale-[1.02]"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors pointer-events-none" />
      
      {/* 删除按钮（仅作者可见，桌面端悬浮显示） */}
      {canDelete && onDeleteImage && !isMobile && (
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-2 right-2 h-7 w-7 rounded-full bg-black/50 hover:bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => handleDeleteImage(e, image)}
        >
          <X className="h-4 w-4" />
        </Button>
      )}
    </div>
  )

  // 渲染 Lightbox
  function renderLightbox() {
    if (!lightboxOpen) return null

    return (
      <div
        className="fixed inset-0 z-[100] bg-black flex flex-col"
        onClick={closeLightbox}
      >
        {/* 顶部工具栏 */}
        <div className="flex items-center justify-between p-4 z-10">
          {/* 图片计数 */}
          <div className="text-white/80 text-sm">
            {currentIndex + 1} / {images.length}
          </div>

          {/* 操作按钮 */}
          <div className="flex items-center gap-2">
            {/* 桌面端：保存所有图片按钮 */}
            {!isMobile && images.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20 gap-2"
                onClick={(e) => {
                  e.stopPropagation()
                  downloadAllImages()
                }}
                disabled={downloading}
              >
                {downloadSuccess ? (
                  <>
                    <Check className="h-4 w-4 text-green-400" />
                    <span className="text-green-400">已保存</span>
                  </>
                ) : downloading ? (
                  <>
                    <Download className="h-4 w-4 animate-bounce" />
                    保存中...
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    保存全部
                  </>
                )}
              </Button>
            )}

            {/* 桌面端：下载当前图片 */}
            {!isMobile && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={(e) => {
                  e.stopPropagation()
                  downloadImage(
                    images[currentIndex].url,
                    `图片-${currentIndex + 1}.jpg`
                  )
                }}
              >
                <Download className="h-5 w-5" />
              </Button>
            )}

            {/* 删除当前图片 */}
            {canDelete && onDeleteImage && (
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-red-500/80"
                onClick={(e) => {
                  e.stopPropagation()
                  const image = images[currentIndex]
                  const confirmed = window.confirm('确定要删除这张图片吗？')
                  if (confirmed) {
                    onDeleteImage(image.id, image.storage_path)
                    if (images.length === 1) {
                      closeLightbox()
                    } else if (currentIndex >= images.length - 1) {
                      setCurrentIndex(currentIndex - 1)
                    }
                  }
                }}
              >
                <Trash2 className="h-5 w-5" />
              </Button>
            )}

            {/* 关闭按钮 */}
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={closeLightbox}
            >
              <X className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* 图片区域 - 移动端可以长按保存 */}
        <div 
          className="flex-1 flex items-center justify-center relative px-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* 上一张按钮 */}
          {images.length > 1 && !isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-4 text-white hover:bg-white/20 z-10"
              onClick={(e) => {
                e.stopPropagation()
                prevImage()
              }}
            >
              <ChevronLeft className="h-8 w-8" />
            </Button>
          )}

          {/* 图片 - 移动端使用 a 标签包裹，方便长按保存 */}
          {isMobile ? (
            <a 
              href={images[currentIndex].url} 
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.preventDefault()}
              className="block"
            >
              <img
                src={images[currentIndex].url}
                alt="长按图片保存"
                className="max-w-full max-h-[70vh] object-contain select-none"
                style={{ 
                  WebkitTouchCallout: 'default',
                  WebkitUserSelect: 'none',
                }}
              />
            </a>
          ) : (
            <img
              src={images[currentIndex].url}
              alt=""
              className="max-w-full max-h-[70vh] object-contain"
            />
          )}

          {/* 下一张按钮 */}
          {images.length > 1 && !isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-4 text-white hover:bg-white/20 z-10"
              onClick={(e) => {
                e.stopPropagation()
                nextImage()
              }}
            >
              <ChevronRight className="h-8 w-8" />
            </Button>
          )}
        </div>

        {/* 移动端：左右切换按钮 */}
        {isMobile && images.length > 1 && (
          <div className="p-4">
            <div className="flex justify-center gap-4">
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white/30 bg-white/10"
                onClick={(e) => {
                  e.stopPropagation()
                  prevImage()
                }}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                上一张
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-white border-white/30 bg-white/10"
                onClick={(e) => {
                  e.stopPropagation()
                  nextImage()
                }}
              >
                下一张
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // 单张图片布局
  if (images.length === 1) {
    return (
      <>
        <div>
          {renderImage(images[0], 0, '')}
        </div>
        {renderLightbox()}
      </>
    )
  }

  // 两张图片布局
  if (images.length === 2) {
    return (
      <>
        <div className="grid grid-cols-2 gap-2">
          {images.map((image, index) => (
            <div key={image.id} className="aspect-[4/3]">
              {renderImage(image, index, 'h-full')}
            </div>
          ))}
        </div>
        {renderLightbox()}
      </>
    )
  }

  // 三张及以上图片布局
  const getGridClass = () => {
    if (images.length === 3) return 'grid-cols-3'
    if (images.length === 4) return 'grid-cols-2'
    return 'grid-cols-3'
  }

  return (
    <>
      <div className={`grid ${getGridClass()} gap-2`}>
        {images.map((image, index) => (
          <div key={image.id} className="aspect-square">
            {renderImage(image, index, 'h-full')}
          </div>
        ))}
      </div>
      {renderLightbox()}
    </>
  )
}
