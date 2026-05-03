import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser, calcRichness, checkReviewRateLimit } from '@/lib/auth'
import { moderateReview } from '@/lib/moderation'
import { recalcMerchantRating } from './[id]/helpers'

// GET /api/reviews - 评价列表
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const merchantId = searchParams.get('merchantId') || ''
    const userId = searchParams.get('userId') || ''
    const sort = searchParams.get('sort') || 'latest'
    const filter = searchParams.get('filter') || 'all'
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    const where: any = { status: 'approved' }

    if (merchantId) where.merchantId = merchantId
    if (userId) where.userId = userId

    // 筛选
    if (filter === 'positive') {
      where.overallRating = { gte: 4 }
    } else if (filter === 'negative') {
      where.overallRating = { lt: 3.5 }
    } else if (filter === 'featured') {
      where.isFeatured = true
    }

    // 排序
    let orderBy: any = { createdAt: 'desc' }
    switch (sort) {
      case 'latest':
        orderBy = { createdAt: 'desc' }
        break
      case 'popular':
        orderBy = { likes: 'desc' }
        break
      case 'rating-high':
        orderBy = { overallRating: 'desc' }
        break
      case 'rating-low':
        orderBy = { overallRating: 'asc' }
        break
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
              level: true,
              authStatus: true,
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
            take: 3,
          },
          _count: {
            select: { replies: true },
          },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.review.count({ where }),
    ])

    const formatted = reviews.map((r) => ({
      ...r,
      images: JSON.parse(r.images),
      replyCount: r._count.replies,
    }))

    return NextResponse.json({
      reviews: formatted,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('获取评价列表失败:', error)
    return NextResponse.json({ error: '获取评价列表失败' }, { status: 500 })
  }
}

// POST /api/reviews - 创建评价
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const body = await req.json()
    const { merchantId, ratings, content, images, videoUrl, deviceHash } = body

    // 参数校验
    if (!merchantId || !ratings || !content) {
      return NextResponse.json({ error: '商户、评分为必填项' }, { status: 400 })
    }

    // 检查至少3个维度有评分
    const ratedCount = Object.values(ratings).filter((v: any) => v > 0).length
    if (ratedCount < 3) {
      return NextResponse.json({ error: '请至少为3个维度打分' }, { status: 400 })
    }

    // 内容长度校验
    if (content.length < 20) {
      return NextResponse.json({ error: '评价内容至少20字' }, { status: 400 })
    }

    // 频率限制
    const rateCheck = await checkReviewRateLimit(user.id)
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: rateCheck.reason }, { status: 429 })
    }

    // 检查商户是否存在
    const merchant = await prisma.merchant.findUnique({ where: { id: merchantId } })
    if (!merchant) {
      return NextResponse.json({ error: '商户不存在' }, { status: 404 })
    }

    // 检查是否在7天内已评价过该商户
    const recentReview = await prisma.review.findFirst({
      where: {
        userId: user.id,
        merchantId,
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        },
      },
    })
    if (recentReview) {
      return NextResponse.json(
        { error: '7天内已评价过该商户，请勿重复评价' },
        { status: 429 }
      )
    }

    // 计算综合评分
    const overallRating =
      Math.round(
        (ratings.taste * 0.35 +
          ratings.hygiene * 0.2 +
          ratings.service * 0.15 +
          ratings.value * 0.2 +
          ratings.portion * 0.1) *
          10
      ) / 10

    // 计算内容丰富度
    const imageList = images || []
    const richness = calcRichness(content, imageList.length, !!videoUrl)

    // 风控审核
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentByUser = await prisma.review.findMany({
      where: { userId: user.id, createdAt: { gte: oneHourAgo } },
      select: { content: true, merchantId: true },
    })

    const accountAgeDays = (Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24)

    const moderation = await moderateReview({
      content,
      userId: user.id,
      merchantId,
      recentContents: recentByUser.map((r) => r.content),
      recentReviewCount: recentByUser.length,
      recentMerchantIds: recentByUser.map((r) => r.merchantId),
      accountAgeDays,
      reviewCount: user.reviewCount,
    })

    // 高风险直接拒绝
    if (!moderation.approved && moderation.riskLevel === 'critical') {
      return NextResponse.json(
        { error: '评价内容不符合规范，请修改后重试', flags: moderation.flags },
        { status: 422 }
      )
    }

    // 事务：创建评价 + 更新用户评价数
    const review = await prisma.$transaction(async (tx) => {
      const newReview = await tx.review.create({
        data: {
          userId: user.id,
          merchantId,
          ratingTaste: ratings.taste || 0,
          ratingHygiene: ratings.hygiene || 0,
          ratingService: ratings.service || 0,
          ratingValue: ratings.value || 0,
          ratingPortion: ratings.portion || 0,
          overallRating,
          content,
          images: JSON.stringify(imageList),
          videoUrl: videoUrl || '',
          richness,
          status: moderation.approved ? 'approved' : 'pending',
          riskScore: moderation.score,
          riskLevel: moderation.riskLevel,
          riskFlags: JSON.stringify(moderation.flags),
          deviceHash: deviceHash || '',
        },
        include: {
          user: {
            select: {
              id: true,
              nickname: true,
              avatar: true,
              level: true,
              authStatus: true,
            },
          },
        },
      })

      await tx.user.update({
        where: { id: user.id },
        data: { reviewCount: { increment: 1 } },
      })

      return newReview
    })

    // 重新计算商户评分（派生数据，事务外执行）
    await recalcMerchantRating(merchantId)

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('创建评价失败:', error)
    return NextResponse.json({ error: '创建评价失败' }, { status: 500 })
  }
}
