/**
 * 数据库类型定义
 * 与 Supabase 表结构对应
 */

// 用户资料
export interface Profile {
  id: string
  display_name: string
  avatar_url: string | null
  created_at: string
}

// 日志条目
export interface Entry {
  id: string
  user_id: string
  content: string
  date: string // YYYY-MM-DD
  created_at: string
}

// 图片
export interface Image {
  id: string
  entry_id: string
  url: string
  storage_path: string
  created_at: string
}

// 日志条目（含关联数据）
export interface EntryWithDetails extends Entry {
  profiles: Profile
  images: Image[]
}

