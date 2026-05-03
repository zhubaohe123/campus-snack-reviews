import Link from 'next/link'
import { Merchant } from '@/lib/types'
import { RatingStars } from './RatingStars'
import { getPlaceholderColor } from '@/lib/utils'

interface MerchantCardProps {
  merchant: Merchant
  compact?: boolean
}

export function MerchantCard({ merchant, compact = false }: MerchantCardProps) {
  const gradientColor = getPlaceholderColor(merchant.id)

  if (compact) {
    return (
      <Link href={`/merchants/${merchant.id}`} className="card flex gap-3 p-3">
        <div
          className={`w-16 h-16 rounded-xl bg-gradient-to-br ${gradientColor} flex items-center justify-center flex-shrink-0`}
        >
          <span className="text-2xl">
            {merchant.category === '食堂'
              ? '🏫'
              : merchant.category === '小吃街'
              ? '🍢'
              : merchant.category === '饮品甜品'
              ? '🧋'
              : merchant.category === '夜市'
              ? '🌙'
              : '🍚'}
          </span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm truncate">{merchant.name}</h3>
          <div className="flex items-center gap-2 mt-1">
            <RatingStars rating={merchant.rating} size="sm" />
            <span className="text-xs text-gray-500">
              {merchant.reviewCount}条评价
            </span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-primary-600 font-medium">
              ¥{merchant.avgPrice}/人
            </span>
            {merchant.distance && (
              <span className="text-xs text-gray-400">
                {merchant.distance}km
              </span>
            )}
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={`/merchants/${merchant.id}`} className="card group">
      {/* 图片区域 */}
      <div
        className={`h-40 bg-gradient-to-br ${gradientColor} flex items-center justify-center relative`}
      >
        <span className="text-5xl opacity-80">
          {merchant.category === '食堂'
            ? '🏫'
            : merchant.category === '小吃街'
            ? '🍢'
            : merchant.category === '饮品甜品'
            ? '🧋'
            : merchant.category === '夜市'
            ? '🌙'
            : '🍚'}
        </span>
        {/* 分类标签 */}
        <span className="absolute top-3 left-3 tag">{merchant.category}</span>
        {/* 距离标签 */}
        {merchant.distance && (
          <span className="absolute top-3 right-3 text-xs bg-black/50 text-white px-2 py-0.5 rounded-full">
            {merchant.distance}km
          </span>
        )}
      </div>

      {/* 内容区域 */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-bold text-base group-hover:text-primary-600 transition-colors truncate">
            {merchant.name}
          </h3>
          <span className="text-primary-600 font-bold text-sm whitespace-nowrap">
            ¥{merchant.avgPrice}/人
          </span>
        </div>

        <div className="flex items-center gap-2 mt-2">
          <RatingStars rating={merchant.rating} size="sm" />
          <span className="text-xs text-gray-500">
            {merchant.reviewCount}条评价
          </span>
        </div>

        {/* 标签 */}
        <div className="flex flex-wrap gap-1.5 mt-3">
          {merchant.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="text-xs px-2 py-0.5 bg-gray-50 text-gray-600 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* 热门菜品 */}
        <div className="mt-3 pt-3 border-t border-gray-50">
          <p className="text-xs text-gray-500 mb-1">热门推荐：</p>
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {merchant.popularDishes.slice(0, 3).map((dish) => (
              <span
                key={dish.name}
                className="text-xs bg-primary-50 text-primary-700 px-2 py-1 rounded-lg whitespace-nowrap"
              >
                {dish.name} ¥{dish.price}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}
