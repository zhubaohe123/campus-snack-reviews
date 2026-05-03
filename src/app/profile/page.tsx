'use client'

import { useAuth } from '@/lib/AuthContext'
import { useState, useEffect } from 'react'
import { reviewApi, favoriteApi } from '@/lib/api'
import { levelConfig } from '@/lib/mock-data'
import { ReviewCard } from '@/components/ReviewCard'
import { getLevelColor, getAuthLabel } from '@/lib/utils'
import Link from 'next/link'

export default function ProfilePage() {
  const { user, loading: authLoading, logout } = useAuth()
  const [activeTab, setActiveTab] = useState<'reviews' | 'favorites' | 'level'>('reviews')
  const [myReviews, setMyReviews] = useState<any[]>([])
  const [favorites, setFavorites] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(false)

  // 加载用户数据
  useEffect(() => {
    if (!user) return
    setLoadingData(true)
    Promise.all([
      reviewApi.list({ userId: user.id }).catch(() => ({ reviews: [] })),
      favoriteApi.list().catch(() => []),
    ])
      .then(([reviewData, favData]) => {
        setMyReviews(reviewData.reviews)
        setFavorites(favData)
      })
      .finally(() => setLoadingData(false))
  }, [user])

  // 未登录
  if (!authLoading && !user) {
    return (
      <div className="text-center py-20">
        <span className="text-5xl">👤</span>
        <h2 className="text-xl font-bold mt-4">请先登录</h2>
        <p className="text-gray-500 mt-2">登录后查看个人中心</p>
        <div className="flex justify-center gap-4 mt-6">
          <Link href="/auth/login" className="btn-primary">去登录</Link>
          <Link href="/auth/register" className="btn-secondary">注册账号</Link>
        </div>
      </div>
    )
  }

  if (authLoading || !user) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="card p-6">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gray-200" />
            <div className="space-y-2">
              <div className="h-5 bg-gray-200 rounded w-32" />
              <div className="h-4 bg-gray-200 rounded w-24" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  const currentLevelConfig = levelConfig.find((l) => l.level === user.level)
  const nextLevelConfig = levelConfig.find((l) => l.level === user.level + 1)

  return (
    <div className="space-y-6">
      {/* 用户信息卡片 */}
      <div className="card p-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary-400 to-accent-400 flex items-center justify-center text-white text-3xl font-bold">
            {user.nickname.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{user.nickname}</h1>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${getLevelColor(
                  user.level
                )}`}
              >
                {currentLevelConfig?.icon} Lv{user.level} {currentLevelConfig?.name}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  user.authStatus === 'verified'
                    ? 'bg-green-50 text-green-600'
                    : user.authStatus === 'email'
                    ? 'bg-blue-50 text-blue-600'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                {getAuthLabel(user.authStatus)}
              </span>
              {user.school && (
                <span className="text-xs text-gray-500">{user.school}</span>
              )}
            </div>
            {user.preferences?.length > 0 && (
              <p className="text-xs text-gray-400 mt-1">
                口味偏好：{user.preferences.join('、')}
              </p>
            )}
          </div>
        </div>

        {/* 数据统计 */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-4 border-t border-gray-100">
          <div className="text-center">
            <p className="text-xl font-bold text-primary-500">{user.reviewCount}</p>
            <p className="text-xs text-gray-500">评价</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-primary-500">{user.likeReceived}</p>
            <p className="text-xs text-gray-500">获赞</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-primary-500">{favorites.length}</p>
            <p className="text-xs text-gray-500">收藏</p>
          </div>
        </div>

        {/* 退出登录 */}
        <button
          onClick={logout}
          className="w-full mt-4 py-2 text-sm text-gray-400 hover:text-red-500 transition-colors"
        >
          退出登录
        </button>
      </div>

      {/* Tab切换 */}
      <div className="flex bg-white rounded-xl p-1 shadow-sm">
        {[
          { key: 'reviews', label: '我的评价', icon: '📝' },
          { key: 'favorites', label: '我的收藏', icon: '⭐' },
          { key: 'level', label: '等级权益', icon: '🏅' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'bg-primary-50 text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab内容 */}
      {activeTab === 'reviews' && (
        <div className="space-y-3">
          {loadingData ? (
            <div className="text-center py-8 text-gray-400">加载中...</div>
          ) : myReviews.length > 0 ? (
            myReviews.map((review: any) => (
              <ReviewCard key={review.id} review={review} showMerchant />
            ))
          ) : (
            <div className="text-center py-12 card">
              <span className="text-4xl">📝</span>
              <p className="text-gray-500 mt-3">你还没有写过评价</p>
              <Link href="/review/new" className="btn-primary mt-4 inline-block text-sm">
                写第一条评价
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'favorites' && (
        <div className="space-y-3">
          {loadingData ? (
            <div className="text-center py-8 text-gray-400">加载中...</div>
          ) : favorites.length > 0 ? (
            favorites.map((fav: any) => (
              <Link
                key={fav.id}
                href={`/merchants/${fav.merchantId}`}
                className="card flex items-center gap-3 p-3"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center text-xl">
                  {fav.merchant?.category === '食堂' ? '🏫' : '🍚'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{fav.merchant?.name}</p>
                  <p className="text-xs text-gray-500">{fav.groupName}</p>
                </div>
              </Link>
            ))
          ) : (
            <div className="text-center py-12 card">
              <span className="text-4xl">⭐</span>
              <p className="text-gray-500 mt-3">你还没有收藏商户</p>
              <Link href="/merchants" className="btn-primary mt-4 inline-block text-sm">
                去发现美食
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'level' && (
        <div className="space-y-4">
          {/* 当前等级 */}
          <div className="card p-5">
            <h3 className="font-semibold mb-3">当前等级</h3>
            <div className="flex items-center gap-4">
              <span className="text-5xl">{currentLevelConfig?.icon}</span>
              <div>
                <p className="text-lg font-bold">
                  Lv{user.level} {currentLevelConfig?.name}
                </p>
                <p className="text-sm text-gray-500">
                  权重系数：{currentLevelConfig?.weight}
                </p>
                {nextLevelConfig && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>距离下一级</span>
                      <span>{user.reviewCount}/{nextLevelConfig.requirement.match(/\d+/)?.[0] || '50'} 条评价</span>
                    </div>
                    <div className="w-48 bg-gray-100 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (user.reviewCount / parseInt(nextLevelConfig.requirement.match(/\d+/)?.[0] || '50')) * 100
                          )}%`,
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 等级体系 */}
          <div className="card p-5">
            <h3 className="font-semibold mb-3">等级体系</h3>
            <p className="text-xs text-gray-500 mb-4">
              等级由评价数量和社区贡献决定，完全透明，不受任何商业因素影响
            </p>
            <div className="space-y-3">
              {levelConfig.map((level) => (
                <div
                  key={level.level}
                  className={`flex items-center gap-4 p-3 rounded-xl ${
                    level.level === user.level
                      ? 'bg-primary-50 border border-primary-200'
                      : 'bg-gray-50'
                  }`}
                >
                  <span className="text-2xl">{level.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        Lv{level.level} {level.name}
                      </span>
                      {level.level === user.level && (
                        <span className="text-[10px] bg-primary-500 text-white px-1.5 py-0.5 rounded-full">
                          当前
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{level.requirement}</p>
                  </div>
                  <span className="text-sm font-semibold text-primary-600">
                    ×{level.weight}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
