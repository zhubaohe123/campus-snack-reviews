'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { merchantApi } from '@/lib/api'
import { Merchant } from '@/lib/types'
import { MerchantCard } from '@/components/MerchantCard'
import { SearchBar } from '@/components/SearchBar'
import { CategoryFilter } from '@/components/CategoryFilter'

type SortOption = 'rating' | 'price-low' | 'price-high' | 'reviews' | 'latest'

export default function MerchantsPage() {
  const searchParams = useSearchParams()
  const initialCategory = searchParams.get('cat') || '全部'
  const initialQuery = searchParams.get('q') || ''

  const [category, setCategory] = useState(initialCategory)
  const [sort, setSort] = useState<SortOption>('rating')
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [merchants, setMerchants] = useState<Merchant[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)

  const fetchMerchants = useCallback(async () => {
    setLoading(true)
    try {
      const data = await merchantApi.list({
        category: category === '全部' ? '' : category,
        sort,
        q: searchQuery,
      })
      // 适配 API 返回数据到前端 Merchant 类型
      const formatted: Merchant[] = data.merchants.map((m: any) => ({
        ...m,
        reviewCount: String(m.reviewCount),
        images: m.images || [],
        tags: m.tags || [],
        popularDishes: m.popularDishes || [],
        ratings: m.ratings || { taste: 0, hygiene: 0, service: 0, value: 0, portion: 0 },
      }))
      setMerchants(formatted)
      setTotal(data.total)
    } catch (error) {
      console.error('加载商户失败:', error)
    } finally {
      setLoading(false)
    }
  }, [category, sort, searchQuery])

  useEffect(() => {
    fetchMerchants()
  }, [fetchMerchants])

  const sortOptions: { value: SortOption; label: string }[] = [
    { value: 'rating', label: '评分最高' },
    { value: 'reviews', label: '评价最多' },
    { value: 'price-low', label: '价格最低' },
    { value: 'price-high', label: '价格最高' },
    { value: 'latest', label: '最新收录' },
  ]

  return (
    <div className="space-y-4">
      {/* 搜索栏 */}
      <SearchBar placeholder="搜索商户名、菜品、标签..." large />

      {/* 分类筛选 */}
      <CategoryFilter selected={category} onChange={setCategory} />

      {/* 排序和结果统计 */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-500">
          找到{' '}
          <span className="font-semibold text-gray-700">{total}</span> 家商户
        </p>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">排序：</span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          >
            {sortOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 加载状态 */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="card animate-pulse">
              <div className="h-40 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-3 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : merchants.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {merchants.map((merchant) => (
            <MerchantCard key={merchant.id} merchant={merchant} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <span className="text-5xl">🔍</span>
          <p className="text-gray-500 mt-4">没有找到匹配的商户</p>
          <p className="text-sm text-gray-400 mt-1">试试换个关键词或分类</p>
        </div>
      )}
    </div>
  )
}
