'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { merchantApi, reviewApi, favoriteApi } from '@/lib/api'
import { useAuth } from '@/lib/AuthContext'
import { RatingStars } from '@/components/RatingStars'
import { RadarChart } from '@/components/RadarChart'
import { ReviewCard } from '@/components/ReviewCard'
import { ShareModal } from '@/components/ShareModal'
import { ratingDimensions } from '@/lib/mock-data'
import Link from 'next/link'

export default function MerchantDetailPage() {
  const params = useParams()
  const merchantId = params.id as string
  const { user } = useAuth()

  const [merchant, setMerchant] = useState<any>(null)
  const [reviews, setReviews] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewFilter, setReviewFilter] = useState<'all' | 'positive' | 'negative'>('all')
  const [reviewSort, setReviewSort] = useState<'popular' | 'latest' | 'rating-high'>('popular')
  const [favorited, setFavorited] = useState(false)
  const [showShare, setShowShare] = useState(false)

  // 加载商户详情（仅 merchantId 变化时）
  useEffect(() => {
    async function loadMerchant() {
      setLoading(true)
      try {
        const merchantData = await merchantApi.detail(merchantId)
        setMerchant(merchantData)
      } catch (error) {
        console.error('加载商户详情失败:', error)
      } finally {
        setLoading(false)
      }
    }
    loadMerchant()
  }, [merchantId])

  // 评价列表（筛选/排序变化时重新加载）
  useEffect(() => {
    if (!merchantId) return
    let cancelled = false
    reviewApi
      .list({ merchantId, sort: reviewSort, filter: reviewFilter })
      .then((data) => {
        if (!cancelled) setReviews(data.reviews)
      })
      .catch(console.error)
    return () => { cancelled = true }
  }, [merchantId, reviewSort, reviewFilter])

  const handleToggleFavorite = async () => {
    if (!user) {
      alert('请先登录')
      return
    }
    try {
      const result = await favoriteApi.toggle(merchantId)
      setFavorited(result.favorited)
    } catch (error: any) {
      alert(error.message || '操作失败')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="card p-6">
          <div className="flex gap-6">
            <div className="w-48 h-48 bg-gray-200 rounded-2xl" />
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gray-200 rounded w-1/3" />
              <div className="h-4 bg-gray-200 rounded w-1/4" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!merchant) {
    return (
      <div className="text-center py-20">
        <span className="text-5xl">😕</span>
        <p className="text-gray-500 mt-4">商户不存在</p>
        <Link href="/merchants" className="btn-primary mt-4 inline-block">
          返回商户列表
        </Link>
      </div>
    )
  }

  const ratings = {
    taste: merchant.ratingTaste,
    hygiene: merchant.ratingHygiene,
    service: merchant.ratingService,
    value: merchant.ratingValue,
    portion: merchant.ratingPortion,
  }

  // 评分分布
  const ratingDistribution = [0, 0, 0, 0, 0]
  reviews.forEach((r: any) => {
    const bucket = Math.min(4, Math.floor(r.overallRating) - 1)
    if (bucket >= 0) ratingDistribution[bucket]++
  })
  const maxCount = Math.max(...ratingDistribution, 1)

  return (
    <div className="space-y-6">
      {/* 面包屑 */}
      <nav className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="hover:text-primary-500">首页</Link>
        <span>/</span>
        <Link href="/merchants" className="hover:text-primary-500">商户</Link>
        <span>/</span>
        <span className="text-gray-700">{merchant.name}</span>
      </nav>

      {/* 商户头部 */}
      <div className="card p-6">
        <div className="flex flex-col md:flex-row gap-6">
          <div className="w-full md:w-48 h-48 rounded-2xl bg-gradient-to-br from-orange-400 to-red-400 flex items-center justify-center flex-shrink-0">
            <span className="text-6xl opacity-80">
              {merchant.category === '食堂' ? '🏫' :
               merchant.category === '小吃街' ? '🍢' :
               merchant.category === '饮品甜品' ? '🧋' :
               merchant.category === '夜市' ? '🌙' : '🍚'}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <span className="tag mb-2">{merchant.category}</span>
                <h1 className="text-2xl font-bold mt-1">{merchant.name}</h1>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-primary-500">
                  {merchant.rating?.toFixed(1) || '0.0'}
                </p>
                <RatingStars rating={merchant.rating || 0} size="sm" />
                <p className="text-xs text-gray-500 mt-1">
                  {merchant.reviewCount}条评价
                </p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              <p className="text-sm text-gray-600">📍 {merchant.address}</p>
              <p className="text-sm text-gray-600">🕐 {merchant.openHours}</p>
              <p className="text-sm text-gray-600">💰 人均 ¥{merchant.avgPrice}</p>
            </div>
            <div className="flex flex-wrap gap-2 mt-4">
              {(merchant.tags || []).map((tag: string) => (
                <span key={tag} className="text-xs px-3 py-1 bg-gray-50 text-gray-600 rounded-full border border-gray-100">
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <Link href={`/review/new?merchant=${merchantId}`} className="btn-primary text-sm">
                ✏️ 写评价
              </Link>
              <button onClick={handleToggleFavorite} className={`text-sm ${favorited ? 'btn-primary' : 'btn-secondary'}`}>
                {favorited ? '⭐ 已收藏' : '⭐ 收藏'}
              </button>
              <button onClick={() => setShowShare(true)} className="btn-secondary text-sm">
                📤 分享
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 评分详情 */}
      <div className="card p-6">
        <h2 className="text-lg font-bold mb-4">评分详情</h2>
        <div className="flex flex-col md:flex-row gap-8 items-center">
          <RadarChart ratings={ratings} size={220} />
          <div className="flex-1 space-y-3">
            {ratingDimensions.map((dim) => (
              <div key={dim.key} className="flex items-center gap-3">
                <span className="text-base w-6">{dim.icon}</span>
                <span className="text-sm w-16 text-gray-600">{dim.label}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-2.5">
                  <div
                    className="bg-primary-500 h-2.5 rounded-full transition-all"
                    style={{ width: `${((ratings as any)[dim.key] / 5) * 100}%` }}
                  />
                </div>
                <span className="text-sm font-semibold w-8 text-right">
                  {(ratings as any)[dim.key]?.toFixed(1) || '0.0'}
                </span>
              </div>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                综合评分 = 口味×35% + 卫生×20% + 服务×15% + 性价比×20% + 分量×10%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 热门菜品 */}
      {merchant.popularDishes?.length > 0 && (
        <div className="card p-6">
          <h2 className="text-lg font-bold mb-4">🔥 热门菜品</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {merchant.popularDishes.map((dish: any, i: number) => (
              <div key={dish.name} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                <span className="text-2xl font-bold text-primary-300 w-8">{i + 1}</span>
                <div>
                  <p className="font-medium text-sm">{dish.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-primary-600 text-sm font-medium">¥{dish.price}</span>
                    <span className="text-xs text-gray-400">{dish.mentions}人推荐</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 评分分布 */}
      <div className="card p-6">
        <h2 className="text-lg font-bold mb-4">评分分布</h2>
        <div className="space-y-2">
          {[5, 4, 3, 2, 1].map((star) => (
            <div key={star} className="flex items-center gap-3">
              <span className="text-sm w-12 text-right text-gray-600">{star}星</span>
              <div className="flex-1 bg-gray-100 rounded-full h-3">
                <div
                  className="bg-amber-400 h-3 rounded-full transition-all"
                  style={{ width: `${(ratingDistribution[star - 1] / maxCount) * 100}%` }}
                />
              </div>
              <span className="text-xs text-gray-500 w-8">{ratingDistribution[star - 1]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* 评价列表 */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold">评价 ({reviews.length})</h2>
          <Link href={`/review/new?merchant=${merchantId}`} className="btn-outline text-sm">
            写评价
          </Link>
        </div>
        <div className="flex items-center gap-2 mb-4 overflow-x-auto no-scrollbar">
          {[
            { value: 'all', label: '全部' },
            { value: 'positive', label: '好评' },
            { value: 'negative', label: '差评' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setReviewFilter(opt.value as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                reviewFilter === opt.value
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
          <div className="ml-auto">
            <select
              value={reviewSort}
              onChange={(e) => setReviewSort(e.target.value as any)}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white"
            >
              <option value="popular">最热门</option>
              <option value="latest">最新</option>
              <option value="rating-high">评分最高</option>
            </select>
          </div>
        </div>
        <div className="space-y-3">
          {reviews.length > 0 ? (
            reviews.map((review: any) => (
              <ReviewCard key={review.id} review={review} />
            ))
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl">
              <span className="text-4xl">📝</span>
              <p className="text-gray-500 mt-3">暂无评价</p>
              <Link href={`/review/new?merchant=${merchantId}`} className="btn-primary mt-4 inline-block text-sm">
                写评价
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* 分享弹窗 */}
      {showShare && merchant && (
        <ShareModal
          title={merchant.name}
          description={`${merchant.category} · 人均¥${merchant.avgPrice} · 评分${merchant.rating?.toFixed(1)}`}
          url={typeof window !== 'undefined' ? window.location.href : ''}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
  )
}
