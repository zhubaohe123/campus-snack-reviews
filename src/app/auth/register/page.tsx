'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { authApi } from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [school, setSchool] = useState('')
  const [email, setEmail] = useState('')
  const [nickname, setNickname] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { refresh } = useAuth()
  const router = useRouter()

  const schools = [
    '北京大学', '清华大学', '复旦大学', '上海交通大学',
    '浙江大学', '南京大学', '武汉大学', '华中科技大学',
    '中山大学', '四川大学', '其他',
  ]

  const handleRegister = async () => {
    if (!phone || !password || !nickname) {
      setError('请填写完整信息')
      return
    }
    setLoading(true)
    setError('')
    try {
      await authApi.register({ phone, password, nickname, school, email })
      await refresh()
      router.push('/')
    } catch (err: any) {
      setError(err.message || '注册失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="card p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <span className="text-5xl">🍜</span>
          <h1 className="text-2xl font-bold mt-3">注册校园小吃点评</h1>
          <p className="text-sm text-gray-500 mt-1">加入纯粹真实的美食社区</p>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= s ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-400'
                }`}
              >
                {step > s ? '✓' : s}
              </div>
              {s < 3 && (
                <div className={`w-12 h-0.5 ${step > s ? 'bg-primary-500' : 'bg-gray-200'}`} />
              )}
            </div>
          ))}
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 rounded-xl text-sm text-red-600">
            {error}
          </div>
        )}

        {/* 步骤1：手机号和密码 */}
        {step === 1 && (
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
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少6位密码"
                className="input"
              />
            </div>
            <button
              onClick={() => {
                if (phone.length === 11 && password.length >= 6) {
                  setError('')
                  setStep(2)
                } else {
                  setError('请输入11位手机号和至少6位密码')
                }
              }}
              className="btn-primary w-full py-3"
            >
              下一步
            </button>
          </div>
        )}

        {/* 步骤2：学校认证 */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">所在学校</label>
              <select value={school} onChange={(e) => setSchool(e.target.value)} className="input">
                <option value="">请选择学校</option>
                {schools.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                校园邮箱 <span className="text-gray-400 font-normal">(可选，用于认证)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@school.edu.cn"
                className="input"
              />
              <p className="text-xs text-gray-400 mt-1">.edu.cn 后缀邮箱可自动完成认证</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">上一步</button>
              <button onClick={() => { setError(''); setStep(3) }} className="btn-primary flex-1 py-3">下一步</button>
            </div>
          </div>
        )}

        {/* 步骤3：昵称 */}
        {step === 3 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">昵称</label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value.slice(0, 20))}
                placeholder="给自己起个名字吧"
                className="input"
                maxLength={20}
                onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary flex-1 py-3">上一步</button>
              <button
                onClick={handleRegister}
                disabled={!nickname || loading}
                className="btn-primary flex-1 py-3 disabled:opacity-50"
              >
                {loading ? '注册中...' : '完成注册'}
              </button>
            </div>
            <p className="text-center text-xs text-gray-400">
              注册即表示同意{' '}
              <a href="#" className="text-primary-500 underline">用户协议</a>{' '}
              和{' '}
              <a href="#" className="text-primary-500 underline">隐私政策</a>
            </p>
          </div>
        )}

        <p className="text-center text-sm text-gray-500 mt-6">
          已有账号？{' '}
          <Link href="/auth/login" className="text-primary-500 font-medium hover:text-primary-600">
            登录
          </Link>
        </p>
      </div>
    </div>
  )
}
