import { RatingDimensions } from './types'

// 计算综合评分
export function calcOverallRating(ratings: RatingDimensions): number {
  const weighted =
    ratings.taste * 0.35 +
    ratings.hygiene * 0.2 +
    ratings.service * 0.15 +
    ratings.value * 0.2 +
    ratings.portion * 0.1
  return Math.round(weighted * 10) / 10
}

// 格式化时间
export function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMs / 3600000)
  const diffDay = Math.floor(diffMs / 86400000)

  if (diffMin < 1) return '刚刚'
  if (diffMin < 60) return `${diffMin}分钟前`
  if (diffHour < 24) return `${diffHour}小时前`
  if (diffDay < 30) return `${diffDay}天前`
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

// 生成占位图颜色
export function getPlaceholderColor(id: string): string {
  const colors = [
    'from-orange-400 to-red-400',
    'from-amber-400 to-orange-400',
    'from-yellow-400 to-amber-400',
    'from-red-400 to-pink-400',
    'from-rose-400 to-red-400',
  ]
  let hash = 0
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

// 获取等级颜色
export function getLevelColor(level: number): string {
  const colors: Record<number, string> = {
    1: 'bg-gray-100 text-gray-600',
    2: 'bg-green-100 text-green-700',
    3: 'bg-blue-100 text-blue-700',
    4: 'bg-purple-100 text-purple-700',
    5: 'bg-amber-100 text-amber-700',
  }
  return colors[level] || colors[1]
}

// 获取认证状态标签
export function getAuthLabel(status: string): string {
  const labels: Record<string, string> = {
    verified: '已认证学生',
    email: '邮箱认证',
    none: '未认证',
  }
  return labels[status] || '未认证'
}
