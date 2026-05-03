import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// POST /api/reviews/:id/like - 点赞/取消点赞
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

    // 检查评价是否存在
    const review = await prisma.review.findUnique({ where: { id: reviewId } })
    if (!review) {
      return NextResponse.json({ error: '评价不存在' }, { status: 404 })
    }

    // 检查是否已点赞
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_reviewId: { userId: user.id, reviewId },
      },
    })

    if (existingLike) {
      // 取消点赞（事务保护）
      await prisma.$transaction([
        prisma.like.delete({ where: { id: existingLike.id } }),
        prisma.review.update({
          where: { id: reviewId },
          data: { likes: { decrement: 1 } },
        }),
        prisma.user.update({
          where: { id: review.userId },
          data: { likeReceived: { decrement: 1 } },
        }),
      ])
      return NextResponse.json({ liked: false, likes: review.likes - 1 })
    } else {
      // 点赞（事务保护）
      await prisma.$transaction([
        prisma.like.create({
          data: { userId: user.id, reviewId },
        }),
        prisma.review.update({
          where: { id: reviewId },
          data: { likes: { increment: 1 } },
        }),
        prisma.user.update({
          where: { id: review.userId },
          data: { likeReceived: { increment: 1 } },
        }),
      ])
      return NextResponse.json({ liked: true, likes: review.likes + 1 })
    }
  } catch (error) {
    console.error('点赞操作失败:', error)
    return NextResponse.json({ error: '操作失败' }, { status: 500 })
  }
}
