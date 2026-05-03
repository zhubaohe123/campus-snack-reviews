import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

// GET /api/auth/me - 获取当前登录用户信息
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ user: null }, { status: 401 })
    }

    return NextResponse.json({
      user: {
        ...user,
        preferences: JSON.parse(user.preferences),
      },
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return NextResponse.json({ user: null }, { status: 500 })
  }
}
