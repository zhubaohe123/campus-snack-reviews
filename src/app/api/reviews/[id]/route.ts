import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/reviews/:id - 评价详情
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const review = await prisma.review.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            nickname: true,
            avatar: true,
            level: true,
            authStatus: true,
            reviewCount: true,
          },
        },
        merchant: {
          select: { id: true, name: true, category: true },
        },
        replies: {
          include: {
            user: { select: { id: true, nickname: true } },
          },
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!review) {
      return NextResponse.json({ error: '评价不存在' }, { status: 404 })
    }

    return NextResponse.json({
      ...review,
      images: JSON.parse(review.images),
    })
  } catch (error) {
    console.error('获取评价详情失败:', error)
    return NextResponse.json({ error: '获取评价详情失败' }, { status: 500 })
  }
}

// DELETE /api/reviews/:id - 删除评价（仅限本人）
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { getCurrentUser } = await import('@/lib/auth')
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const review = await prisma.review.findUnique({ where: { id: params.id } })
    if (!review) {
      return NextResponse.json({ error: '评价不存在' }, { status: 404 })
    }

    if (review.userId !== user.id) {
      return NextResponse.json({ error: '只能删除自己的评价' }, { status: 403 })
    }

    // 事务保护：删除评价 + 更新计数
    await prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id: params.id } })

      // 防止 reviewCount 减为负数
      await tx.user.update({
        where: { id: user.id },
        data: {
          reviewCount: { decrement: user.reviewCount > 0 ? 1 : 0 },
        },
      })
    })

    // 重新计算商户评分
    const { recalcMerchantRating } = await import('./helpers')
    await recalcMerchantRating(review.merchantId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('删除评价失败:', error)
    return NextResponse.json({ error: '删除评价失败' }, { status: 500 })
  }
}
