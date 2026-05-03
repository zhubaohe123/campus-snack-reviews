import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { cookies } from 'next/headers'
import { prisma } from './prisma'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-CHANGE-IN-PRODUCTION'

export interface JWTPayload {
  userId: string
  phone: string
  level: number
}

// 密码哈希
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// 验证密码
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

// 生成 JWT
export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

// 验证 JWT
export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch {
    return null
  }
}

// 从请求中获取当前用户
export async function getCurrentUser() {
  const cookieStore = cookies()
  const token = cookieStore.get('token')?.value
  if (!token) return null

  const payload = verifyToken(token)
  if (!payload) return null

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      phone: true,
      nickname: true,
      avatar: true,
      school: true,
      email: true,
      level: true,
      authStatus: true,
      preferences: true,
      reviewCount: true,
      likeReceived: true,
      violationCount: true,
      createdAt: true,
    },
  })

  return user
}

// 计算用户权重系数
export function calcUserWeight(level: number, authStatus: string): number {
  const levelWeights: Record<number, number> = {
    1: 0.5,
    2: 0.7,
    3: 0.85,
    4: 1.0,
    5: 1.2,
  }
  const authMultipliers: Record<string, number> = {
    verified: 1.0,
    email: 0.8,
    none: 0.5,
  }
  return (levelWeights[level] || 0.5) * (authMultipliers[authStatus] || 0.5)
}

// 计算内容丰富度系数
export function calcRichness(content: string, imageCount: number, hasVideo: boolean): number {
  let coeff = 1.0

  // 文字长度
  if (content.length < 50) coeff = 0.8
  else if (content.length >= 50) coeff = 1.0

  // 图片加分
  if (imageCount >= 1 && imageCount <= 3) coeff += 0.1
  else if (imageCount >= 4) coeff += 0.2

  // 视频加分
  if (hasVideo) coeff += 0.3

  return Math.round(coeff * 10) / 10
}

// 计算时效衰减因子
export function calcTimeDecay(createdAt: Date): number {
  const now = new Date()
  const diffDays = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60 * 24)

  if (diffDays <= 7) return 1.0
  if (diffDays <= 30) return 0.9
  if (diffDays <= 90) return 0.7
  if (diffDays <= 180) return 0.5
  return 0.3
}

// 检查评价频率限制
export async function checkReviewRateLimit(userId: string): Promise<{ allowed: boolean; reason?: string }> {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) return { allowed: false, reason: '用户不存在' }

  // 新用户（注册7天内）每日上限3条，老用户5条
  const daysSinceRegister = (now.getTime() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)
  const dailyLimit = daysSinceRegister < 7 ? 3 : 5

  // 单日评价计数
  const todayCount = await prisma.review.count({
    where: {
      userId,
      createdAt: { gte: todayStart },
    },
  })

  if (todayCount >= dailyLimit) {
    return { allowed: false, reason: `今日评价已达上限（${dailyLimit}条）` }
  }

  return { allowed: true }
}
