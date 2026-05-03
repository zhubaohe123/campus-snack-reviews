'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'

export default function LoginPage() {
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { refresh } = useAuth()
  const router = useRouter()

  const handleLogin = async () => {
    if (!phone || !password) {
      setError('请填写手机号和密码')
      return
    }
    setLoading(true)
    setError('')
    try {
      await authApi.login({ phone, password })
      await refresh()
      router.push('/')
    } catch (err: any) {
      setError(err.message || '登录失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <span className="text-5xl">🍜</span>
          <h1 className="text-2xl font-bold mt-3">登录校园小吃点评</h1>
          <p className="text-sm text-gray-500 mt-1">纯粹真实的大学生美食社区</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">手机号</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
              placeholder="请输入手机号"
              className="input"
              maxLength={11}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="请输入密码"
              className="input"
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            />
          </div>

          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn-primary w-full py-3 text-base disabled:opacity-50"
          >
            {loading ? '登录中...' : '登录'}
          </button>

          <p className="text-center text-sm text-gray-500">
            还没有账号？{' '}
            <Link href="/auth/register" className="text-primary-500 font-medium hover:text-primary-600">
              注册新账号
            </Link>
          </p>

          {/* 演示账号提示 */}
          <div className="p-3 bg-blue-50 rounded-xl">
            <p className="text-xs text-blue-700 font-medium">演示账号：</p>
            <p className="text-xs text-blue-600 mt-1">
              手机号：13800000001 / 密码：123456
            </p>
          </div>

          <p className="text-center text-xs text-gray-400">
            登录即表示同意{' '}
            <a href="#" className="text-primary-500 underline">用户协议</a>{' '}
            和{' '}
            <a href="#" className="text-primary-500 underline">隐私政策</a>
          </p>
        </div>
      </div>
    </div>
  )
}
