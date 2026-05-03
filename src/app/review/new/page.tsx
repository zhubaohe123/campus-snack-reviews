'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { merchantApi, reviewApi } from '@/lib/api'
import { ratingDimensions } from '@/lib/mock-data'
import { RatingStars } from '@/components/RatingStars'
import { calcOverallRating } from '@/lib/utils'
import { RatingDimensions } from '@/lib/types'
import { useAuth } from '@/lib/AuthContext'
import { collectFingerprint } from '@/lib/fingerprint'
import Link from 'next/link'

export default function NewReviewPage() {
  const searchParams = useSearchParams()
  const preselectedMerchant = searchParams.get('merchant') || ''
  const { user, loading: authLoading } = useAuth()
  const deviceHashRef = useRef('')

  const [merchantList, setMerchantList] = useState<any[]>([])
  const [selectedMerchant, setSelectedMerchant] = useState(preselectedMerchant)
  const [ratings, setRatings] = useState<RatingDimensions>({
    taste: 0, hygiene: 0, service: 0, value: 0, portion: 0,
  })
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState('')

  // 采集设备指纹
  useEffect(() => {
    collectFingerprint().then((fp) => {
      deviceHashRef.current = fp.hash
    }).catch(() => {})
  }, [])

  // 加载商户列表
  useEffect(() => {
    merchantApi
      .list({ pageSize: 100 })
      .then((data) => setMerchantList(data.merchants))
      .catch(console.error)
  }, [])

  const handleRatingChange = (key: keyof RatingDimensions, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }))
  }

  const overallRating = calcOverallRating(ratings)
  const ratedCount = Object.values(ratings).filter((v) => v > 0).length
  const isContentValid = content.length >= 20
  const canSubmit = selectedMerchant && ratedCount >= 3 && isContentValid && !submitting

  const handleSubmit = async () => {
    if (!canSubmit) return
    setSubmitting(true)
    setError('')
    try {
      await reviewApi.create({
        merchantId: selectedMerchant,
        ratings,
        content,
        deviceHash: deviceHashRef.current,
      })
      setShowSuccess(true)
    } catch (err: any) {
      setError(err.message || '提交失败，请稍后重试')
    } finally {
      setSubmitting(false)
    }
  }

  // 未登录提示
  if (!authLoading && !user) {
    return (
      <div className="text-center py-20">
        <span className="text-5xl">🔒</span>
        <h2 className="text-xl font-bold mt-4">请先登录</h2>
        <p className="text-gray-500 mt-2">登录后才能发布评价</p>
        <div className="flex justify-center gap-4 mt-6">
          <Link href="/auth/login" className="btn-primary">去登录</Link>
          <Link href="/auth/register" className="btn-secondary">注册账号</Link>
        </div>
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="text-center py-20">
        <span className="text-6xl">🎉</span>
        <h2 className="text-2xl font-bold mt-4">评价发布成功！</h2>
        <p className="text-gray-500 mt-2">感谢你的真诚分享，你的评价将帮助更多同学</p>
        <div className="flex justify-center gap-4 mt-6">
          <Link href={`/merchants/${selectedMerchant}`} className="btn-primary">查看商户</Link>
          <Link href="/" className="btn-secondary">返回首页</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">✏️ 写评价</h1>

      {/* 错误提示 */}
      {error && (
        <div className="card p-4 bg-red-50 border-red-100">
          <p className="text-sm text-red-600">⚠️ {error}</p>
        </div>
      )}

      {/* 选择商户 */}
      <div className="card p-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          选择商户 <span className="text-red-400">*</span>
        </label>
        <select
          value={selectedMerchant}
          onChange={(e) => setSelectedMerchant(e.target.value)}
          className="input"
        >
          <option value="">请选择你要评价的商户</option>
          {merchantList.map((m: any) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.category})
            </option>
          ))}
        </select>
      </div>

      {/* 五维度评分 */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-4">
          <label className="text-sm font-semibold text-gray-700">
            评分 <span className="text-gray-400 font-normal">(至少3个维度)</span>
          </label>
          {ratedCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">综合：</span>
              <RatingStars rating={overallRating} size="sm" />
            </div>
          )}
        </div>
        <div className="space-y-4">
          {ratingDimensions.map((dim) => (
            <div key={dim.key} className="flex items-center gap-4">
              <span className="text-base w-6">{dim.icon}</span>
              <span className="text-sm w-16 text-gray-600">{dim.label}</span>
              <span className="text-[10px] text-gray-400 w-10">
                占比{(dim.weight * 100).toFixed(0)}%
              </span>
              <div className="flex-1 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    onClick={() => handleRatingChange(dim.key as keyof RatingDimensions, star)}
                    className={`text-2xl transition-transform hover:scale-110 ${
                      star <= (ratings as any)[dim.key] ? 'text-amber-400' : 'text-gray-200'
                    }`}
                  >
                    ★
                  </button>
                ))}
              </div>
              <span className="text-sm font-medium w-8 text-right">
                {(ratings as any)[dim.key] > 0 ? `${(ratings as any)[dim.key]}.0` : '-'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 评价内容 */}
      <div className="card p-5">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          评价内容 <span className="text-red-400">*</span>
        </label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="分享你的真实体验，比如：菜品口味、环境、服务、性价比等..."
          className="input min-h-[160px] resize-y"
          rows={6}
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-xs text-gray-400">最少20字，写得越详细权重越高</p>
          <p className={`text-xs ${content.length >= 20 ? 'text-green-500' : 'text-gray-400'}`}>
            {content.length}/20字
          </p>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-xl">
          <p className="text-xs text-blue-700 font-medium mb-1">💡 写出高质量评价的小技巧：</p>
          <ul className="text-xs text-blue-600 space-y-0.5">
            <li>• 提到具体的菜品名称和价格</li>
            <li>• 描述口味、份量、环境等细节</li>
            <li>• 分享用餐时间、排队情况等实用信息</li>
          </ul>
        </div>
      </div>

      {/* 提交 */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-gray-400">提交后将立即计入评分</p>
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className={`py-3 px-8 rounded-xl font-semibold transition-all ${
            canSubmit
              ? 'bg-primary-500 text-white hover:bg-primary-600 active:scale-[0.98]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          }`}
        >
          {submitting ? '提交中...' : '发布评价'}
        </button>
      </div>

      {/* 校验提示 */}
      {!canSubmit && !submitting && (
        <div className="card p-4 bg-amber-50 border-amber-100">
          <p className="text-sm text-amber-700">⚠️ 请完成以下内容后再提交：</p>
          <ul className="text-xs text-amber-600 mt-1 space-y-0.5">
            {!selectedMerchant && <li>• 请选择要评价的商户</li>}
            {ratedCount < 3 && <li>• 请至少为3个维度打分（已打{ratedCount}个）</li>}
            {!isContentValid && <li>• 评价内容至少20字（当前{content.length}字）</li>}
          </ul>
        </div>
      )}
    </div>
  )
}
