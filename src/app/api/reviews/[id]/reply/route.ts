import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// POST /api/reviews/:id/reply - 回复评价
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const reviewId = params.id
    const { content } = await req.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json({ error: '回复内容不能为空' }, { status: 400 })
    }

    if (content.length > 500) {
      return NextResponse.json({ error: '回复内容最多500字' }, { status: 400 })
    }

    // 检查评价是否存在
    const review = await prisma.review.findUnique({ where: { id: reviewId } })
    if (!review) {
      return NextResponse.json({ error: '评价不存在' }, { status: 404 })
    }

    const reply = await prisma.reply.create({
      data: {
        userId: user.id,
        reviewId,
        content: content.trim(),
      },
      include: {
        user: { select: { id: true, nickname: true } },
      },
    })

    return NextResponse.json(reply, { status: 201 })
  } catch (error) {
    console.error('回复失败:', error)
    return NextResponse.json({ error: '回复失败' }, { status: 500 })
  }
}

// GET /api/reviews/:id/reply - 获取回复列表
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const replies = await prisma.reply.findMany({
      where: { reviewId: params.id },
      include: {
        user: { select: { id: true, nickname: true, avatar: true, level: true } },
      },
      orderBy: { createdAt: 'asc' },
    })

    return NextResponse.json(replies)
  } catch (error) {
    console.error('获取回复失败:', error)
    return NextResponse.json({ error: '获取回复失败' }, { status: 500 })
  }
}
