/**
 * 登录页面
 * 极简风格的用户名/密码登录表单
 * 无注册功能（仅限预设用户）
 */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

// 邮箱后缀（管理员在 Supabase 创建用户时使用此后缀）
const EMAIL_SUFFIX = '@hui-ben.com'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // 处理登录
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      const supabase = createClient()
      // 自动拼接邮箱后缀
      const email = username.includes('@') ? username : `${username}${EMAIL_SUFFIX}`
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError('用户名或密码错误')
        return
      }

      // 登录成功，跳转到首页
      router.push('/')
      router.refresh()
    } catch {
      setError('登录时发生错误，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      {/* 登录卡片 */}
      <Card className="w-full max-w-md border-2 border-foreground/10">
        <CardHeader className="space-y-1 text-center">
          {/* Logo / 标题 */}
          <div className="flex justify-center mb-4 mt-8">
            <Image
              src="/logo-1.jpg"
              alt="Logo"
              width={48}
              height={48}
              className="rounded-full"
            />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">
            DailyVisual
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            每日分享素材
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            {/* 用户名输入 */}
            <div className="space-y-2">
              <Label htmlFor="username">用户名</Label>
              <Input
                id="username"
                type="text"
                placeholder="请输入用户名"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
                className="h-11"
              />
            </div>

            {/* 密码输入 */}
            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="h-11"
              />
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-950/20 py-2 px-3 rounded-md">
                {error}
              </div>
            )}

            {/* 登录按钮 */}
            <Button
              type="submit"
              className="w-full h-11 font-medium"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </Button>
          </form>

          {/* 底部版权 */}
          <p className="text-xs text-muted-foreground text-center mt-6">
            © 2026 老约翰儿童阅读
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

