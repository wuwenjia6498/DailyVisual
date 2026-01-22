/**
 * 首页 - 日志展示页面
 * 使用响应式 DashboardLayout
 * 
 * 注意：当前已临时禁用登录功能
 */
import { createClient } from '@/utils/supabase/server'
// import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/DashboardLayout'
import EntryFeed from '@/components/EntryFeed'
import FloatingActionButton from '@/components/FloatingActionButton'

export default async function HomePage() {
  // ===== 临时禁用登录 - 尝试获取数据库中的第一个用户 =====
  const supabase = await createClient()
  
  // 原登录逻辑已注释
  // const { data: { user } } = await supabase.auth.getUser()
  // if (!user) {
  //   redirect('/login')
  // }

  // 尝试从数据库获取第一个可用用户
  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, display_name')
    .limit(1)
    .single()

  // 使用数据库中的用户或临时用户
  const displayName = profiles?.display_name || '访客用户'
  const userId = profiles?.id || 'temp-user-id'
  // ===== 结束：临时禁用登录 =====

  return (
    <DashboardLayout displayName={displayName} userId={userId}>
      {/* 日志内容流 */}
      <EntryFeed userId={userId} />
      
      {/* 移动端悬浮按钮 */}
      <FloatingActionButton />
    </DashboardLayout>
  )
}
