import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET /api/user/profile - 获取当前用户信息
export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    return NextResponse.json({
      ...user,
      preferences: JSON.parse(user.preferences),
    })
  } catch (error) {
    console.error('获取用户信息失败:', error)
    return NextResponse.json({ error: '获取用户信息失败' }, { status: 500 })
  }
}

// PUT /api/user/profile - 更新用户信息
export async function PUT(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const body = await req.json()
    const { nickname, avatar, school, preferences } = body

    const updateData: any = {}
    if (nickname !== undefined) updateData.nickname = nickname
    if (avatar !== undefined) updateData.avatar = avatar
    if (school !== undefined) updateData.school = school
    if (preferences !== undefined) updateData.preferences = JSON.stringify(preferences)

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: updateData,
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
      },
    })

    return NextResponse.json({
      ...updated,
      preferences: JSON.parse(updated.preferences),
    })
  } catch (error) {
    console.error('更新用户信息失败:', error)
    return NextResponse.json({ error: '更新失败' }, { status: 500 })
  }
}
