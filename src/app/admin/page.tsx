'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/lib/AuthContext'
import Link from 'next/link'

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews' | 'reports'>('overview')
  const [reviews, setReviews] = useState<any[]>([])
  const [reports, setReports] = useState<any[]>([])
  const [reviewFilter, setReviewFilter] = useState('pending')

  useEffect(() => {
    if (!user) return
    fetch('/api/admin/stats')
      .then((r) => { if (!r.ok) throw new Error('no auth'); return r.json() })
      .then(setStats)
      .catch(() => setStats(null))
      .finally(() => setLoading(false))
  }, [user])

  useEffect(() => {
    if (!user || activeTab !== 'reviews') return
    fetch(`/api/admin/reviews?status=${reviewFilter}`)
      .then((r) => { if (!r.ok) throw new Error('no auth'); return r.json() })
      .then((data) => setReviews(data.reviews || []))
      .catch(() => setReviews([]))
  }, [user, activeTab, reviewFilter])

  useEffect(() => {
    if (!user || activeTab !== 'reports') return
    fetch('/api/admin/reports?status=pending')
      .then((r) => { if (!r.ok) throw new Error('no auth'); return r.json() })
      .then((data) => setReports(data.reports || []))
      .catch(() => setReports([]))
  }, [user, activeTab])

  const handleReviewAction = async (reviewId: string, action: string) => {
    const res = await fetch('/api/admin/reviews', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviewId, action }),
    })
    if (res.ok) {
      setReviews((prev) => prev.filter((r) => r.id !== reviewId))
      // 只有 approve/reject/hide 会改变 pending 计数
      if (stats && ['approve', 'reject', 'hide'].includes(action)) {
        setStats((s: any) => ({
          ...s,
          pendingReviews: Math.max(0, s.pendingReviews - 1),
        }))
      }
    }
  }

  const handleReportAction = async (reportId: string, action: string, reviewAction?: string) => {
    const res = await fetch('/api/admin/reports', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reportId, action, reviewAction }),
    })
    if (res.ok) {
      setReports((prev) => prev.filter((r) => r.id !== reportId))
    }
  }

  // 未登录
  if (!authLoading && !user) {
    return (
      <div className="text-center py-20">
        <span className="text-5xl">🔒</span>
        <h2 className="text-xl font-bold mt-4">请先登录</h2>
        <Link href="/auth/login" className="btn-primary mt-4 inline-block">去登录</Link>
      </div>
    )
  }

  if (authLoading || loading) {
    return <div className="text-center py-20 text-gray-400">加载中...</div>
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">🛠️ 管理后台</h1>

      {/* Tab */}
      <div className="flex bg-white rounded-xl p-1 shadow-sm">
        {[
          { key: 'overview', label: '概览', icon: '📊' },
          { key: 'reviews', label: '评价审核', icon: '📝' },
          { key: 'reports', label: '举报处理', icon: '🚨' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key ? 'bg-primary-50 text-primary-600' : 'text-gray-500'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* 概览 */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: '总用户', value: stats.totalUsers, color: 'text-blue-500' },
              { label: '总商户', value: stats.totalMerchants, color: 'text-green-500' },
              { label: '已通过评价', value: stats.totalReviews, color: 'text-primary-500' },
              { label: '今日新评价', value: stats.todayReviews, color: 'text-purple-500' },
            ].map((s) => (
              <div key={s.label} className="card p-4 text-center">
                <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[
              { label: '待审核评价', value: stats.pendingReviews, urgent: stats.pendingReviews > 0 },
              { label: '待处理举报', value: stats.pendingReports, urgent: stats.pendingReports > 0 },
              { label: '高风险评价', value: stats.highRiskReviews, urgent: stats.highRiskReviews > 0 },
            ].map((s) => (
              <div
                key={s.label}
                className={`card p-4 text-center ${s.urgent ? 'border-red-200 bg-red-50' : ''}`}
              >
                <p className={`text-2xl font-bold ${s.urgent ? 'text-red-500' : 'text-gray-500'}`}>
                  {s.value}
                </p>
                <p className="text-xs text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>

          {/* 风险分布 */}
          {stats.riskDistribution?.length > 0 && (
            <div className="card p-4">
              <h3 className="font-semibold mb-3">风险分布</h3>
              <div className="flex gap-4">
                {stats.riskDistribution.map((r: any) => (
                  <div key={r.level} className="text-center">
                    <p className={`text-lg font-bold ${
                      r.level === 'critical' ? 'text-red-500' :
                      r.level === 'high' ? 'text-orange-500' :
                      r.level === 'medium' ? 'text-yellow-500' : 'text-green-500'
                    }`}>{r.count}</p>
                    <p className="text-xs text-gray-500">{r.level}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 评价审核 */}
      {activeTab === 'reviews' && (
        <div className="space-y-4">
          <div className="flex gap-2">
            {['pending', 'approved', 'rejected', 'hidden', 'high'].map((f) => (
              <button
                key={f}
                onClick={() => setReviewFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  reviewFilter === f ? 'bg-primary-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {f === 'pending' ? '待审核' : f === 'approved' ? '已通过' : f === 'rejected' ? '已拒绝' : f === 'hidden' ? '已隐藏' : '高风险'}
              </button>
            ))}
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400">暂无数据</div>
          ) : (
            reviews.map((r: any) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{r.user?.nickname}</span>
                      <span className="text-xs text-gray-400">Lv{r.user?.level}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        r.riskLevel === 'critical' ? 'bg-red-100 text-red-600' :
                        r.riskLevel === 'high' ? 'bg-orange-100 text-orange-600' :
                        r.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        风险:{r.riskLevel} ({r.riskScore}分)
                      </span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        r.status === 'approved' ? 'bg-green-100 text-green-600' :
                        r.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                        'bg-red-100 text-red-600'
                      }`}>{r.status}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">
                      评价了 {r.merchant?.name} · {r.overallRating}分
                    </p>
                  </div>
                </div>

                <p className="text-sm mt-2 text-gray-700">{r.content}</p>

                {r.riskFlags?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {r.riskFlags.map((flag: string, i: number) => (
                      <span key={i} className="text-[10px] px-2 py-0.5 bg-red-50 text-red-500 rounded-full">
                        {flag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  {r.status !== 'approved' && (
                    <button
                      onClick={() => handleReviewAction(r.id, 'approve')}
                      className="text-xs px-3 py-1.5 bg-green-500 text-white rounded-lg hover:bg-green-600"
                    >
                      通过
                    </button>
                  )}
                  {r.status !== 'rejected' && (
                    <button
                      onClick={() => handleReviewAction(r.id, 'reject')}
                      className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                    >
                      拒绝
                    </button>
                  )}
                  {!r.isFeatured && (
                    <button
                      onClick={() => handleReviewAction(r.id, 'feature')}
                      className="text-xs px-3 py-1.5 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                    >
                      设为精华
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* 举报处理 */}
      {activeTab === 'reports' && (
        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="text-center py-12 text-gray-400">暂无待处理举报</div>
          ) : (
            reports.map((r: any) => (
              <div key={r.id} className="card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full">
                    {r.reason}
                  </span>
                  <span className="text-xs text-gray-400">
                    举报人: {r.user?.nickname}
                  </span>
                </div>

                {r.review && (
                  <div className="bg-gray-50 rounded-lg p-3 mb-3">
                    <p className="text-xs text-gray-500">
                      被举报评价 · {r.review.user?.nickname} · {r.review.merchant?.name}
                    </p>
                    <p className="text-sm mt-1">{r.review.content?.slice(0, 100)}...</p>
                  </div>
                )}

                {r.description && (
                  <p className="text-xs text-gray-500 mb-3">补充说明: {r.description}</p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => handleReportAction(r.id, 'approve', 'hide')}
                    className="text-xs px-3 py-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    批准 + 隐藏评价
                  </button>
                  <button
                    onClick={() => handleReportAction(r.id, 'approve', 'reject')}
                    className="text-xs px-3 py-1.5 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                  >
                    批准 + 删除评价
                  </button>
                  <button
                    onClick={() => handleReportAction(r.id, 'reject')}
                    className="text-xs px-3 py-1.5 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
                  >
                    驳回举报
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
