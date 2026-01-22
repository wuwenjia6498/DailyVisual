/**
 * Supabase 中间件工具
 * 用于刷新 session 和处理认证
 */
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 重要：不要在 createServerClient 和 supabase.auth.getUser() 之间写任何逻辑
  // 简单的错误可能导致用户被随机登出
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ===== 临时禁用登录验证 =====
  // 定义公开路由（不需要登录即可访问）
  // const publicRoutes = ['/login']
  // const isPublicRoute = publicRoutes.some(route => 
  //   request.nextUrl.pathname.startsWith(route)
  // )

  // 如果用户未登录且访问的不是公开路由，重定向到登录页
  // if (!user && !isPublicRoute) {
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/login'
  //   return NextResponse.redirect(url)
  // }

  // 如果用户已登录且访问登录页，重定向到首页
  // if (user && request.nextUrl.pathname === '/login') {
  //   const url = request.nextUrl.clone()
  //   url.pathname = '/'
  //   return NextResponse.redirect(url)
  // }
  // ===== 结束：临时禁用登录验证 =====

  return supabaseResponse
}

