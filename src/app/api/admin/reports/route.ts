import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'

// GET /api/admin/reports - 获取举报列表
export async function GET(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { searchParams } = new URL(req.url)
  const status = searchParams.get('status') || 'pending'
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '20')

  const where: any = {}
  if (status !== 'all') where.status = status

  const [reports, total] = await Promise.all([
    prisma.report.findMany({
      where,
      include: {
        user: { select: { id: true, nickname: true, phone: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.report.count({ where }),
  ])

  // 关联评价信息
  const reviewIds = reports.map((r) => r.reviewId).filter(Boolean)
  const reviews = await prisma.review.findMany({
    where: { id: { in: reviewIds } },
    include: {
      user: { select: { id: true, nickname: true } },
      merchant: { select: { name: true } },
    },
  })
  const reviewMap = new Map(reviews.map((r) => [r.id, r]))

  const formatted = reports.map((report) => ({
    ...report,
    review: reviewMap.get(report.reviewId) || null,
  }))

  return NextResponse.json({ reports: formatted, total, page, pageSize })
}

// PUT /api/admin/reports - 处理举报
export async function PUT(req: NextRequest) {
  const auth = await requireAdmin()
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const { reportId, action, reviewAction } = await req.json()

  if (!reportId || !action) {
    return NextResponse.json({ error: '举报ID和操作为必填项' }, { status: 400 })
  }

  const report = await prisma.report.findUnique({ where: { id: reportId } })
  if (!report) {
    return NextResponse.json({ error: '举报不存在' }, { status: 404 })
  }

  // 更新举报状态
  const updated = await prisma.report.update({
    where: { id: reportId },
    data: { status: action === 'approve' ? 'approved' : 'rejected' },
  })

  // 如果批准举报，同步处理评价
  if (action === 'approve' && reviewAction && report.reviewId) {
    // 先查评价获取 userId，再更新
    const review = await prisma.review.findUnique({ where: { id: report.reviewId } })

    const reviewUpdate: any = { moderatedAt: new Date(), moderatedBy: auth.user!.id }
    if (reviewAction === 'hide') {
      reviewUpdate.status = 'hidden'
    } else if (reviewAction === 'reject') {
      reviewUpdate.status = 'rejected'
    }

    await prisma.review.update({
      where: { id: report.reviewId },
      data: reviewUpdate,
    })

    // 给被举报用户增加违规计数
    if (review) {
      await prisma.user.update({
        where: { id: review.userId },
        data: { violationCount: { increment: 1 } },
      })
    }
  }

  return NextResponse.json(updated)
}
