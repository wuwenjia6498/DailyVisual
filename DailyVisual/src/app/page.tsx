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
  // 获取当前登录用户
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // 未登录则重定向到登录页
  if (!user) {
    redirect('/login')
  }

  // 获取用户 profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('display_name, avatar_url')
    .eq('id', user.id)
    .single()

  const displayName = profile?.display_name || user.email || '用户'

  return (
    <DashboardLayout displayName={displayName} userId={user.id}>
      {/* 日志内容流 */}
      <EntryFeed userId={user.id} />
      
      {/* 移动端悬浮按钮 */}
      <FloatingActionButton />
    </DashboardLayout>
  )
}
