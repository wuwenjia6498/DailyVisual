/**
 * URL 自动识别工具
 * 将文本中的 URL 转换为可点击的链接
 */
import { ReactNode } from 'react'

// URL 正则表达式
const URL_REGEX = /(https?:\/\/[^\s<]+[^<.,:;"')\]\s])/g

/**
 * 将文本中的 URL 转换为链接
 * @param text 原始文本
 * @returns 包含链接的 React 节点数组
 */
export function linkifyText(text: string): ReactNode[] {
  const parts = text.split(URL_REGEX)
  
  return parts.map((part, index) => {
    // 检查是否为 URL
    if (URL_REGEX.test(part)) {
      // 重置正则表达式状态
      URL_REGEX.lastIndex = 0
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 dark:text-blue-400 underline underline-offset-2 hover:opacity-80 break-all"
        >
          {truncateUrl(part)}
        </a>
      )
    }
    return part
  })
}

/**
 * 截断过长的 URL 显示
 */
function truncateUrl(url: string, maxLength: number = 50): string {
  if (url.length <= maxLength) return url
  return url.substring(0, maxLength) + '...'
}

