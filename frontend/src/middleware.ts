import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // 刷新session以确保未过期
  const {
    data: { session },
  } = await supabase.auth.getSession();

  // 用户未登录且访问受保护路由时重定向到登录页
  const isAuthRoute = req.nextUrl.pathname.startsWith('/login') ||
                      req.nextUrl.pathname.startsWith('/auth');

  if (!session && !isAuthRoute) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // 用户已登录但访问登录页时重定向到主页
  if (session && req.nextUrl.pathname.startsWith('/login')) {
    const homeUrl = new URL('/', req.url);
    return NextResponse.redirect(homeUrl);
  }

  return res;
}

// 指定中间件应运行的路径
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)'],
};
