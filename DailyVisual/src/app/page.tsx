/**
 * 首页 - 日志展示页面
 * 使用响应式 DashboardLayout
 */
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import EntryFeed from '@/components/EntryFeed'
import FloatingActionButton from '@/components/FloatingActionButton'

export default async function HomePage() {
  const supabase = await createClient()
  
  // 获取当前登录用户
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect('/login')
  }

  // 从数据库获取用户信息
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, display_name')
    .eq('id', user.id)
    .single()

  const displayName = profile?.display_name || '用户'
  const userId = user.id

  return (
    <DashboardLayout displayName={displayName} userId={userId}>
      {/* 日志内容流 */}
      <EntryFeed userId={userId} />
      
      {/* 移动端悬浮按钮 */}
      <FloatingActionButton />
    </DashboardLayout>
  )
}
