import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// GET /api/favorites - 获取收藏列表
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const groupName = searchParams.get('group') || ''

    const where: any = { userId: user.id }
    if (groupName) where.groupName = groupName

    const favorites = await prisma.favorite.findMany({
      where,
      include: {
        merchant: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    const formatted = favorites.map((f) => ({
      ...f,
      merchant: {
        ...f.merchant,
        tags: JSON.parse(f.merchant.tags),
        images: JSON.parse(f.merchant.images),
        popularDishes: JSON.parse(f.merchant.popularDishes),
      },
    }))

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('获取收藏失败:', error)
    return NextResponse.json({ error: '获取收藏失败' }, { status: 500 })
  }
}

// POST /api/favorites - 添加/取消收藏
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { merchantId, groupName } = await req.json()

    if (!merchantId) {
      return NextResponse.json({ error: '商户ID为必填项' }, { status: 400 })
    }

    // 检查是否已收藏
    const existing = await prisma.favorite.findUnique({
      where: {
        userId_merchantId: { userId: user.id, merchantId },
      },
    })

    if (existing) {
      // 取消收藏
      await prisma.favorite.delete({ where: { id: existing.id } })
      return NextResponse.json({ favorited: false })
    } else {
      // 添加收藏
      await prisma.favorite.create({
        data: {
          userId: user.id,
          merchantId,
          groupName: groupName || '默认',
        },
      })
      return NextResponse.json({ favorited: true })
    }
  } catch (error) {
    console.error('收藏操作失败:', error)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}
