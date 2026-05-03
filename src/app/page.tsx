'use client'

import { useState, useEffect } from 'react'
import { merchantApi, reviewApi } from '@/lib/api'
import { MerchantCard } from '@/components/MerchantCard'
import { ReviewCard } from '@/components/ReviewCard'
import { SearchBar } from '@/components/SearchBar'
import Link from 'next/link'

export default function HomePage() {
  const [topMerchants, setTopMerchants] = useState<any[]>([])
  const [featuredReviews, setFeaturedReviews] = useState<any[]>([])
  const [latestReviews, setLatestReviews] = useState<any[]>([])
  const [stats, setStats] = useState({ merchants: 0, reviews: 0, users: 0 })

  useEffect(() => {
    // 并行加载数据
    Promise.all([
      merchantApi.list({ sort: 'rating', pageSize: 6 }),
      reviewApi.list({ sort: 'popular', filter: 'featured' }),
      reviewApi.list({ sort: 'latest', pageSize: 4 }),
    ])
      .then(([merchantData, featuredData, latestData]) => {
        setTopMerchants(merchantData.merchants)
        setStats((s) => ({ ...s, merchants: merchantData.total }))
        setFeaturedReviews(featuredData.reviews)
        setStats((s) => ({ ...s, reviews: latestData.total }))
        setLatestReviews(latestData.reviews)
      })
      .catch(console.error)
  }, [])

  return (
    <div className="space-y-8">
      {/* Hero */}
      <section className="text-center py-8 md:py-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
          🍜 校园小吃点评
        </h1>
        <p className="text-gray-500 text-base md:text-lg mb-6 max-w-md mx-auto">
          由大学生创建、为大学生服务
          <br />
          纯粹真实，零商业化干扰
        </p>
        <div className="max-w-xl mx-auto">
          <SearchBar large placeholder="搜商户、菜品、口味..." />
        </div>
        <div className="flex justify-center gap-3 mt-6 flex-wrap">
          {[
            { icon: '🏫', label: '食堂', href: '/merchants?cat=食堂' },
            { icon: '🍢', label: '小吃街', href: '/merchants?cat=小吃街' },
            { icon: '🧋', label: '饮品', href: '/merchants?cat=饮品甜品' },
            { icon: '🌙', label: '夜市', href: '/merchants?cat=夜市' },
          ].map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="flex items-center gap-1.5 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100 hover:border-primary-300 hover:shadow-md transition-all text-sm"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 平台承诺 */}
      <section className="card p-4 bg-gradient-to-r from-primary-50 to-orange-50 border-primary-100">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <h3 className="font-semibold text-sm text-primary-800">我们的承诺</h3>
            <p className="text-xs text-primary-600 mt-0.5">
              100%学生真实评价 · 零商家付费干预 · 评分权重完全透明
            </p>
          </div>
        </div>
      </section>

      {/* 热门商户 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-gray-900">🔥 热门推荐</h2>
          <Link href="/merchants" className="text-sm text-primary-500 hover:text-primary-600">
            查看全部 →
          </Link>
        </div>
        {topMerchants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {topMerchants.map((m: any) => (
              <MerchantCard
                key={m.id}
                merchant={{
                  ...m,
                  reviewCount: String(m.reviewCount),
                  images: m.images || [],
                  tags: m.tags || [],
                  popularDishes: m.popularDishes || [],
                  ratings: m.ratings || { taste: 0, hygiene: 0, service: 0, value: 0, portion: 0 },
                }}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-40 bg-gray-200" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 精华评价 */}
      {featuredReviews.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">⭐ 精华评价</h2>
          </div>
          <div className="space-y-3">
            {featuredReviews.map((review: any) => (
              <ReviewCard key={review.id} review={review} showMerchant />
            ))}
          </div>
        </section>
      )}

      {/* 最新评价 */}
      {latestReviews.length > 0 && (
        <section>
          <h2 className="text-lg font-bold text-gray-900 mb-4">📝 最新评价</h2>
          <div className="space-y-3">
            {latestReviews.map((review: any) => (
              <ReviewCard key={review.id} review={review} showMerchant />
            ))}
          </div>
        </section>
      )}

      {/* 数据统计 */}
      <section className="card p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 text-center">📊 平台数据</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: '收录商户', value: stats.merchants || '10', unit: '家' },
            { label: '真实评价', value: stats.reviews || '6', unit: '条' },
            { label: '认证学生', value: '6', unit: '人' },
            { label: '日均访问', value: '—', unit: '' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-2xl font-bold text-primary-500">
                {stat.value}
                <span className="text-sm font-normal text-gray-500">{stat.unit}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 写评价入口 */}
      <section className="card p-6 text-center bg-gradient-to-br from-primary-500 to-accent-500 text-white">
        <h2 className="text-xl font-bold mb-2">分享你的美食发现</h2>
        <p className="text-sm opacity-90 mb-4">
          你的每一条评价，都在帮助同学们找到真正好吃的
        </p>
        <Link
          href="/review/new"
          className="inline-block bg-white text-primary-600 font-semibold py-2.5 px-8 rounded-xl hover:bg-gray-50 transition-colors"
        >
          写评价
        </Link>
      </section>
    </div>
  )
}
