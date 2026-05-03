import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/auth'

// POST /api/reports - 提交举报
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 })
    }

    const { reviewId, reason, description } = await req.json()

    if (!reviewId || !reason) {
      return NextResponse.json({ error: '评价ID和举报原因为必填项' }, { status: 400 })
    }

    // 检查是否已举报过
    const existing = await prisma.report.findFirst({
      where: {
        userId: user.id,
        reviewId,
        status: 'pending',
      },
    })
    if (existing) {
      return NextResponse.json({ error: '你已举报过该评价，请等待处理' }, { status: 409 })
    }

    const report = await prisma.report.create({
      data: {
        userId: user.id,
        reviewId,
        reason,
        description: description || '',
      },
    })

    return NextResponse.json(report, { status: 201 })
  } catch (error) {
    console.error('举报失败:', error)
    return NextResponse.json({ error: '举报失败' }, { status: 500 })
  }
}
