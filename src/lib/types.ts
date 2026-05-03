// 用户等级
export type UserLevel = 1 | 2 | 3 | 4 | 5

// 认证状态
export type AuthStatus = 'verified' | 'email' | 'none'

// 用户
export interface User {
  id: string
  nickname: string
  avatar: string
  level: UserLevel
  levelName: string
  authStatus: AuthStatus
  school: string
  reviewCount: number
  likeReceived: number
  joinDate: string
  preferences: string[]
}

// 商户分类
export type MerchantCategory =
  | '食堂'
  | '小吃街'
  | '周边餐馆'
  | '外卖'
  | '饮品甜品'
  | '夜市'

// 商户
export interface Merchant {
  id: string
  name: string
  category: MerchantCategory
  subCategory: string
  address: string
  avgPrice: number
  rating: number
  ratings: RatingDimensions
  reviewCount: string
  images: string[]
  openHours: string
  tags: string[]
  popularDishes: { name: string; price: number; mentions: number }[]
  distance?: number
}

// 评分维度
export interface RatingDimensions {
  taste: number
  hygiene: number
  service: number
  value: number
  portion: number
}

// 评价
export interface Review {
  id: string
  userId: string
  userName: string
  userAvatar: string
  userLevel: UserLevel
  merchantId: string
  merchantName: string
  ratings: RatingDimensions
  overallRating: number
  content: string
  images: string[]
  videoUrl?: string
  likes: number
  replies: Reply[]
  createdAt: string
  isVerified: boolean
  isFeatured: boolean
  richness: number
}

// 回复
export interface Reply {
  id: string
  userId: string
  userName: string
  content: string
  createdAt: string
  isMerchant?: boolean
}

// 收藏
export interface Favorite {
  id: string
  userId: string
  merchantId: string
  groupName: string
  createdAt: string
}

// 举报
export interface Report {
  id: string
  reviewId: string
  reason: '虚假评价' | '广告内容' | '恶意差评' | '抄袭' | '其他'
  description: string
  status: 'pending' | 'approved' | 'rejected'
}
