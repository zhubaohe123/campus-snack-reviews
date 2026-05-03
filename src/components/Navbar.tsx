'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/lib/AuthContext'
import { getLevelColor } from '@/lib/utils'

const navItems = [
  { href: '/', label: '首页', icon: '🏠' },
  { href: '/merchants', label: '发现', icon: '🔍' },
  { href: '/review/new', label: '写评价', icon: '✏️' },
  { href: '/profile', label: '我的', icon: '👤' },
]

const levelNames: Record<number, string> = {
  1: '新芽',
  2: '食客',
  3: '美食家',
  4: '品鉴官',
  5: '达人',
}

export function Navbar() {
  const pathname = usePathname()
  const { user, loading, logout } = useAuth()

  return (
    <>
      {/* 桌面端顶部导航 */}
      <header className="hidden md:block sticky top-0 z-50 glass border-b border-gray-200/50">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl">🍜</span>
            <span className="text-xl font-bold text-primary-600">
              校园小吃点评
            </span>
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-primary-50 text-primary-600'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-20 h-8 bg-gray-100 rounded-lg animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="flex items-center gap-2 hover:bg-gray-50 px-2 py-1 rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-sm font-bold">
                    {user.nickname.charAt(0)}
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-800 leading-tight">
                      {user.nickname}
                    </p>
                    <p className="text-[10px] text-gray-500 leading-tight">
                      Lv{user.level} {levelNames[user.level] || ''}
                    </p>
                  </div>
                </Link>
                <button
                  onClick={logout}
                  className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
                >
                  退出
                </button>
              </div>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  登录
                </Link>
                <Link
                  href="/auth/register"
                  className="btn-primary text-sm py-2"
                >
                  注册
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 移动端底部导航 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-gray-200/50 safe-bottom">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center gap-0.5 py-1.5 px-3 rounded-lg transition-colors ${
                  isActive ? 'text-primary-600' : 'text-gray-500'
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
