/**
 * 根布局组件
 * 设置全局字体、元数据和主题
 */
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'

// 主字体：Geist Sans - 现代简洁
const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

// 等宽字体：Geist Mono - 代码展示
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

// 页面元数据
export const metadata: Metadata = {
  title: '老约翰每日分享素材',
  description: '老约翰的每日视觉素材分享平台',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}
