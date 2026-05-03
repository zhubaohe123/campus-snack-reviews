import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/merchants/:id - 商户详情
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const merchant = await prisma.merchant.findUnique({
      where: { id: params.id },
      include: {
        reviews: {
          where: { status: 'approved' },
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
            replies: {
              include: {
                user: {
                  select: { id: true, nickname: true },
                },
              },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 50,
        },
        _count: {
          select: {
            reviews: { where: { status: 'approved' } },
            favorites: true,
          },
        },
      },
    })

    if (!merchant) {
      return NextResponse.json({ error: '商户不存在' }, { status: 404 })
    }

    // 解析 JSON 字段 + 构造 ratings 嵌套对象
    const formatted = {
      ...merchant,
      tags: JSON.parse(merchant.tags),
      images: JSON.parse(merchant.images),
      popularDishes: JSON.parse(merchant.popularDishes),
      reviewCount: merchant._count.reviews,
      favoriteCount: merchant._count.favorites,
      ratings: {
        taste: merchant.ratingTaste,
        hygiene: merchant.ratingHygiene,
        service: merchant.ratingService,
        value: merchant.ratingValue,
        portion: merchant.ratingPortion,
      },
      reviews: merchant.reviews.map((r) => ({
        ...r,
        images: JSON.parse(r.images),
        user: {
          ...r.user,
          preferences: undefined,
        },
      })),
    }

    return NextResponse.json(formatted)
  } catch (error) {
    console.error('获取商户详情失败:', error)
    return NextResponse.json({ error: '获取商户详情失败' }, { status: 500 })
  }
}
