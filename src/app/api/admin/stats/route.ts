import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin'

// GET /api/admin/stats - 管理后台统计数据
export async function GET() {
  const auth = await requireAdmin()
  if (auth.error) {
    return NextResponse.json({ error: auth.error }, { status: auth.status })
  }

  const [
    totalUsers,
    totalMerchants,
    totalReviews,
    pendingReviews,
    pendingReports,
    highRiskReviews,
    todayReviews,
    todayUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.merchant.count({ where: { isActive: true } }),
    prisma.review.count({ where: { status: 'approved' } }),
    prisma.review.count({ where: { status: 'pending' } }),
    prisma.report.count({ where: { status: 'pending' } }),
    prisma.review.count({ where: { riskLevel: { in: ['high', 'critical'] } } }),
    prisma.review.count({
      where: {
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
    prisma.user.count({
      where: {
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    }),
  ])

  // 风险分布
  const riskDistribution = await prisma.review.groupBy({
    by: ['riskLevel'],
    _count: true,
  })

  return NextResponse.json({
    totalUsers,
    totalMerchants,
    totalReviews,
    pendingReviews,
    pendingReports,
    highRiskReviews,
    todayReviews,
    todayUsers,
    riskDistribution: riskDistribution.map((r) => ({
      level: r.riskLevel,
      count: r._count,
    })),
  })
}
