import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'

// GET /api/admin/reviews - 管理后台：获取评价列表（支持按状态、风险等级筛选）
export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || ''
  const riskLevel = searchParams.get('riskLevel') || ''
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')

  const where: any = {}
  if (status) where.status = status
  if (riskLevel) where.riskLevel = riskLevel

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, nickname: true, phone: true, level: true, authStatus: true } },
        merchant: { select: { id: true, name: true, category: true } },
        _count: { select: { replies: true, reviewLikes: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.review.count({ where }),
  ])

  const formatted = reviews.map((r) => ({
    ...r,
    images: JSON.parse(r.images),
    riskFlags: JSON.parse(r.riskFlags),
  }))

  return NextResponse.json({ reviews: formatted, total, page, pageSize })
}

// PUT /api/admin/reviews - 管理后台：审核评价（批准/拒绝/隐藏）
export async function PUT(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { reviewId, action, reason } = await req.json()

  if (!reviewId || !action) {
    return NextResponse.json({ error: '评价ID和操作为必填项' }, { status: 400 })
  }

  const validActions = ['approve', 'reject', 'hide', 'feature', 'unfeature']
  if (!validActions.includes(action)) {
    return NextResponse.json({ error: '无效操作' }, { status: 400 })
  }

  const review = await prisma.review.findUnique({ where: { id: reviewId } })
  if (!review) {
    return NextResponse.json({ error: '评价不存在' }, { status: 404 })
  }

  let updateData: any = { moderatedAt: new Date(), moderatedBy: auth.user!.id }

  switch (action) {
    case 'approve':
      updateData.status = 'approved'
      break
    case 'reject':
      updateData.status = 'rejected'
      break
    case 'hide':
      updateData.status = 'hidden'
      break
    case 'feature':
      updateData.isFeatured = true
      updateData.status = 'approved'
      break
    case 'unfeature':
      updateData.isFeatured = false
      break
  }

  const updated = await prisma.review.update({
    where: { id: reviewId },
    data: updateData,
  })

  // 如果拒绝，减少用户评价数（防止减为负数）
  if (action === 'reject' && review.status !== 'rejected') {
    const reviewOwner = await prisma.user.findUnique({
      where: { id: review.userId },
      select: { reviewCount: true },
    })
    if (reviewOwner && reviewOwner.reviewCount > 0) {
      await prisma.user.update({
        where: { id: review.userId },
        data: { reviewCount: { decrement: 1 } },
      })
    }
  }

  return NextResponse.json(updated)
}
