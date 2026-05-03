import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/merchants - 商户列表（支持筛选、排序、搜索）
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const category = searchParams.get('category') || ''
    const sort = searchParams.get('sort') || 'rating'
    const q = searchParams.get('q') || ''
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '20')

    // 构建查询条件
    const where: any = { isActive: true }

    if (category && category !== '全部') {
      where.category = category
    }

    if (q) {
      where.OR = [
        { name: { contains: q } },
        { subCategory: { contains: q } },
        { address: { contains: q } },
        { tags: { contains: q } },
      ]
    }

    // 排序
    let orderBy: any = { rating: 'desc' }
    switch (sort) {
      case 'rating':
        orderBy = { rating: 'desc' }
        break
      case 'price-low':
        orderBy = { avgPrice: 'asc' }
        break
      case 'price-high':
        orderBy = { avgPrice: 'desc' }
        break
      case 'reviews':
        orderBy = { reviewCount: 'desc' }
        break
      case 'latest':
        orderBy = { createdAt: 'desc' }
        break
    }

    const [merchants, total] = await Promise.all([
      prisma.merchant.findMany({
        where,
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.merchant.count({ where }),
    ])

    // 解析 JSON 字段 + 构造 ratings 嵌套对象
    const formatted = merchants.map((m) => ({
      ...m,
      tags: JSON.parse(m.tags),
      images: JSON.parse(m.images),
      popularDishes: JSON.parse(m.popularDishes),
      ratings: {
        taste: m.ratingTaste,
        hygiene: m.ratingHygiene,
        service: m.ratingService,
        value: m.ratingValue,
        portion: m.ratingPortion,
      },
    }))

    return NextResponse.json({
      merchants: formatted,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    })
  } catch (error) {
    console.error('获取商户列表失败:', error)
    return NextResponse.json({ error: '获取商户列表失败' }, { status: 500 })
  }
}
